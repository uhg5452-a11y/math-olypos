// Initial Tournaments & Competition Rounds Data

export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourney-1',
    title: 'Thailand National A-Math Grand Prix 2026',
    subTitle: 'การแข่งขันสมการอักษรไขว้ระดับประเทศ ประจำปี 2026',
    category: 'a-math',
    categoryName: 'เอแมท (A-Math)',
    roundName: 'รอบคัดเลือกระดับภาค (Round 1 - Qualifying)',
    status: 'open', // open, closed, live, ended
    isRegistrationOpen: true,
    bannerColor: 'from-blue-600 to-indigo-900',
    startDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Starts in 15 mins for notification demo!
    endDate: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    maxParticipants: 64,
    registeredStudents: ['STU-2026-001', 'STU-2026-002'],
    description: 'การแข่งขันวางสมการตัวเลขชิงถ้วยพระราชทานและคะแนนสะสมคัดเลือกตัวแทนโอลิมปิก แข่งขัน 3 กระดาน ระบบ Swiss System',
    rules: [
      'เวลาคิดต่อกระดาน: 25 นาที (ฝ่ายละ 12.5 นาที)',
      'ห้ามใช้เครื่องคิดเลขหรืออุปกรณ์อิเล็กทรอนิกส์เสริม',
      'หากวางสมการผิดหลักคณิตศาสตร์ หักคะแนน 10 แต้มและเสียตาเดิน'
    ],
    prizes: 'ถ้วยเกียรติยศ + ทุนการศึกษา 15,000 บาท + ประกาศนียบัตร สพฐ.',
    matches: [
      {
        matchId: 'M101',
        tableNo: 1,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์', score: 385 },
        player2: { id: 'STU-2026-002', name: 'กานต์รวี เจริญศิลป์', score: 412 },
        winner: 'STU-2026-002',
        status: 'finished',
        roomStatus: 'closed'
      },
      {
        matchId: 'M102',
        tableNo: 2,
        player1: { id: 'STU-2026-003', name: 'ภูริณัฐ ธนกิจโกศล', score: 290 },
        player2: { id: 'STU-2026-004', name: 'ชลิตา วัฒนกุล', score: 310 },
        winner: 'STU-2026-004',
        status: 'finished',
        roomStatus: 'closed'
      },
      {
        matchId: 'M103',
        tableNo: 3,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์', score: null },
        player2: { id: 'STU-2026-003', name: 'ภูริณัฐ ธนกิจโกศล', score: null },
        winner: null,
        status: 'upcoming',
        roomStatus: 'ready'
      }
    ]
  },
  {
    id: 'tourney-2',
    title: 'Sudoku Masters Olympiad Cup: High Speed Division',
    subTitle: 'ซูโดกุประลองความไวและตรรกศาสตร์ขั้นสูง',
    category: 'sudoku',
    categoryName: 'ซูโดกุ (Sudoku)',
    roundName: 'รอบ 16 คนสุดท้าย (Round 2 - Elimination)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-emerald-600 to-teal-900',
    startDate: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    maxParticipants: 32,
    registeredStudents: ['STU-2026-001'],
    description: 'การแข่งขันแก้ปริศนาซูโดกุระดับ Hard และ Evil แข่งขันความเร็วและความแม่นยำ ผู้ที่ทำผิดเกิน 3 ครั้งจะถูกปรับแพ้ในกระดานนั้น',
    rules: [
      'โจทย์ความยากระดับ Olympiad Hard 9x9',
      'จับเวลา 15 นาทีต่อตาราง',
      'คะแนนคิดจากความเร็ว x ความถูกต้อง'
    ],
    prizes: 'เหรียญทองเกียรติยศ + สิทธิ์เข้าร่วมค่ายโอลิมปิกวิชาการ',
    matches: [
      {
        matchId: 'M201',
        tableNo: 1,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์', score: 980 },
        player2: { id: 'STU-2026-005', name: 'ณภัทร สิริโชค', score: 850 },
        winner: 'STU-2026-001',
        status: 'finished',
        roomStatus: 'closed'
      }
    ]
  },
  {
    id: 'tourney-3',
    title: 'Thai Checkers Strategy Championship (หมากฮอสคณิตตรรกะ)',
    subTitle: 'ประลองกลยุทธ์หมากฮอสไทยขั้นเซียน',
    category: 'checkers',
    categoryName: 'หมากฮอส (Thai Checkers)',
    roundName: 'รอบชิงชนะเลิศ (Championship Finals)',
    status: 'closed', // Admin closed this round
    isRegistrationOpen: false,
    bannerColor: 'from-amber-600 to-orange-950',
    startDate: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 300 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    maxParticipants: 16,
    registeredStudents: ['STU-2026-002', 'STU-2026-003'],
    description: 'สุดยอดการประลองกลยุทธ์กระดาน 8x8 ชิงไหวชิงพริบระดับประเทศ แข่งขัน 3 ใน 5 กระดาน',
    rules: [
      'กติกาหมากฮอสไทยมาตรฐานสากล',
      'เวลาฝ่ายละ 10 นาที (เดินบวกตาละ 3 วินาที)',
      'การกินเบี้ยและการเข้าฮอสตามธรรมเนียมไทย'
    ],
    prizes: 'ถ้วยเกียรติยศ + เงินรางวัล 20,000 บาท',
    matches: []
  },
  {
    id: 'tourney-4',
    title: 'All-Star Speed Math Sprint 60s',
    subTitle: 'ท้าประลองคิดเลขเร็วสายฟ้าแลบ 60 วินาที',
    category: 'speed-math',
    categoryName: 'คิดเลขเร็ว (Speed Math)',
    roundName: 'รอบเก็บคะแนนสะสมประจำสัปดาห์ (Weekly League #8)',
    status: 'live', // Currently in progress
    isRegistrationOpen: false,
    bannerColor: 'from-cyan-600 to-blue-900',
    startDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    maxParticipants: 100,
    registeredStudents: ['STU-2026-001', 'STU-2026-002', 'STU-2026-003'],
    description: 'การแข่งขันสปีดแมทโจทย์สด 40 ข้อ ใครเร็วที่สุดและแม่นยำที่สุดคือแชมป์ประจำสัปดาห์',
    rules: [
      'โจทย์ 40 ข้อต่อเนื่อง จับเวลารวม 60 วินาที',
      'Streak bonus ทวีคูณคะแนนเมื่อตอบถูกต่อเนื่อง'
    ],
    prizes: 'เหรียญดิจิทัล + คะแนน Elo +150',
    matches: []
  },
  {
    id: 'tourney-5',
    title: 'Olympiad Make 24 Challenge: Logic & Combinatorics',
    subTitle: 'เกม 24 โอลิมปิก พิชิตตัวเลข 4 ตัว',
    category: 'make-24',
    categoryName: 'เกม 24 (Make 24)',
    roundName: 'รอบคัดเลือกทั่วไป (Open Qualifying)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-purple-600 to-violet-950',
    startDate: new Date(Date.now() + 360 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 480 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 300 * 60 * 1000).toISOString(),
    maxParticipants: 50,
    registeredStudents: [],
    description: 'ผสมตัวเลข 4 ตัวด้วยเครื่องหมาย +, -, *, /, ( ) ให้ได้ผลลัพธ์ 24 ภายใน 30 วินาทีต่อข้อ',
    rules: [
      'ใช้ตัวเลขครบทั้ง 4 ตัว ตัวละ 1 ครั้งเท่านั้น',
      'ตอบถูกได้ 10 แต้ม โบนัสความเร็วสูงสุด 5 แต้ม'
    ],
    prizes: 'ประกาศนียบัตรระดับเหรียญทอง + สิทธิ์ตัวแทนโรงเรียน',
    matches: []
  },
  {
    id: 'tourney-6',
    title: 'National Flash Anzan & Mental Math Championship',
    subTitle: 'จินตคณิตคิดเลขเร็วกลางอากาศระดับชาติ',
    category: 'flash-anzan',
    categoryName: 'จินตคณิต (Flash Anzan)',
    roundName: 'รอบก่อนรองชนะเลิศ (Quarterfinals)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-rose-600 to-pink-950',
    startDate: new Date(Date.now() + 600 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 720 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 540 * 60 * 1000).toISOString(),
    maxParticipants: 30,
    registeredStudents: ['STU-2026-002'],
    description: 'ตัวเลขแฟลช 3-5 หลัก กะพริบเร็ว 0.5 วินาที จำนวน 10 จำนวน รวมผลลัพธ์ในใจอย่างแม่นยำ',
    rules: [
      'ห้ามใช้กระดาษทดหรือการขยับมือทดใดๆ',
      'คำนวณในใจและคีย์คำตอบภายใน 5 วินาทีหลังจบชุดตัวเลข'
    ],
    prizes: 'ถ้วยเกียรติยศนายกรัฐมนตรี + ทุนการศึกษา 25,000 บาท',
    matches: []
  }
];
