import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { Server } from 'socket.io';

function socketIoPlugin() {
  return {
    name: 'socket-io-realtime-plugin',
    configureServer(server) {
      if (!server.httpServer) return;

      const io = new Server(server.httpServer, {
        cors: {
          origin: '*',
          methods: ['GET', 'POST']
        }
      });

      // In-memory room state storage
      const roomStates = new Map();

      io.on('connection', (socket) => {
        console.log(`⚡ [Socket.IO] Client connected: ${socket.id}`);

        socket.on('join_room', ({ roomId, role, userInfo }) => {
          socket.join(roomId);
          console.log(`[Socket.IO] Client ${socket.id} joined ${roomId} as ${role}`);

          // If room state exists, send it to the newly joined player
          if (roomStates.has(roomId)) {
            socket.emit('room_sync_state', {
              roomId,
              state: roomStates.get(roomId)
            });
          }

          // Notify other participants in the room
          socket.to(roomId).emit('room_event', {
            roomId,
            eventType: 'user_joined',
            payload: { socketId: socket.id, role, userInfo, timestamp: Date.now() },
            senderId: socket.id
          });
        });

        socket.on('leave_room', ({ roomId }) => {
          socket.leave(roomId);
          console.log(`[Socket.IO] Client ${socket.id} left room ${roomId}`);
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

          // Cache critical game state updates
          if (['amath_turn', 'board_move', 'game_started', 'match_control'].includes(eventType)) {
            const current = roomStates.get(roomId) || {};
            roomStates.set(roomId, { ...current, ...payload, lastUpdated: Date.now() });
          }

          // Broadcast to everyone in the room except sender
          socket.to(roomId).emit('room_event', data);
        });

        socket.on('disconnect', () => {
          console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
        });
      });
    }
  };
}

export default defineConfig({
  plugins: [react(), socketIoPlugin()],
  server: {
    host: true, // Listen on all network interfaces (LAN/WiFi)
    port: 3000,
    open: false
  }
});
