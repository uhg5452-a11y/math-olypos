/**
 * Math Olympiad Hub - Node.js Realtime Socket.IO Server
 * โรงเรียนบรรหารแจ่มใสวิทยา 3
 * 
 * Pure Node.js HTTP + Socket.IO (No external express/cors required)
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Server } from 'socket.io';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5000;

// Centralized Room State in Memory
const roomStates = new Map();

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Health API
  if (req.url === '/api/health') {
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({
      status: 'ok',
      school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
      service: 'Math Olympiad Hub Realtime Server',
      activeRooms: roomStates.size,
      time: new Date().toISOString()
    }));
    return;
  }

  // Default landing page
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <html>
      <body style="font-family: sans-serif; background: #0B192C; color: #fff; padding: 40px; text-align: center;">
        <h1 style="color: #008DDA;">Math Olympiad Hub - Realtime Server</h1>
        <p>โรงเรียนบรรหารแจ่มใสวิทยา 3</p>
        <p style="color: #4ade80;">🟢 Socket.IO WebSocket Server is running on port ${PORT}</p>
        <p>Active Match Rooms: ${roomStates.size}</p>
      </body>
    </html>
  `);
});

// Setup Socket.IO Server
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log(`⚡ [Standalone Server] Client connected: ${socket.id}`);

  // Join match room
  socket.on('join_room', ({ roomId, role, userInfo }) => {
    socket.join(roomId);
    console.log(`Client ${socket.id} joined room ${roomId} as ${role}`);

    // If room state exists, send current state to newly joined client
    if (roomStates.has(roomId)) {
      socket.emit('room_sync_state', {
        roomId,
        state: roomStates.get(roomId)
      });
    }

    // Notify other room participants
    socket.to(roomId).emit('room_event', {
      roomId,
      eventType: 'user_joined',
      payload: { socketId: socket.id, role, userInfo, timestamp: Date.now() },
      senderId: socket.id
    });
  });

  // Leave room
  socket.on('leave_room', ({ roomId }) => {
    socket.leave(roomId);
    console.log(`Client ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit('room_event', {
      roomId,
      eventType: 'user_left',
      payload: { socketId: socket.id, timestamp: Date.now() },
      senderId: socket.id
    });
  });

  // Broadcast game actions and sync state
  socket.on('room_event', (data) => {
    const { roomId, eventType, payload } = data;
    if (!roomId) return;

    // Cache game state updates
    if (['amath_turn', 'board_move', 'game_started', 'match_control'].includes(eventType)) {
      const current = roomStates.get(roomId) || {};
      roomStates.set(roomId, { ...current, ...payload, lastUpdated: Date.now() });
    }

    // Broadcast to everyone else in the room
    socket.to(roomId).emit('room_event', data);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

server.listen(PORT, () => {
  console.log(`⚡ Math Olympiad Hub Realtime Server running on port ${PORT}`);
  console.log(`School: โรงเรียนบรรหารแจ่มใสวิทยา 3`);
});
