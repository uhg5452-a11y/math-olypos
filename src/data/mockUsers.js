// Mock Users: Student Accounts & 2 Designated Admin Whitelist Accounts
// โรงเรียนบรรหารแจ่มใสวิทยา 3

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
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    badge: 'Head Admin & Creator'
  },
  {
    id: 'admin_2',
    email: 'pongkunkalapukdee@gmail.com',
    password: 'math14',
    name: 'นายปองคุณ กาฬภักดี',
    role: 'admin',
    avatar: '👨‍🏫',
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    badge: 'Tournament Director & Creator'
  }
];

// Teacher / Arbiter Whitelist for โรงเรียนบรรหารแจ่มใสวิทยา 3
export const TEACHER_WHITELIST = [
  'teacher.math@banhan3.ac.th',
  'teacher.math@banharn3.ac.th',
  'arbiter@banharn3.ac.th',
  'math.supervisor@banharn3.ac.th'
];

export const INITIAL_TEACHERS = [
  {
    id: 'teacher_1',
    email: 'teacher.math@banhan3.ac.th',
    password: 'teacher math',
    name: 'ครูกลุ่มสาระฯ คณิตศาสตร์',
    role: 'teacher',
    avatar: '👨‍🏫',
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    badge: 'Teacher Supervisor & Match Arbiter'
  },
  {
    id: 'teacher_1_alias',
    email: 'teacher.math@banharn3.ac.th',
    password: 'teacher math',
    name: 'ครูกลุ่มสาระฯ คณิตศาสตร์ (สำรอง)',
    role: 'teacher',
    avatar: '👨‍🏫',
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    badge: 'Teacher Supervisor & Match Arbiter'
  },
  {
    id: 'teacher_2',
    email: 'arbiter@banharn3.ac.th',
    password: 'teacher math',
    name: 'คณะกรรมการผู้ตัดสินกลาง',
    role: 'teacher',
    avatar: '👩‍🏫',
    school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
    badge: 'Chief Arbiter'
  }
];

// Student Database for โรงเรียนบรรหารแจ่มใสวิทยา 3
// Populated by real students who register their student ID and private PIN in the school system
export const INITIAL_STUDENTS = [];
