/**
 * Math Olympiad Hub - Node.js Backend & Realtime Socket.IO Server
 * โรงเรียนบรรหารแจ่มใสวิทยา 3
 * 
 * Supports:
 * 1. REST API endpoints (Auth, Tournament, Leaderboard)
 * 2. Real-time WebSocket / Socket.IO Server for 2-Player Match & Live Spectators
 */

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Setup Socket.IO Server with CORS
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Designated 2 Creator Admin Whitelist Credentials
const AUTHORIZED_ADMINS = [
  {
    email: 'uhg5452@gmail.com',
    password: 'math21',
    name: 'น.ส. สุจารี สุขีวงศ์',
    role: 'Head Admin & Creator'
  },
  {
    email: 'pongkunkalapukdee@gmail.com',
    password: 'math14',
    name: 'นายปองคุณ กาฬภักดี',
    role: 'Tournament Director & Creator'
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    time: new Date().toISOString(),
    service: 'Math Olympiad Hub Realtime Server',
    connectedSockets: io.engine.clientsCount
  });
});

// Admin Authentication check (Strict Whitelist)
app.post('/api/auth/admin-login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const cleanEmail = email.trim().toLowerCase();
  const admin = AUTHORIZED_ADMINS.find(
    a => a.email.toLowerCase() === cleanEmail && a.password === password
  );

  if (admin) {
    return res.json({
      success: true,
      role: 'admin',
      email: admin.email,
      name: admin.name
    });
  }

  return res.status(403).json({ error: 'Unauthorized: Account is not in the 2 whitelisted creator accounts' });
});

// Student Login with Private PIN
app.post('/api/auth/student-login', (req, res) => {
  const { studentId, privatePin } = req.body;
  if (!studentId || !privatePin) {
    return res.status(400).json({ error: 'Student ID and Private PIN required' });
  }

  return res.json({
    success: true,
    role: 'student',
    studentId: studentId.toUpperCase(),
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    name: 'นักเรียนโรงเรียนบรรหารแจ่มใสวิทยา 3'
  });
});

// Student Registration (Onboarding for all school students)
app.post('/api/auth/student-register', (req, res) => {
  const { studentId, name, school, grade, privatePin } = req.body;
  if (!studentId || !name || !privatePin) {
    return res.status(400).json({ error: 'Student ID, Name, and Private PIN required' });
  }

  return res.json({
    success: true,
    role: 'student',
    studentId: studentId.toUpperCase(),
    name,
    school: school || 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    grade: grade || 'มัธยมศึกษา'
  });
});

// --- Realtime WebSocket / Socket.IO Handling ---
io.on('connection', (socket) => {
  console.log(`⚡ Client connected: ${socket.id}`);

  // Join match room
  socket.on('join_room', ({ roomId, role, userInfo }) => {
    socket.join(roomId);
    console.log(`Socket ${socket.id} joined room ${roomId} as ${role}`);

    // Notify room of new participant
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
    console.log(`Socket ${socket.id} left room ${roomId}`);
    socket.to(roomId).emit('room_event', {
      roomId,
      eventType: 'user_left',
      payload: { socketId: socket.id, timestamp: Date.now() },
      senderId: socket.id
    });
  });

  // Broadcast game actions (moves, captures, score, chat cheers) to all others in the room
  socket.on('room_event', (data) => {
    const { roomId } = data;
    if (roomId) {
      socket.to(roomId).emit('room_event', data);
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

// Start Server
if (process.env.NODE_ENV !== 'test') {
  server.listen(PORT, () => {
    console.log(`Math Olympiad Hub API & Socket.IO Server running on port ${PORT}`);
    console.log(`School: โรงเรียนบรรหารแจ่มใสวิทยา 3`);
  });
}

export default app;
