/**
 * Real-time Multiplayer & Spectator Sync Service
 * โรงเรียนบรรหารแจ่มใสวิทยา 3
 * 
 * Supports:
 * 1. Socket.IO Client (Auto-detects Vite dev server on port 3000 or standalone port 5000)
 * 2. BroadcastChannel (Instant 0ms cross-window/tab testing)
 * 3. Firebase Realtime Database (Optional plug-in via FIREBASE_DB_URL)
 * 4. Room State synchronization with caching for newly joined players
 */

import { io } from 'socket.io-client';

class RealtimeService {
  constructor() {
    this.socket = null;
    this.broadcastChannel = null;
    this.listeners = new Map(); // eventKey -> Set(callbacks)
    this.currentRoom = null;
    this.roomRole = null;
    this.isConnected = false;
    this.connectionListeners = new Set();
    this.roomStateCache = new Map();

    this.init();
  }

  init() {
    // 1. Initialize BroadcastChannel for local cross-window/cross-tab sync
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('math_olympiad_banharn3_realtime');
        this.broadcastChannel.onmessage = (event) => {
          const { roomId, eventType, payload, senderId } = event.data || {};
          if (roomId && eventType) {
            this.notifyListeners(roomId, eventType, payload, senderId);
          }
        };
      } catch (err) {
        console.warn('BroadcastChannel not available:', err);
      }
    }

    // 2. Determine Socket Server URL
    if (typeof window !== 'undefined') {
      const customUrl = localStorage.getItem('MATH_REALTIME_SERVER_URL') || import.meta.env?.VITE_SOCKET_URL;
      const defaultUrl = window.location.port === '3000'
        ? window.location.origin
        : `http://${window.location.hostname}:3000`;

      const serverUrl = customUrl || defaultUrl;

      try {
        this.socket = io(serverUrl, {
          transports: ['websocket', 'polling'],
          reconnectionAttempts: 10,
          reconnectionDelay: 1000,
          timeout: 5000,
          autoConnect: true
        });

        this.socket.on('connect', () => {
          this.isConnected = true;
          console.log('⚡ [Realtime] Socket connected to:', serverUrl, 'ID:', this.socket.id);
          this.notifyConnectionState(true);

          if (this.currentRoom) {
            this.socket.emit('join_room', { roomId: this.currentRoom, role: this.roomRole });
          }
        });

        this.socket.on('disconnect', () => {
          this.isConnected = false;
          console.log('⚠️ [Realtime] Socket disconnected');
          this.notifyConnectionState(false);
        });

        this.socket.on('connect_error', (err) => {
          // Fallback to standalone port 5000 if 3000 failed and not explicitly configured
          if (!customUrl && serverUrl.includes(':3000')) {
            console.log('Trying fallback to port 5000...');
            this.socket.io.uri = `http://${window.location.hostname}:5000`;
            this.socket.connect();
          }
        });

        // Room event from other clients
        this.socket.on('room_event', ({ roomId, eventType, payload, senderId }) => {
          this.notifyListeners(roomId, eventType, payload, senderId);
        });

        // Initial room state sync
        this.socket.on('room_sync_state', ({ roomId, state }) => {
          if (roomId && state) {
            this.roomStateCache.set(roomId, state);
            this.notifyListeners(roomId, 'room_state_synced', state, 'server');
          }
        });

      } catch (err) {
        console.warn('[Realtime] Socket init warning:', err);
      }
    }
  }

  onConnectionChange(cb) {
    this.connectionListeners.add(cb);
    cb(this.isConnected);
    return () => this.connectionListeners.delete(cb);
  }

  notifyConnectionState(connected) {
    this.connectionListeners.forEach(cb => cb(connected));
  }

  // Join a match room (e.g. 'AM-202', 'M101')
  joinRoom(roomId, role = 'spectator', userInfo = {}) {
    this.currentRoom = roomId;
    this.roomRole = role;

    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { roomId, role, userInfo });
    }

    // Local broadcast
    this.sendEvent(roomId, 'user_joined', { role, userInfo, timestamp: Date.now() });
  }

  leaveRoom(roomId) {
    if (this.socket && this.socket.connected) {
      this.socket.emit('leave_room', { roomId });
    }
    if (this.currentRoom === roomId) {
      this.currentRoom = null;
      this.roomRole = null;
    }
  }

  // Send real-time game action
  sendEvent(roomId, eventType, payload) {
    const senderId = this.socket?.id || 'client_' + Math.random().toString(36).slice(2, 8);
    const data = { roomId, eventType, payload, senderId, timestamp: Date.now() };

    // Broadcast locally across tabs/windows (0ms latency)
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (e) {
        console.warn('BroadcastChannel error:', e);
      }
    }

    // Send to remote Socket server
    if (this.socket && this.socket.connected) {
      this.socket.emit('room_event', data);
    }

    // Optional Firebase Realtime DB sync
    const firebaseDbUrl = typeof window !== 'undefined' ? localStorage.getItem('FIREBASE_DB_URL') : null;
    if (firebaseDbUrl) {
      try {
        fetch(`${firebaseDbUrl.replace(/\/$/, '')}/rooms/${roomId}/latest.json`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        }).catch(() => {});
      } catch (err) {
        // Ignore firebase fetch error
      }
    }

    // Notify current window listeners
    this.notifyListeners(roomId, eventType, payload, senderId);
  }

  // Subscribe to real-time events for a room
  subscribe(roomId, eventType, callback) {
    const key = `${roomId}:${eventType}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // If cached state exists for room_state_synced, immediately notify
    if (eventType === 'room_state_synced' && this.roomStateCache.has(roomId)) {
      setTimeout(() => callback(this.roomStateCache.get(roomId), 'cache'), 0);
    }

    return () => {
      const set = this.listeners.get(key);
      if (set) {
        set.delete(callback);
        if (set.size === 0) this.listeners.delete(key);
      }
    };
  }

  notifyListeners(roomId, eventType, payload, senderId) {
    const key = `${roomId}:${eventType}`;
    const specificListeners = this.listeners.get(key);
    if (specificListeners) {
      specificListeners.forEach((cb) => {
        try {
          cb(payload, senderId);
        } catch (err) {
          console.error('Error in realtime callback:', err);
        }
      });
    }

    const wildcardKey = `${roomId}:*`;
    const wildcardListeners = this.listeners.get(wildcardKey);
    if (wildcardListeners) {
      wildcardListeners.forEach((cb) => {
        try {
          cb(eventType, payload, senderId);
        } catch (err) {
          console.error('Error in wildcard realtime callback:', err);
        }
      });
    }
  }
}

export const realtimeService = new RealtimeService();
