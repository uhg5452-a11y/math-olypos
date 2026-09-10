/**
 * Real-time Multiplayer & Spectator Sync Service
 * 
 * Supports:
 * 1. Socket.IO Client (for 2 separate devices across network)
 * 2. BroadcastChannel (for instant 0ms cross-window/tab testing)
 * 3. Event pub/sub listeners for React components
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

    this.init();
  }

  init() {
    // 1. Initialize BroadcastChannel for cross-window zero-delay synchronization
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

    // 2. Initialize Socket.IO connection for cross-device networking
    try {
      const serverUrl = import.meta.env?.VITE_SOCKET_URL ||
        (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000');

      this.socket = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1500,
        timeout: 5000,
        autoConnect: true
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('⚡ Realtime Socket connected:', this.socket.id);
        if (this.currentRoom) {
          this.socket.emit('join_room', { roomId: this.currentRoom, role: this.roomRole });
        }
      });

      this.socket.on('disconnect', () => {
        this.isConnected = false;
        console.log('Realtime Socket disconnected');
      });

      this.socket.on('room_event', ({ roomId, eventType, payload, senderId }) => {
        this.notifyListeners(roomId, eventType, payload, senderId);
      });
    } catch (err) {
      console.warn('Socket.IO init warning:', err);
    }
  }

  // Join a competition match room (e.g. 'M101', 'M401')
  joinRoom(roomId, role = 'spectator', userInfo = {}) {
    this.currentRoom = roomId;
    this.roomRole = role;

    if (this.socket && this.socket.connected) {
      this.socket.emit('join_room', { roomId, role, userInfo });
    }

    // Notify local channel
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

  // Send real-time game action (e.g. piece move, equation tile placement, speed answer, cheer message)
  sendEvent(roomId, eventType, payload) {
    const senderId = this.socket?.id || 'client_' + Math.random().toString(36).slice(2, 8);
    const data = { roomId, eventType, payload, senderId, timestamp: Date.now() };

    // Broadcast locally across tabs/windows
    if (this.broadcastChannel) {
      try {
        this.broadcastChannel.postMessage(data);
      } catch (e) {
        console.warn('BroadcastChannel send error:', e);
      }
    }

    // Send to remote Socket server
    if (this.socket && this.socket.connected) {
      this.socket.emit('room_event', data);
    }

    // Trigger local listeners in current window too
    this.notifyListeners(roomId, eventType, payload, senderId);
  }

  // Subscribe to real-time events for a room
  subscribe(roomId, eventType, callback) {
    const key = `${roomId}:${eventType}`;
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(callback);

    // Return unsubscribe function
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

    // Also notify wildcard listeners for the room
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
