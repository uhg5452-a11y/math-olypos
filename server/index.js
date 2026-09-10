/**
 * Math Olympiad Hub - Node.js Backend Server
 * 
 * Supports REST API endpoints and Firebase Admin SDK integration.
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// In-memory or Firebase Firestore connector
console.log('Math Olympiad Hub Node.js API Service initializing...');

// Designated 2 Admin Credentials
const AUTHORIZED_ADMINS = [
  {
    email: 'uhg5452@gmail.com',
    password: 'math21',
    name: 'น.ส. สุจารี สุขีวงศ์',
    role: 'Head Admin'
  },
  {
    email: 'pongkunkalapukdee@gmail.com',
    password: 'math14',
    name: 'นายปองคุณ กาฬภักดี',
    role: 'Tournament Director'
  }
];

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), service: 'Math Olympiad Hub Backend' });
});

// Admin Authentication check (RBAC)
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

  return res.status(403).json({ error: 'Unauthorized: Account is not in the 2 permitted admin slots' });
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
    name: 'นักเรียนในโรงเรียน'
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
    school: school || 'โรงเรียนมัธยมวิทยาคม',
    grade: grade || 'มัธยมศึกษา'
  });
});

// Start Server if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Math Olympiad Hub API Server running on port ${PORT}`);
  });
}

export default app;
