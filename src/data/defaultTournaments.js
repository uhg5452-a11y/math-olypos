// Initial Tournaments & Competition Rounds Data - โรงเรียนบรรหารแจ่มใสวิทยา 3
// Clean separation between Junior Division (ม.ต้น: ม.1 - ม.3) and Senior Division (ม.ปลาย: ม.4 - ม.6)

export const INITIAL_TOURNAMENTS = [
  // 1. A-MATH JUNIOR (ม.ต้น)
  {
    id: 'tourney-amath-junior',
    title: 'เอแมทชิงแชมป์สาย ม.ต้น โรงเรียนบรรหารแจ่มใสวิทยา 3',
    subTitle: 'สมการอักษรไขว้รอบชิงชนะเลิศ ระดับมัธยมศึกษาตอนต้น (ม.1 - ม.3)',
    category: 'a-math',
    categoryName: 'เอแมท (A-Math)',
    division: 'junior',
    divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
    roundName: 'รอบชิงชนะเลิศ ม.ต้น (Junior Finals)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-blue-600 to-indigo-950',
    startDate: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 140 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    maxParticipants: 32,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'การแข่งขันวางสมการคณิตศาสตร์ 15x15 ชิงถ้วยเกียรติยศกลุ่มสาระฯ ระดับมัธยมศึกษาตอนต้น แข่งขันกติกามาตรฐานสมาคมฯ',
    rules: [
      'เฉพาะนักเรียนระดับชั้น ม.1 - ม.3 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'กระดาน 15x15 เริ่มต้นว่างเปล่า ตาแรกต้องผ่านจุดกึ่งกลางดาว ★',
      'เวลาคิดต่อแมตช์ 20 นาที ห้ามใช้เครื่องคิดเลขเด็ดขาด',
      'ผู้เข้าแข่งขันต้องรายงานตัวตรงเวลา หากสายเกิน 10 นาทีจะถูกตัดสิทธิ์ (Forfeit)'
    ],
    prizes: 'ถ้วยเกียรติยศ ม.ต้น + ทุนการศึกษา 3,000 บาท + เหรียญทองเกียรติยศ',
    matches: []
  },

  // 2. A-MATH SENIOR (ม.ปลาย) - Currently LIVE!
  {
    id: 'tourney-amath-senior',
    title: 'เอแมทชิงแชมป์สาย ม.ปลาย โรงเรียนบรรหารแจ่มใสวิทยา 3',
    subTitle: 'การแข่งขันสมการอักษรไขว้รอบถ่ายทอดสด ระดับมัธยมศึกษาตอนปลาย (ม.4 - ม.6)',
    category: 'a-math',
    categoryName: 'เอแมท (A-Math)',
    division: 'senior',
    divisionName: 'สาย ม.ปลาย (ม.4 - ม.6)',
    roundName: 'รอบแข่งขันสด (Senior Live Championship)',
    status: 'live',
    isRegistrationOpen: false,
    bannerColor: 'from-rose-600 via-orange-600 to-indigo-950',
    startDate: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    maxParticipants: 32,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'การประลองสมการอักษรไขว้ขั้นสูง 15x15 ระดับ ม.4 - ม.6 กำลังดำเนินแข่งขันสดในขณะนี้',
    rules: [
      'เฉพาะนักเรียนระดับชั้น ม.4 - ม.6 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'กระดาน 15x15 ว่างเปล่า กติกาคำนวณตัวคูณ 3E, 2E, 3P, 2P และดาว ★',
      'หากไม่มาแข่งขันตามกำหนดเวลา ระบบจะปรับเป็นตัดสิทธิ์ (Forfeit) ทันที'
    ],
    prizes: 'ถ้วยเกียรติยศผู้อำนวยการโรงเรียนบรรหารแจ่มใสวิทยา 3 + ทุนการศึกษา 5,000 บาท',
    matches: [
      {
        id: 'AM-LIVE-01',
        table: 1,
        player1: 'โต๊ะ A (ฝ่ายฟ้า)',
        player2: 'โต๊ะ B (ฝ่ายแดง)',
        status: 'live',
        score1: 42,
        score2: 38
      }
    ]
  },

  // 3. SUDOKU JUNIOR (ม.ต้น)
  {
    id: 'tourney-sudoku-junior',
    title: 'ซูโดกุตรรกะโอลิมปิก สาย ม.ต้น บ.จ.ว.๓',
    subTitle: 'ประลองความไวและตรรกศาสตร์ขั้นสูง ระดับมัธยมศึกษาตอนต้น (ม.1 - ม.3)',
    category: 'sudoku',
    categoryName: 'ซูโดกุ (Sudoku)',
    division: 'junior',
    divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
    roundName: 'รอบคัดเลือก ม.ต้น (Junior Qualifier)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-emerald-600 to-teal-950',
    startDate: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 110 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 35 * 60 * 1000).toISOString(),
    maxParticipants: 40,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'แข่งขันแก้ปริศนาซูโดกุ 9x9 ระดับแข่งขันจริง ไร้ระบบตัวช่วยบอกผิด วัดทักษะตรรกะแท้จริง',
    rules: [
      'สำหรับนักเรียน ม.1 - ม.3 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'โหมดแข่งขันจริง: ไม่มีระบบตรวจผิดหรือไฮไลท์สีแดง ผู้เข้าแข่งขันต้องตรวจทานด้วยตนเอง',
      'จับเวลากลาง 15 นาทีต่อตาราง'
    ],
    prizes: 'เหรียญทองซูโดกุ ม.ต้น + เกียรติบัตรยอดนักตรรกศาสตร์',
    matches: []
  },

  // 4. SUDOKU SENIOR (ม.ปลาย)
  {
    id: 'tourney-sudoku-senior',
    title: 'ซูโดกุมาสเตอร์คลาส สาย ม.ปลาย บ.จ.ว.๓',
    subTitle: 'ประลองโจทย์ซูโดกุระดับเข้มข้น ระดับมัธยมศึกษาตอนปลาย (ม.4 - ม.6)',
    category: 'sudoku',
    categoryName: 'ซูโดกุ (Sudoku)',
    division: 'senior',
    divisionName: 'สาย ม.ปลาย (ม.4 - ม.6)',
    roundName: 'รอบ 16 คนสุดท้าย ม.ปลาย (Senior Round of 16)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-cyan-600 to-blue-950',
    startDate: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 135 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    maxParticipants: 32,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'ประลองโจทย์ซูโดกุระดับยากสำหรับพี่ ม.ปลาย ปิดระบบตรวจผิดทั้งหมดเพื่อการแข่งขันที่เป็นเลิศ',
    rules: [
      'สำหรับนักเรียน ม.4 - ม.6 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'โหมดแข่งขันทางการ ไม่มีตัวช่วยบอกใบ้',
      'รายงานตัวก่อนเวลาแข่งขัน 10 นาที หากขาดการติดต่อจะถูกตัดสิทธิ์'
    ],
    prizes: 'ถ้วยเกียรติยศซูโดกุ ม.ปลาย + เกียรติบัตรเรียนดีกลุ่มสาระคณิตศาสตร์',
    matches: []
  },

  // 5. THAI CHECKERS JUNIOR (ม.ต้น)
  {
    id: 'tourney-checkers-junior',
    title: 'หมากฮอสไทยประลองกลยุทธ์ สาย ม.ต้น',
    subTitle: 'กติกาหมากฮอสไทยแท้ 8x8 ชิงแชมป์ระดับมัธยมศึกษาตอนต้น',
    category: 'checkers',
    categoryName: 'หมากฮอส (Thai Checkers)',
    division: 'junior',
    divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
    roundName: 'รอบ 8 คนสุดท้าย ม.ต้น (Junior Quarterfinals)',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-amber-600 to-orange-950',
    startDate: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    maxParticipants: 16,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'ประลองกลยุทธ์หมากฮอสไทย 8x8 กติกามาตรฐาน (เบี้ยเดินหน้าอย่างเดียว / ฮอสเดินและกินยาว)',
    rules: [
      'เฉพาะนักเรียน ม.1 - ม.3 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'เวลาฝ่ายละ 10 นาทีต่อกระดาน แข่งขัน 2 ใน 3 กระดาน',
      'หากเข้าแข่งขันสายเกินเวลาที่กำหนดจะถูกปรับแพ้และตัดสิทธิ์ (Forfeit)'
    ],
    prizes: 'เหรียญทองหมากฮอส ม.ต้น + เกียรติบัตร',
    matches: []
  },

  // 6. THAI CHECKERS SENIOR (ม.ปลาย)
  {
    id: 'tourney-checkers-senior',
    title: 'หมากฮอสไทยเจ้าอินทรีย์ สาย ม.ปลาย',
    subTitle: 'สุดยอดการประลองกลยุทธ์กระดาน 8x8 ชิงแชมป์ระดับ ม.ปลาย',
    category: 'checkers',
    categoryName: 'หมากฮอส (Thai Checkers)',
    division: 'senior',
    divisionName: 'สาย ม.ปลาย (ม.4 - ม.6)',
    roundName: 'รอบชิงชนะเลิศ ม.ปลาย (Senior Finals)',
    status: 'closed',
    isRegistrationOpen: false,
    bannerColor: 'from-orange-700 to-red-950',
    startDate: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 240 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    maxParticipants: 16,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'รอบชิงชนะเลิศหมากฮอสไทยระดับ ม.ปลาย บ.จ.ว.๓ ประลองชั้นเชิงและแท็กติกขั้นสูง',
    rules: [
      'เฉพาะนักเรียน ม.4 - ม.6 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'เวลาฝ่ายละ 10 นาที แข่งขัน 3 ใน 5 กระดาน'
    ],
    prizes: 'ถ้วยเกียรติยศสัปดาห์วันวิชาการ + เกียรติบัตรนักวางแผนยอดเยี่ยม',
    matches: []
  },

  // 7. SPEED MATH JUNIOR (ม.ต้น)
  {
    id: 'tourney-speedmath-junior',
    title: 'คิดเลขเร็วสายฟ้าแลบ สาย ม.ต้น บ.จ.ว.๓',
    subTitle: 'ท้าประลองคิดเลขเร็ว 60 วินาที ชิงตำแหน่งนักคิดไว ม.ต้น',
    category: 'speed-math',
    categoryName: 'คิดเลขเร็ว (Speed Math)',
    division: 'junior',
    divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
    roundName: 'รอบชิงเจ้าความเร็ว ม.ต้น',
    status: 'open',
    isRegistrationOpen: true,
    bannerColor: 'from-yellow-500 to-amber-900',
    startDate: new Date(Date.now() + 150 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() + 210 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() + 120 * 60 * 1000).toISOString(),
    maxParticipants: 50,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'ประลองคิดเลขเร็ว บวกลบคูณหาร อย่างรวดเร็วและแม่นยำ พร้อมสะสมคอมโบ Streak',
    rules: [
      'สำหรับนักเรียน ม.1 - ม.3 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'จับเวลา 60 วินาที ตอบให้ได้คะแนนสูงสุด',
      'ห้ามใช้กระดาษทดหรืออุปกรณ์ช่วยเหลือ'
    ],
    prizes: 'เหรียญทองคิดเลขเร็ว ม.ต้น + เกียรติบัตร',
    matches: []
  },

  // 8. MAKE 24 SENIOR (ม.ปลาย) - With Recorded Winner for Hall of Fame demonstration!
  {
    id: 'tourney-make24-senior',
    title: 'เกม 24 ชิงพิชิตตัวเลข สาย ม.ปลาย บ.จ.ว.๓',
    subTitle: 'การแข่งขันประกอบสมการ 24 รอบประจำฤดูกาล 2569',
    category: 'make-24',
    categoryName: 'เกม 24 (Make 24)',
    division: 'senior',
    divisionName: 'สาย ม.ปลาย (ม.4 - ม.6)',
    roundName: 'รอบชิงชนะเลิศฤดูกาล (Season Championship)',
    status: 'finished',
    isRegistrationOpen: false,
    bannerColor: 'from-purple-600 to-violet-950',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 22 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    maxParticipants: 40,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'การแข่งขันเกม 24 ชิงแชมป์สาย ม.ปลาย ผู้ชนะเลิศได้รับการจารึกชื่อลงในหอเกียรติยศ (Hall of Fame)',
    rules: [
      'ผสมตัวเลข 4 ตัวด้วย +, -, ×, ÷ ให้ได้ 24',
      'รีเซ็ตเวลาใหม่ทุกข้อ แข่งขันความแม่นยำสูงสุด'
    ],
    prizes: 'ถ้วยแชมเปียนส์เกม 24 โรงเรียนบรรหารแจ่มใสวิทยา 3 + เกียรติบัตรเหรียญทอง',
    matches: [],
    winner: {
      studentId: '22470',
      name: 'นายกฤษณ์ วงศ์ไทย',
      school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
      grade: 'ม.5/1',
      badge: 'แชมป์เกม 24 ประจำฤดูกาล (Gold Medalist)',
      winningScore: 475,
      date: '12 ก.ย. 2569'
    }
  },

  // 9. SPEED MATH JUNIOR (ม.ต้น) - With Recorded Winner for Hall of Fame
  {
    id: 'tourney-speedmath-junior-champ',
    title: 'คิดเลขเร็วชิงแชมป์สาย ม.ต้น ประจำปี 2569',
    subTitle: 'การแข่งขันคิดเลขเร็วรอบเกียรติยศ ระดับมัธยมศึกษาตอนต้น (ม.1 - ม.3)',
    category: 'speed-math',
    categoryName: 'คิดเลขเร็ว (Speed Math)',
    division: 'junior',
    divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
    roundName: 'รอบชิงชนะเลิศประจำปี (Grand Finals)',
    status: 'finished',
    isRegistrationOpen: false,
    bannerColor: 'from-amber-500 via-orange-500 to-amber-950',
    startDate: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    endDate: new Date(Date.now() - 46 * 60 * 60 * 1000).toISOString(),
    registrationDeadline: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString(),
    maxParticipants: 40,
    registeredStudents: [],
    forfeitedStudents: [],
    description: 'บันทึกการแข่งขันเกียรติยศคิดเลขเร็วสาย ม.ต้น ชิงความเป็นเลิศทางคณิตศาสตร์',
    rules: [
      'สำหรับนักเรียน ม.1 - ม.3 โรงเรียนบรรหารแจ่มใสวิทยา 3',
      'จับเวลาและคำนวณความเร็วระดับสูง'
    ],
    prizes: 'ถ้วยเกียรติยศสาย ม.ต้น + เกียรติบัตรเหรียญทอง บ.จ.ว.๓',
    matches: [],
    winner: {
      studentId: '31892',
      name: 'ด.ช. ปัณณธร สว่างจิตต์',
      school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
      grade: 'ม.3/2',
      badge: 'แชมป์คิดเลขเร็ว ม.ต้น (Gold Medalist)',
      winningScore: 520,
      date: '10 ก.ย. 2569'
    }
  }
];

