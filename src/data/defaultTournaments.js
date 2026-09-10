// Initial Tournaments & Competition Rounds Data - ขอบเขตการแข่งขันคณิตศาสตร์ภายในโรงเรียนบรรหารแจ่มใสวิทยา 3 (Intramural School Competition)

export const INITIAL_TOURNAMENTS = [
  {
    id: 'tourney-1',
    title: 'การแข่งขันเอแมทชิงแชมป์ภายในโรงเรียนบรรหารแจ่มใสวิทยา 3 ประจำปี 2569',
    subTitle: 'การแข่งขันสมการอักษรไขว้รอบคัดเลือกตัวแทนระดับชั้น (Banharn 3 School A-Math Championship)',
    category: 'a-math',
    categoryName: 'เอแมท (A-Math)',
    roundName: 'รอบคัดเลือกตัวแทนห้อง (School Qualifying Round)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-blue-600 to-indigo-900',
    startDate: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    maxParticipants: 48,
    registeredStudents: ['STU-2026-001', 'STU-2026-002'],
    description: 'การแข่งขันวางสมการคณิตศาสตร์ชิงถ้วยเกียรติยศผู้อำนวยการโรงเรียนบรรหารแจ่มใสวิทยา 3 และคัดเลือกตัวแทนนักเรียนเข้าสู่ชุมนุมคณิตศาสตร์ แข่งขัน 3 กระดาน',
    rules: [
      'การแข่งขันสำหรับนักเรียนทุกคนในโรงเรียนบรรหารแจ่มใสวิทยา 3 (ม.1 - ม.6)',
      'เวลาคิดต่อกระดาน: 20 นาที (ฝ่ายละ 10 นาที)',
      'ห้ามใช้เครื่องคิดเลขหรืออุปกรณ์อิเล็กทรอนิกส์ช่วยคำนวณ',
      'หากวางสมการผิดหลักคณิตศาสตร์ หักคะแนน 10 แต้มและเสียตาเดิน'
    ],
    prizes: 'ถ้วยเกียรติยศผู้อำนวยการโรงเรียนบรรหารแจ่มใสวิทยา 3 + ทุนการศึกษาของโรงเรียน 5,000 บาท + เกียรติบัตร',
    matches: [
      {
        matchId: 'M101',
        tableNo: 1,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์ (ม.5/1)', score: 385 },
        player2: { id: 'STU-2026-002', name: 'กานต์รวี เจริญศิลป์ (ม.6/2)', score: 412 },
        winner: 'STU-2026-002',
        status: 'finished',
        roomStatus: 'closed'
      },
      {
        matchId: 'M102',
        tableNo: 2,
        player1: { id: 'STU-2026-003', name: 'ภูริณัฐ ธนกิจโกศล (ม.4/5)', score: 290 },
        player2: { id: 'STU-2026-004', name: 'ชลิตา วัฒนกุล (ม.5/3)', score: 310 },
        winner: 'STU-2026-004',
        status: 'finished',
        roomStatus: 'closed'
      },
      {
        matchId: 'M103',
        tableNo: 3,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์ (ม.5/1)', score: null },
        player2: { id: 'STU-2026-003', name: 'ภูริณัฐ ธนกิจโกศล (ม.4/5)', score: null },
        winner: null,
        status: 'upcoming',
        roomStatus: 'ready'
      }
    ]
  },
  {
    id: 'tourney-2',
    title: 'การแข่งขันซูโดกุประลองปัญญา โรงเรียนบรรหารแจ่มใสวิทยา 3',
    subTitle: 'ซูโดกุประลองความไวและตรรกศาสตร์ขั้นสูง ชิงแชมป์ประจำระดับชั้น',
    category: 'sudoku',
    categoryName: 'ซูโดกุ (Sudoku)',
    roundName: 'รอบ 16 คนสุดท้ายระดับโรงเรียน (School Round of 16)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-emerald-600 to-teal-900',
    startDate: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 105 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    maxParticipants: 32,
    registeredStudents: ['STU-2026-001'],
    description: 'การแข่งขันแก้ปริศนาซูโดกุระดับตัวแทนห้องเรียน แข่งขันความเร็วและความแม่นยำเพื่อชิงตำแหน่งแชมป์ตรรกะประจำโรงเรียนบรรหารแจ่มใสวิทยา 3',
    rules: [
      'การแข่งขันสำหรับนักเรียนทุกคนในโรงเรียนบรรหารแจ่มใสวิทยา 3',
      'โจทย์ตาราง 9x9 ระดับมาตรฐานการประลองภายในโรงเรียน',
      'จับเวลา 15 นาทีต่อตาราง ทำผิดเกิน 3 ครั้งปรับแพ้ในกระดานนั้น'
    ],
    prizes: 'เหรียญทองเกียรติยศโรงเรียนบรรหารแจ่มใสวิทยา 3 + เกียรติบัตรเรียนดีกลุ่มสาระคณิตศาสตร์',
    matches: [
      {
        matchId: 'M201',
        tableNo: 1,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์ (ม.5/1)', score: 980 },
        player2: { id: 'STU-2026-005', name: 'ณภัทร สิริโชค (ม.3/1)', score: 850 },
        winner: 'STU-2026-001',
        status: 'finished',
        roomStatus: 'closed'
      }
    ]
  },
  {
    id: 'tourney-3',
    title: 'หมากฮอสคณิตตรรกะ สัปดาห์วันวิชาการ บ.จ.ว.๓',
    subTitle: 'ประลองกลยุทธ์หมากฮอสไทยขั้นเซียน ชิงถ้วยครูกลุ่มสาระคณิตศาสตร์',
    category: 'checkers',
    categoryName: 'หมากฮอส (Thai Checkers)',
    roundName: 'รอบชิงชนะเลิศระดับโรงเรียน (School Championship Finals)',
    status: 'closed',
    isRegistrationOpen: false,
    bannerColor: 'from-amber-600 to-orange-950',
    startDate: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 300 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    maxParticipants: 16,
    registeredStudents: ['STU-2026-002', 'STU-2026-003'],
    description: 'สุดยอดการประลองกลยุทธ์กระดาน 8x8 กติกาหมากฮอสไทยแท้ (เบี้ยเดินหน้าอย่างเดียว / ฮอสเดินและกินยาวทางไกล ซิงค์ 2 เครื่องสด)',
    rules: [
      'กติกาหมากฮอสไทย: ตัวหมากปกติห้ามเดินและห้ามกินถอยหลัง, ตัวฮอสเดินและกินยาวทางไกลได้',
      'เวลาฝ่ายละ 10 นาทีต่อกระดาน แข่งขัน 3 ใน 5 กระดาน'
    ],
    prizes: 'ถ้วยเกียรติยศสัปดาห์วันวิชาการ + เกียรติบัตรนักวางแผนกลยุทธ์ยอดเยี่ยม',
    matches: []
  },
  {
    id: 'tourney-4',
    title: 'คิดเลขเร็วสายฟ้าแลบ ชิงแชมป์โรงเรียนบรรหารแจ่มใสวิทยา 3',
    subTitle: 'ท้าประลองคิดเลขเร็วสายฟ้าแลบ 60 วินาที ชิงตำแหน่งนักคิดไวประจำโรงเรียน',
    category: 'speed-math',
    categoryName: 'คิดเลขเร็ว (Speed Math)',
    roundName: 'รอบถ่ายทอดสดกำลังแข่งขัน (Live School Match)',
    status: 'live',
    isRegistrationOpen: false,
    bannerColor: 'from-cyan-600 to-blue-900',
    startDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
    maxParticipants: 60,
    registeredStudents: ['STU-2026-001', 'STU-2026-002', 'STU-2026-003'],
    description: 'การแข่งขันสปีดแมทโจทย์สด 40 ข้อ เปิดระบบรับชมการแข่งขันสด (Spectator Mode) และจอแสดงผลกลาง (Arena Display) ให้นักเรียนทั้งโรงเรียนร่วมเชียร์',
    rules: [
      'โจทย์ 40 ข้อต่อเนื่อง จับเวลารวม 60 วินาที',
      'ระบบคอมโบ Streak คูณคะแนนต่อเนื่อง ซิงค์คะแนนเรียลไทม์'
    ],
    prizes: 'เหรียญทองคิดเลขเร็วโรงเรียนบรรหารแจ่มใสวิทยา 3 + สิทธิ์เป็นตัวแทนโรงเรียน',
    matches: [
      {
        matchId: 'M401',
        tableNo: 1,
        player1: { id: 'STU-2026-001', name: 'วรเมธ ปัญญาวงศ์ (ม.5/1)', score: 280 },
        player2: { id: 'STU-2026-002', name: 'กานต์รวี เจริญศิลป์ (ม.6/2)', score: 310 },
        winner: null,
        status: 'live',
        roomStatus: 'live'
      },
      {
        matchId: 'M402',
        tableNo: 2,
        player1: { id: 'STU-2026-003', name: 'ภูริณัฐ ธนกิจโกศล (ม.4/5)', score: 190 },
        player2: { id: 'STU-2026-004', name: 'ชลิตา วัฒนกุล (ม.5/3)', score: 205 },
        winner: null,
        status: 'live',
        roomStatus: 'live'
      }
    ]
  },
  {
    id: 'tourney-5',
    title: 'เกม 24 ชุมนุมคณิตศาสตร์ โรงเรียนบรรหารแจ่มใสวิทยา 3',
    subTitle: 'เกม 24 ประจำสัปดาห์ พิชิตตัวเลข 4 ตัว',
    category: 'make-24',
    categoryName: 'เกม 24 (Make 24)',
    roundName: 'รอบเก็บคะแนนชุมนุม (Club Weekly Round)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-purple-600 to-violet-950',
    startDate: new Date(Date.now() + 360 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 480 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 300 * 60 * 1000).toISOString(),
    maxParticipants: 50,
    registeredStudents: [],
    description: 'ผสมตัวเลข 4 ตัวด้วย +, -, *, /, ( ) ให้ได้ผลลัพธ์เท่ากับ 24 จัดโดยชุมนุมคณิตศาสตร์โรงเรียนบรรหารแจ่มใสวิทยา 3',
    rules: [
      'ใช้ตัวเลขครบ 4 ตัว ตัวละ 1 ครั้งเท่านั้น',
      'ตอบถูกได้ 10 แต้ม และมีโบนัสความเร็ว'
    ],
    prizes: 'เกียรติบัตรระดับเหรียญทองของชุมนุมคณิตศาสตร์ + แต้มสะสมคะแนนกิจกรรมโรงเรียน',
    matches: []
  },
  {
    id: 'tourney-6',
    title: 'จินตคณิตคิดเลขเร็วกลางอากาศ โรงเรียนบรรหารแจ่มใสวิทยา 3',
    subTitle: 'ประลองจินตคณิตรวมตัวเลขในใจ ชิงแชมป์ระดับโรงเรียน',
    category: 'flash-anzan',
    categoryName: 'จินตคณิต (Flash Anzan)',
    roundName: 'รอบรองชนะเลิศระดับโรงเรียน (School Semifinals)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-rose-600 to-pink-950',
    startDate: new Date(Date.now() + 600 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 720 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 540 * 60 * 1000).toISOString(),
    maxParticipants: 30,
    registeredStudents: ['STU-2026-002'],
    description: 'ตัวเลขแฟลชกะพริบกลางอากาศ 0.5 วินาที รวมผลลัพธ์ในใจอย่างแม่นยำ',
    rules: [
      'ห้ามใช้กระดาษทด คำนวณในใจเท่านั้น',
      'กรอกคำตอบภายใน 5 วินาทีหลังจากแสดงตัวเลขเสร็จ'
    ],
    prizes: 'ถ้วยเกียรติยศยอดนักคำนวณในใจประจำโรงเรียนบรรหารแจ่มใสวิทยา 3 + เกียรติบัตร',
    matches: []
  }
];
