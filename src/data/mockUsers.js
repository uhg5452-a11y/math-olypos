// Mock Users: Student Accounts & 2 Designated Admin Whitelist Accounts

export const ADMIN_WHITELIST = [
  'uhg5452@gmail.com',
  'pongkunkalapukdee@gmail.com'
];

export const ADMIN_ACCOUNTS = [
  {
    id: 'admin_1',
    email: 'uhg5452@gmail.com',
    password: 'math21',
    name: 'น.ส. สุจารี สุขีวงศ์',
    role: 'admin',
    avatar: '👩‍🏫',
    badge: 'Head Admin & Creator'
  },
  {
    id: 'admin_2',
    email: 'pongkunkalapukdee@gmail.com',
    password: 'math14',
    name: 'นายปองคุณ กาฬภักดี',
    role: 'admin',
    avatar: '👨‍🏫',
    badge: 'Tournament Director & Creator'
  }
];

// Student Database supporting all school students with individual unique Private PINs
export const INITIAL_STUDENTS = [
  {
    id: 'student_1',
    studentId: 'STU-2026-001',
    privatePin: '1478', // Unique private PIN for student 1
    name: 'วรเมธ ปัญญาวงศ์',
    school: 'โรงเรียนเตรียมอุดมศึกษา',
    grade: 'มัธยมศึกษาปีที่ 5/1',
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
    privatePin: '2580', // Unique private PIN for student 2
    name: 'กานต์รวี เจริญศิลป์',
    school: 'โรงเรียนมหิดลวิทยานุสรณ์',
    grade: 'มัธยมศึกษาปีที่ 6/2',
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
    privatePin: '3691', // Unique private PIN for student 3
    name: 'ภูริณัฐ ธนกิจโกศล',
    school: 'โรงเรียนสวนกุหลาบวิทยาลัย',
    grade: 'มัธยมศึกษาปีที่ 4/5',
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
  },
  {
    id: 'student_4',
    studentId: 'STU-2026-004',
    privatePin: '4826', // Unique private PIN for student 4
    name: 'ชลิตา วัฒนกุล',
    school: 'โรงเรียนสามเสนวิทยาลัย',
    grade: 'มัธยมศึกษาปีที่ 5/3',
    role: 'student',
    elo: 1680,
    avatar: '👩‍🎓',
    registeredTournaments: ['tourney-1'],
    stats: {
      mathElo: 1680,
      totalMatches: 22,
      wins: 14,
      draws: 5,
      losses: 3,
      goldMedals: 2,
      silverMedals: 1,
      bronzeMedals: 1,
      practiceCompleted: 64
    }
  },
  {
    id: 'student_5',
    studentId: 'STU-2026-005',
    privatePin: '5937', // Unique private PIN for student 5
    name: 'ณภัทร สิริโชค',
    school: 'โรงเรียนบดินทรเดชา (สิงห์ สิงหเสนี)',
    grade: 'มัธยมศึกษาปีที่ 3/1',
    role: 'student',
    elo: 1620,
    avatar: '🧑‍🎓',
    registeredTournaments: [],
    stats: {
      mathElo: 1620,
      totalMatches: 19,
      wins: 12,
      draws: 3,
      losses: 4,
      goldMedals: 1,
      silverMedals: 2,
      bronzeMedals: 0,
      practiceCompleted: 52
    }
  }
];
