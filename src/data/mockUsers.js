// Mock Users: Student Accounts & 2 Designated Admin Accounts

export const ADMIN_ACCOUNTS = [
  {
    id: 'admin_1',
    email: 'uhg5452@gmail.com',
    password: 'math21',
    name: 'น.ส. สุจารี สุขีวงศ์',
    role: 'admin',
    avatar: '👩‍🏫',
    badge: 'Head Admin'
  },
  {
    id: 'admin_2',
    email: 'pongkunkalapukdee@gmail.com',
    password: 'math14',
    name: 'นายปองคุณ กาฬภักดี',
    role: 'admin',
    avatar: '👨‍🏫',
    badge: 'Tournament Director'
  }
];

export const INITIAL_STUDENTS = [
  {
    id: 'student_1',
    studentId: 'STU-2026-001',
    password: 'password123',
    name: 'วรเมธ ปัญญาวงศ์',
    school: 'โรงเรียนเตรียมอุดมศึกษา',
    grade: 'มัธยมศึกษาปีที่ 5',
    role: 'student',
    elo: 1850,
    avatar: '🧑‍🎓',
    registeredTournaments: ['tourney-1', 'tourney-2'],
    stats: {
      mathElo: 1850,
      totalMatches: 42,
      wins: 31,
      draws: 4,
      losses: 7,
      goldMedals: 3,
      silverMedals: 2,
      bronzeMedals: 1,
      practiceCompleted: 156
    }
  },
  {
    id: 'student_2',
    studentId: 'STU-2026-002',
    password: 'password123',
    name: 'กานต์รวี เจริญศิลป์',
    school: 'โรงเรียนมหิดลวิทยานุสรณ์',
    grade: 'มัธยมศึกษาปีที่ 6',
    role: 'student',
    elo: 1920,
    avatar: '👩‍🎓',
    registeredTournaments: ['tourney-1'],
    stats: {
      mathElo: 1920,
      totalMatches: 58,
      wins: 48,
      draws: 3,
      losses: 7,
      goldMedals: 5,
      silverMedals: 1,
      bronzeMedals: 0,
      practiceCompleted: 230
    }
  },
  {
    id: 'student_3',
    studentId: 'STU-2026-003',
    password: 'password123',
    name: 'ภูริณัฐ ธนกิจโกศล',
    school: 'โรงเรียนสวนกุหลาบวิทยาลัย',
    grade: 'มัธยมศึกษาปีที่ 4',
    role: 'student',
    elo: 1710,
    avatar: '🧑‍🎓',
    registeredTournaments: [],
    stats: {
      mathElo: 1710,
      totalMatches: 25,
      wins: 16,
      draws: 2,
      losses: 7,
      goldMedals: 1,
      silverMedals: 3,
      bronzeMedals: 2,
      practiceCompleted: 88
    }
  }
];
