import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, Shield, Users, Radio, Play, Pause, RotateCcw, 
  Send, CheckCircle, AlertTriangle, Search, Key, Sparkles, Trophy, 
  Clock, Check, X, Sliders, MessageSquare, AlertCircle, UserX, UserCheck, Flame
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTournaments } from '../../context/TournamentContext';
import { realtimeService } from '../../services/realtimeService';
import ConfirmModal from '../common/ConfirmModal';

export default function TeacherDashboard() {
  const { 
    currentUser, 
    students, 
    sendTeacherAnnouncement, 
    announcements 
  } = useAuth();

  const { tournaments, toggleForfeitStudent, showToast } = useTournaments();

  const [activeTab, setActiveTab] = useState('rooms'); // 'rooms', 'roster', 'disputes', 'broadcast', 'students'
  const [selectedTourneyId, setSelectedTourneyId] = useState(tournaments[0]?.id || '');
  const [matchStartedMap, setMatchStartedMap] = useState({});

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null,
    confirmText: 'ยืนยัน',
    type: 'danger',
    onConfirm: () => {}
  });

  // Room Supervision State
  const [activeRooms, setActiveRooms] = useState([
    {
      id: 'M101',
      game: 'หมากฮอสไทย (Thai Checkers)',
      gameId: 'checkers',
      p1: 'ผู้เล่น 1 (โต๊ะ A)',
      p2: 'ผู้เล่น 2 (โต๊ะ B)',
      status: 'in_progress', // 'waiting', 'in_progress', 'paused', 'finished'
      scoreP1: 2,
      scoreP2: 1,
      startedAt: '15:20'
    },
    {
      id: 'AM-202',
      game: 'เอแมท (Standard 15x15 A-Math)',
      gameId: 'a-math',
      p1: 'ผู้เล่น 1 (ฝ่ายฟ้า)',
      p2: 'ผู้เล่น 2 (ฝ่ายแดง)',
      status: 'in_progress',
      scoreP1: 45,
      scoreP2: 38,
      startedAt: '15:25'
    }
  ]);

  // Broadcast Form State
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');
  const [broadcastUrgency, setBroadcastUrgency] = useState('urgent');
  const [broadcastSentSuccess, setBroadcastSentSuccess] = useState(false);

  // Student Filter
  const [studentSearch, setStudentSearch] = useState('');

  // A-Math Disputes / Verification
  const [disputes, setDisputes] = useState([
    {
      id: 'disp-01',
      roomId: 'AM-202',
      player: 'โต๊ะ A (Player 1)',
      equation: '12 + 8 = 20',
      claimedPoints: 14,
      status: 'pending',
      timestamp: '15:28'
    },
    {
      id: 'disp-02',
      roomId: 'AM-202',
      player: 'โต๊ะ B (Player 2)',
      equation: '5 * 4 = 20',
      claimedPoints: 12,
      status: 'pending',
      timestamp: '15:31'
    }
  ]);

  // Real-time synchronization
  useEffect(() => {
    const unsub = realtimeService.subscribe('match_control', 'new_room_created', (payload) => {
      if (payload?.room) {
        setActiveRooms(prev => {
          if (prev.some(r => r.id === payload.room.id)) {
            return prev.map(r => r.id === payload.room.id ? payload.room : r);
          }
          return [payload.room, ...prev];
        });
      }
    });

    return () => unsub();
  }, []);

  // Room Supervision Actions & Teacher Controlled Start
  const handleTeacherStartMatch = (tourneyId, roomId = null) => {
    const targetRoomId = roomId || ('room_' + tourneyId);
    realtimeService.sendEvent('match_control', 'start_match', {
      action: 'start_match',
      tournamentId: tourneyId,
      roomId: targetRoomId,
      timestamp: Date.now()
    });

    setMatchStartedMap(prev => ({ ...prev, [tourneyId]: true }));
    showToast('ส่งสัญญาณเริ่มการแข่งขันแล้ว! ระบบกำลังนับถอยหลัง 3 2 1 START บนหน้าจอนักเรียน', 'success');
  };

  const handleForceStart = (roomId) => {
    realtimeService.sendEvent('match_control', 'start_match', {
      action: 'start_match',
      roomId,
      timestamp: Date.now()
    });
    setActiveRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: 'in_progress' } : r));
    showToast('ส่งคำสั่งเริ่มการแข่งขันในห้อง #' + roomId + ' เรียบร้อยแล้ว', 'success');
  };

  const handleTogglePause = (roomId, currentStatus) => {
    const newStatus = currentStatus === 'paused' ? 'in_progress' : 'paused';
    realtimeService.sendEvent('match_control', 'match_action', { action: newStatus === 'paused' ? 'pause' : 'resume', roomId });
    setActiveRooms(prev => prev.map(r => r.id === roomId ? { ...r, status: newStatus } : r));
  };

  const handleCancelRoom = (roomId) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยกเลิกห้องแข่งขัน',
      message: `ยืนยันการยกเลิกและรีเซ็ตห้องการแข่งขันรหัส ${roomId} หรือไม่?`,
      details: 'การยกเลิกห้องจะตัดการเชื่อมต่อของผู้เล่นทั้งสองฝ่ายและรีเซ็ตสถานะกระดานเกมทันที',
      confirmText: 'ยกเลิกห้องแข่งขัน',
      type: 'danger',
      onConfirm: () => {
        realtimeService.sendEvent('match_control', 'cancel_room', { action: 'cancel', roomId });
        setActiveRooms(prev => prev.filter(r => r.id !== roomId));
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  // Broadcast Handler
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMsg.trim()) return;

    sendTeacherAnnouncement(broadcastTitle.trim(), broadcastMsg.trim(), broadcastUrgency);
    setBroadcastSentSuccess(true);
    setBroadcastTitle('');
    setBroadcastMsg('');
    setTimeout(() => setBroadcastSentSuccess(false), 3000);
  };

  // Resolve Dispute
  const handleResolveDispute = (disputeId, action) => {
    setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: action } : d));
  };

  // Toggle Forfeit Student with ConfirmModal
  const handleToggleForfeit = (tourney, studentId, isCurrentlyForfeited) => {
    const studentObj = students.find(s => s.studentId === studentId);
    const studentName = studentObj ? studentObj.name : `รหัส ${studentId}`;

    if (isCurrentlyForfeited) {
      toggleForfeitStudent(tourney.id, studentId);
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'ตัดสิทธิ์การแข่งขัน (Forfeit)',
        message: `ยืนยันการตัดสิทธิ์ ${studentName} จากรายการนี้หรือไม่?`,
        details: 'นักเรียนที่ถูกตัดสิทธิ์จะไม่สามารถเข้าสู่ห้องแข่งขัน Tournament Arena ในรายการนี้ได้',
        confirmText: 'ยืนยันตัดสิทธิ์',
        type: 'danger',
        onConfirm: () => {
          toggleForfeitStudent(tourney.id, studentId);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  // Active tournament for Roster Tab
  const currentTourney = tournaments.find(t => t.id === selectedTourneyId) || tournaments[0];

  // Filter students
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-[#1E3E62] to-[#0B192C] p-6 rounded-3xl border border-emerald-500/30 backdrop-blur-md shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/20">
              👨‍🏫
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider border border-emerald-400/30">
                  Teacher Supervisor & Match Arbiter
                </span>
                <span className="text-xs text-slate-300 font-medium">โรงเรียนบรรหารแจ่มใสวิทยา 3 (บ.จ.3)</span>
              </div>
              <h2 className="text-2xl font-black text-white mt-1">
                ระบบจัดการคุณครูและกรรมการผู้ตัดสินกลาง
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                ผู้ดูแลระบบ: <strong className="text-white">{currentUser?.name}</strong> ({currentUser?.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#0B192C]/80 border border-white/10 px-4 py-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">ทัวร์นาเมนต์ทั้งหมด</div>
              <div className="text-2xl font-black text-amber-400 font-mono">{tournaments.length}</div>
            </div>
            <div className="bg-[#0B192C]/80 border border-white/10 px-4 py-3 rounded-2xl text-center">
              <div className="text-[10px] text-slate-400 font-bold uppercase">นักเรียนในระบบ</div>
              <div className="text-2xl font-black text-[#008DDA] font-mono">{students.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab('rooms')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'rooms'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
              : 'bg-[#1E3E62]/60 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Radio className="w-4 h-4" /> ดูแลห้องแข่งขันสด ({activeRooms.length})
        </button>

        <button
          onClick={() => setActiveTab('roster')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'roster'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
              : 'bg-[#1E3E62]/60 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Trophy className="w-4 h-4" /> รายชื่อผู้สมัคร & สั่งเริ่มแมตช์
        </button>

        <button
          onClick={() => setActiveTab('disputes')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'disputes'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
              : 'bg-[#1E3E62]/60 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Sliders className="w-4 h-4" /> ตรวจสอบสมการ A-Math ({disputes.filter(d => d.status === 'pending').length})
        </button>

        <button
          onClick={() => setActiveTab('broadcast')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'broadcast'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
              : 'bg-[#1E3E62]/60 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Send className="w-4 h-4" /> บรอดแคสต์ประกาศสด
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
            activeTab === 'students'
              ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30'
              : 'bg-[#1E3E62]/60 text-slate-300 hover:text-white hover:bg-white/10'
          }`}
        >
          <Users className="w-4 h-4" /> ข้อมูลนักเรียนในระบบ ({students.length})
        </button>
      </div>

      {/* TAB 1: ROOM SUPERVISION */}
      {activeTab === 'rooms' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Radio className="w-5 h-5 text-emerald-400 animate-pulse" /> ห้องแข่งขันที่เปิดใช้งานอยู่
            </h3>
            <span className="text-xs text-slate-400">กรรมการสามารถสั่งเริ่มเกม ส่งสัญญาณนับ 3 2 1 START หรือพักเกมได้แบบ Real-time</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeRooms.map(room => (
              <div key={room.id} className="bg-[#1E3E62]/50 border border-white/10 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-[#008DDA]/20 text-[#008DDA] text-[10px] font-mono font-bold">
                        ROOM #{room.id}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        room.status === 'in_progress' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        room.status === 'paused' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-500/20 text-slate-300'
                      }`}>
                        {room.status === 'in_progress' ? '🟢 กำลังแข่งขัน' : room.status === 'paused' ? '⏸️ หยุดชั่วคราว' : 'รอเริ่มเกม'}
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-white mt-1">{room.game}</h4>
                    <div className="text-xs text-slate-400">เริ่มเวลา: {room.startedAt} น.</div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400">คะแนนปัจจุบัน</div>
                    <div className="text-lg font-black font-mono text-cyan-400">{room.scoreP1} : {room.scoreP2}</div>
                  </div>
                </div>

                <div className="p-3 bg-[#0B192C]/80 rounded-xl border border-white/5 text-xs flex justify-between">
                  <div>
                    <span className="text-slate-400">ผู้เล่น 1: </span>
                    <strong className="text-white">{room.p1}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">ผู้เล่น 2: </span>
                    <strong className="text-white">{room.p2}</strong>
                  </div>
                </div>

                {/* Arbiter Action Buttons with 3-2-1 Start */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={() => handleForceStart(room.id)}
                    className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-500/20"
                    title="เริ่มการแข่งขันและส่งสัญญาณนับถอยหลัง 3 2 1 START"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> เริ่มแข่ง (3-2-1)
                  </button>
                  <button
                    onClick={() => handleTogglePause(room.id, room.status)}
                    className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Pause className="w-3.5 h-3.5" /> {room.status === 'paused' ? 'เล่นต่อ' : 'พักเกม'}
                  </button>
                  <button
                    onClick={() => handleCancelRoom(room.id)}
                    className="px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตห้อง
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: TOURNAMENT ROSTER & START MATCH CONTROL */}
      {activeTab === 'roster' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E3E62]/40 p-5 rounded-2xl border border-white/10">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> ตรวจสอบผู้สมัคร & ปุ่มควบคุมการเริ่มแมตช์ (Arbiter Control)
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                เลือกทัวร์นาเมนต์เพื่อตรวจความพร้อม ตัดสิทธิ์ผู้เข้าแข่งขันที่สาย และกดเริ่มการแข่งขันให้นักเรียนพร้อมกัน
              </p>
            </div>

            {/* Tournament Selector */}
            <div className="min-w-[280px]">
              <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">เลือกรอบการแข่งขัน</label>
              <select
                value={selectedTourneyId}
                onChange={(e) => setSelectedTourneyId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-400"
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>
                    [{t.division === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}] {t.title} ({t.registeredStudents?.length || 0} คน)
                  </option>
                ))}
              </select>
            </div>
          </div>

          {currentTourney ? (
            <div className="bg-[#1E3E62]/40 rounded-2xl border border-white/10 p-6 space-y-6">
              {/* Tourney Info & Teacher Start Match Button */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0B192C]/80 p-5 rounded-xl border border-white/10">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                      currentTourney.division === 'junior'
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {currentTourney.divisionName || (currentTourney.division === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย')}
                    </span>
                    <span className="text-xs text-[#008DDA] font-bold">{currentTourney.categoryName}</span>
                    <span className="text-xs text-amber-300 font-mono">เวลาแข่ง: {currentTourney.durationMinutes || 15} นาที</span>
                  </div>
                  <h4 className="text-lg font-black text-white">{currentTourney.title}</h4>
                  <div className="text-xs text-slate-400 mt-0.5">{currentTourney.roundName}</div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="bg-[#1E3E62]/60 px-4 py-2 rounded-xl text-center border border-white/10">
                    <div className="text-[10px] text-slate-400 font-bold">ยอดผู้สมัคร</div>
                    <div className="text-lg font-mono font-black text-white">
                      {currentTourney.registeredStudents?.length || 0} / {currentTourney.maxParticipants}
                    </div>
                  </div>

                  {/* MASTER START MATCH BUTTON: Triggers 3-2-1 countdown on students' screens! */}
                  <button
                    onClick={() => handleTeacherStartMatch(currentTourney.id)}
                    className="px-5 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center gap-2 active:scale-95 transition-all border border-emerald-300"
                  >
                    <Flame className="w-5 h-5 fill-current animate-bounce text-slate-950" />
                    <span>เริ่มการแข่งขัน (Start Match - 3,2,1!)</span>
                  </button>
                </div>
              </div>

              {/* Roster Table */}
              {(!currentTourney.registeredStudents || currentTourney.registeredStudents.length === 0) ? (
                <div className="text-center py-12 bg-[#0B192C]/50 rounded-xl border border-dashed border-white/10">
                  <Users className="w-10 h-10 text-slate-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-white">ยังไม่มีนักเรียนลงทะเบียนในรายการนี้</div>
                  <p className="text-xs text-slate-400 mt-1">
                    เมื่อนักเรียนกดยืนยันการสมัคร รายชื่อจะปรากฏในตารางนี้แบบ Real-time
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0B192C]/70">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-[#1E3E62]/80 text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 text-center">ลำดับ</th>
                        <th className="px-4 py-3">รหัสนักเรียน</th>
                        <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                        <th className="px-4 py-3">ระดับชั้น</th>
                        <th className="px-4 py-3">สายการแข่งขัน</th>
                        <th className="px-4 py-3 text-center">สถานะการแข่งขัน</th>
                        <th className="px-4 py-3 text-right">คำสั่งกรรมการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {currentTourney.registeredStudents.map((sid, index) => {
                        const sObj = students.find(s => s.studentId === sid);
                        const isForfeited = currentTourney.forfeitedStudents?.includes(sid);

                        return (
                          <tr key={sid} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-3 text-center font-mono font-bold text-slate-400">
                              #{index + 1}
                            </td>
                            <td className="px-4 py-3 font-mono font-bold text-cyan-400">
                              {sid}
                            </td>
                            <td className="px-4 py-3 font-bold text-white">
                              {sObj ? sObj.name : 'นักเรียนโรงเรียนบรรหารแจ่มใสวิทยา 3'}
                            </td>
                            <td className="px-4 py-3 text-slate-300">
                              {sObj ? sObj.grade : currentTourney.division === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                currentTourney.division === 'junior' ? 'text-emerald-300 bg-emerald-500/10' : 'text-indigo-300 bg-indigo-500/10'
                              }`}>
                                {currentTourney.divisionName || (currentTourney.division === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย')}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {isForfeited ? (
                                <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-bold border border-rose-500/30 inline-flex items-center gap-1">
                                  <UserX className="w-3 h-3" /> ถูกตัดสิทธิ์ (Forfeit)
                                </span>
                              ) : (
                                <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30 inline-flex items-center gap-1">
                                  <UserCheck className="w-3 h-3" /> พร้อมเข้าแข่งขัน (Ready)
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {isForfeited ? (
                                <button
                                  onClick={() => handleToggleForfeit(currentTourney, sid, true)}
                                  className="px-3 py-1.5 rounded-lg bg-emerald-600/80 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                                >
                                  <UserCheck className="w-3 h-3" /> คืนสิทธิ์เข้าแข่งขัน
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleToggleForfeit(currentTourney, sid, false)}
                                  className="px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-500 text-white text-[11px] font-bold transition-all inline-flex items-center gap-1 shadow-sm"
                                >
                                  <UserX className="w-3 h-3" /> ตัดสิทธิ์ (Forfeit)
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 bg-[#0B192C]/50 rounded-xl border border-dashed border-white/10 text-slate-400">
              ยังไม่มีรอบการแข่งขันที่สร้างในระบบ
            </div>
          )}
        </div>
      )}

      {/* TAB 3: A-MATH & MATCH OVERSIGHT */}
      {activeTab === 'disputes' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" /> การตรวจสอบสมการ A-Math และการตัดสินข้อพิพาท
            </h3>
            <span className="text-xs text-slate-400">กรรมการตัดสินชี้ขาดความถูกต้องของสมการ</span>
          </div>

          <div className="space-y-3">
            {disputes.map(disp => (
              <div key={disp.id} className="p-4 bg-[#1E3E62]/50 border border-white/10 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono text-xs font-bold">
                      {disp.roomId}
                    </span>
                    <span className="text-xs text-slate-400">{disp.player} ({disp.timestamp} น.)</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      disp.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                      disp.status === 'rejected' ? 'bg-rose-500/20 text-rose-400' :
                      'bg-amber-500/20 text-amber-300'
                    }`}>
                      {disp.status === 'approved' ? 'อนุมัติแล้ว' : disp.status === 'rejected' ? 'ปฏิเสธ' : 'รอกรรมการตรวจสอบ'}
                    </span>
                  </div>
                  <div className="text-lg font-black font-mono text-white tracking-wide">
                    สมการ: <span className="text-amber-400">{disp.equation}</span> (+{disp.claimedPoints} แต้ม)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleResolveDispute(disp.id, 'approved')}
                    disabled={disp.status === 'approved'}
                    className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" /> อนุมัติแต้ม
                  </button>
                  <button
                    onClick={() => handleResolveDispute(disp.id, 'rejected')}
                    disabled={disp.status === 'rejected'}
                    className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                  >
                    <X className="w-4 h-4" /> โมฆะ/ริบคะแนน
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: REAL-TIME BROADCAST */}
      {activeTab === 'broadcast' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-[#1E3E62]/50 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-emerald-400" /> ส่งประกาศด่วนถึงนักเรียนทุกคนแบบ Real-time
            </h3>
            <p className="text-xs text-slate-300">
              ข้อความจะเด้งขึ้นหน้าจอนักเรียนทุกคนที่กำลังเปิดใช้งานเว็บ Math Olympiad Hub ทันที
            </p>

            <form onSubmit={handleSendBroadcast} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">หัวข้อประกาศ</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น แจ้งเตือนรอบชิงชนะเลิศ A-Math, กำหนดเวลาพักครึ่ง"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B192C] border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">ระดับความเร่งด่วน</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setBroadcastUrgency('normal')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      broadcastUrgency === 'normal'
                        ? 'bg-blue-600 text-white border-blue-400'
                        : 'bg-[#0B192C] text-slate-400 border-white/10'
                    }`}
                  >
                    📢 ประกาศทั่วไป (Normal)
                  </button>
                  <button
                    type="button"
                    onClick={() => setBroadcastUrgency('urgent')}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                      broadcastUrgency === 'urgent'
                        ? 'bg-rose-600 text-white border-rose-400'
                        : 'bg-[#0B192C] text-slate-400 border-white/10'
                    }`}
                  >
                    🚨 ด่วนมาก / คำสั่งกรรมการ (Urgent)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">เนื้อหาประกาศ</label>
                <textarea
                  rows="4"
                  required
                  placeholder="ระบุข้อความประกาศ..."
                  value={broadcastMsg}
                  onChange={(e) => setBroadcastMsg(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0B192C] border border-white/20 text-white text-sm focus:outline-none focus:border-emerald-400"
                />
              </div>

              {broadcastSentSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" /> ส่งข้อความประกาศแบบ Real-time ไปยังทุกเครื่องเรียบร้อยแล้ว
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <Send className="w-4 h-4" /> ส่งประกาศทันที (Broadcast Now)
              </button>
            </form>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" /> ประวัติการประกาศ ({announcements.length})
            </h3>
            <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2">
              {announcements.length === 0 ? (
                <div className="p-8 text-center text-slate-400 bg-[#1E3E62]/30 rounded-2xl border border-white/5">
                  ยังไม่มีประวัติประกาศ
                </div>
              ) : (
                announcements.map((ann, idx) => (
                  <div key={idx} className="p-4 bg-[#1E3E62]/40 rounded-xl border border-white/10 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        ann.urgency === 'urgent' ? 'bg-rose-500/20 text-rose-300' : 'bg-blue-500/20 text-blue-300'
                      }`}>
                        {ann.urgency === 'urgent' ? '🚨 ด่วนมาก' : '📢 ทั่วไป'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(ann.timestamp).toLocaleTimeString('th-TH')} น.
                      </span>
                    </div>
                    <div className="text-sm font-bold text-white">{ann.title}</div>
                    <div className="text-xs text-slate-300">{ann.message}</div>
                    <div className="text-[10px] text-emerald-400/80 pt-1">ผู้ส่ง: {ann.sender}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: STUDENT INFORMATION (READ-ONLY FOR TEACHERS, NO PIN RESET PERMISSION) */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-emerald-400" /> ข้อมูลนักเรียนโรงเรียนบรรหารแจ่มใสวิทยา 3
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                รายชื่อนักเรียนจริงที่ลงทะเบียนในระบบ (คุณครูสามารถตรวจสอบความพร้อมได้ แต่ไม่มีสิทธิ์แก้ไขหรือรีเซ็ตรหัสผ่านของนักเรียน)
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B192C] border border-white/20 text-white text-xs focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="p-12 text-center bg-[#1E3E62]/30 rounded-2xl border border-white/10 space-y-2">
              <Users className="w-10 h-10 text-slate-500 mx-auto" />
              <div className="text-white font-bold text-base">ยังไม่มีนักเรียนลงทะเบียนในระบบ</div>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                นักเรียนสามารถลงทะเบียนด้วยตนเองผ่านปุ่ม "เข้าสู่ระบบ" &gt; แถบ "ลงทะเบียนนักเรียนใหม่" ด้วยเลขประจำตัวนักเรียน
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#1E3E62]/40">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#0B192C]/80 text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                  <tr>
                    <th className="px-4 py-3">ลำดับ</th>
                    <th className="px-4 py-3">รหัสนักเรียน</th>
                    <th className="px-4 py-3">ชื่อ - นามสกุล</th>
                    <th className="px-4 py-3">ระดับชั้น</th>
                    <th className="px-4 py-3 text-center">สายการแข่งขัน</th>
                    <th className="px-4 py-3 font-mono text-amber-400 text-center">Math ELO</th>
                    <th className="px-4 py-3 text-right">สถานะบัญชี</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((student, idx) => {
                    const isJunior = (student.grade || '').includes('ม.1') || (student.grade || '').includes('ม.2') || (student.grade || '').includes('ม.3');
                    return (
                      <tr key={student.id} className="hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-slate-400">#{idx + 1}</td>
                        <td className="px-4 py-3 font-mono font-bold text-[#008DDA]">
                          {student.studentId}
                        </td>
                        <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                          <span>{student.avatar || '🧑‍🎓'}</span> {student.name}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          {student.grade || 'มัธยมศึกษา'}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            isJunior
                              ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                              : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                          }`}>
                            {isJunior ? 'ม.ต้น' : 'ม.ปลาย'}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono text-amber-400 font-bold text-center">
                          {student.elo || 1500}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3 text-emerald-400" /> ยืนยันตัวตนแล้ว
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* CONFIRM MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
}
