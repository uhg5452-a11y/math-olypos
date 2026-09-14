import React, { useState } from 'react';
import { 
  Trophy, Calendar, Users, ArrowRight, CheckCircle, Clock, AlertTriangle, 
  Filter, Sparkles, X, ChevronRight, Layers, Flame, Lock 
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import CancelRegistrationModal from './CancelRegistrationModal';
import TournamentArena from '../tournament/TournamentArena';

export default function TournamentList({ onOpenLogin }) {
  const { tournaments, registerTournament, unregisterTournament } = useTournament();
  const { currentUser } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [divisionFilter, setDivisionFilter] = useState('all'); // 'all', 'junior', 'senior'
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [cancelingTournament, setCancelingTournament] = useState(null);
  const [activeArenaTournament, setActiveArenaTournament] = useState(null);

  // Helper for student grade division
  const getStudentDivision = (gradeStr) => {
    if (!gradeStr) return null;
    const g = gradeStr.toLowerCase().replace(/\s+/g, '');
    if (
      g.includes('ม.1') || g.includes('ม.2') || g.includes('ม.3') ||
      g.includes('ม1') || g.includes('ม2') || g.includes('ม3') ||
      g.includes('มัธยม1') || g.includes('มัธยม2') || g.includes('มัธยม3') ||
      g.includes('ม.ต้น') || g.includes('มต้น') || g.includes('junior')
    ) return 'junior';
    if (
      g.includes('ม.4') || g.includes('ม.5') || g.includes('ม.6') ||
      g.includes('ม4') || g.includes('ม5') || g.includes('ม6') ||
      g.includes('มัธยม4') || g.includes('มัธยม5') || g.includes('มัธยม6') ||
      g.includes('ม.ปลาย') || g.includes('มปลาย') || g.includes('senior')
    ) return 'senior';
    return null;
  };

  const userDivision = currentUser ? getStudentDivision(currentUser.grade) : null;

  const categories = [
    { id: 'all', name: 'ทุกประเภทเกม' },
    { id: 'a-math', name: 'เอแมท (A-Math)' },
    { id: 'sudoku', name: 'ซูโดกุ (Sudoku)' },
    { id: 'checkers', name: 'หมากฮอส (Thai Checkers)' },
    { id: 'speed-math', name: 'คิดเลขเร็ว (Speed Math)' },
    { id: 'make-24', name: 'เกม 24 (Make 24)' },
    { id: 'flash-anzan', name: 'จินตคณิต (Flash Anzan)' }
  ];

  // Filter tournaments
  const filteredTournaments = tournaments.filter((t) => {
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchDivision = divisionFilter === 'all' || t.division === divisionFilter;
    return matchCategory && matchDivision;
  });

  const handleRegisterClick = (tournament) => {
    if (!currentUser) {
      if (onOpenLogin) onOpenLogin();
      return;
    }
    registerTournament(tournament.id);
  };

  const handleUnregisterClick = (tournament) => {
    setCancelingTournament(tournament);
  };

  const handleEnterArena = (tourney) => {
    // Check forfeit
    if (tourney.forfeitedStudents?.includes(currentUser?.studentId)) {
      alert('คุณถูกตัดสิทธิ์จากการแข่งขัน (Forfeit) เนื่องจากไม่มารายงานตัวตามเวลาที่กำหนด');
      return;
    }
    // Check grade mismatch
    if (userDivision && tourney.division && tourney.division !== userDivision) {
      alert(`คุณอยู่ในระดับ ${userDivision === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย'} ไม่สามารถเข้าแข่งขันในรายการของ ${tourney.division === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย'} ได้`);
      return;
    }
    setActiveArenaTournament(tourney);
  };

  // If student enters official Tournament Arena
  if (activeArenaTournament) {
    return (
      <TournamentArena
        tournament={activeArenaTournament}
        onExitArena={() => setActiveArenaTournament(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3E62] via-[#0B192C] to-[#1E3E62] border border-[#008DDA]/30 p-8 shadow-2xl box-glow">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008DDA]/20 border border-[#008DDA]/40 text-[#008DDA] text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> การแข่งขันคณิตศาสตร์ภายในโรงเรียนบรรหารแจ่มใสวิทยา 3 (บ.จ.3)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            เวทีประลองปัญญา <span className="text-[#008DDA] glow-primary">Math Olympiad Hub</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            แบ่งสายการแข่งขันอย่างชัดเจนระหว่าง <strong>สาย ม.ต้น (ม.1 - ม.3)</strong> และ <strong>สาย ม.ปลาย (ม.4 - ม.6)</strong> 
            นักเรียนต้องลงทะเบียนล่วงหน้าเพื่อรับสิทธิ์เข้าสู่ห้องแข่งขันจริง (Tournament Arena) ควบคุมการเริ่มเกมโดยครูผู้ดูแล
          </p>
        </div>

        {/* Decorative Background Math equations */}
        <div className="absolute -right-6 -bottom-8 opacity-15 select-none pointer-events-none text-right font-mono text-7xl text-[#008DDA] leading-none">
          <div>∑(n²)</div>
          <div className="text-4xl">lim x→∞</div>
        </div>
      </div>

      {/* Division Selector Tabs (สาย ม.ต้น vs สาย ม.ปลาย) */}
      <div className="flex items-center gap-2 bg-[#0B192C]/90 p-2 rounded-2xl border border-white/10 shadow-lg">
        <span className="text-xs font-bold text-slate-400 px-3 hidden sm:flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#008DDA]" /> ระดับชั้น:
        </span>
        <button
          onClick={() => setDivisionFilter('all')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            divisionFilter === 'all'
              ? 'bg-[#008DDA] text-white shadow-lg shadow-blue-500/30'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ทุกระดับชั้น (All Levels)
        </button>
        <button
          onClick={() => setDivisionFilter('junior')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            divisionFilter === 'junior'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📘 สาย ม.ต้น (ม.1 - ม.3)</span>
        </button>
        <button
          onClick={() => setDivisionFilter('senior')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            divisionFilter === 'senior'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-400/40'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📙 สาย ม.ปลาย (ม.4 - ม.6)</span>
        </button>
      </div>

      {/* Secondary Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#1E3E62]/40 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#008DDA] mr-1 flex-shrink-0" />
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                categoryFilter === cat.id
                  ? 'bg-[#008DDA] text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          แสดง <strong className="text-white">{filteredTournaments.length}</strong> รายการ
        </div>
      </div>

      {/* Tournaments Grid */}
      {filteredTournaments.length === 0 ? (
        <div className="text-center py-20 bg-[#1E3E62]/30 rounded-3xl border border-dashed border-white/10 p-8 animate-fade-in">
          <Trophy className="w-16 h-16 text-slate-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">ยังไม่มีรายการแข่งขันในหมวดหมู่นี้</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            จะแสดงผลเฉพาะรายการแข่งขันจริงที่แอดมินหรือครูผู้ดูแลระบบได้สร้างขึ้นไว้เท่านั้น
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTournaments.map((tourney) => {
            const registered = currentUser && tourney.registeredStudents?.includes(currentUser.studentId);
            const forfeited = currentUser && tourney.forfeitedStudents?.includes(currentUser.studentId);
            const participantCount = tourney.registeredStudents?.length || 0;
            const capacityPercent = Math.min(100, Math.round((participantCount / tourney.maxParticipants) * 100));
            const isFull = participantCount >= tourney.maxParticipants;
            const isJunior = tourney.division === 'junior';
            const isGradeMismatch = Boolean(currentUser && tourney.division && userDivision && tourney.division !== userDivision);

            return (
              <div
                key={tourney.id}
                className={`group rounded-3xl border p-6 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl relative overflow-hidden backdrop-blur-md ${
                  tourney.status === 'live'
                    ? 'bg-gradient-to-b from-[#1E3E62]/90 via-[#0B192C] to-[#1E3E62]/80 border-orange-500 shadow-orange-500/20'
                    : 'bg-[#1E3E62]/40 hover:bg-[#1E3E62]/60 border-white/10 hover:border-[#008DDA]/50'
                }`}
              >
                {/* Top Badges: Division + Status */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                    isJunior
                      ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                      : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                  }`}>
                    {tourney.divisionName || (isJunior ? 'ม.ต้น (ม.1 - ม.3)' : 'ม.ปลาย (ม.4 - ม.6)')}
                  </span>

                  {/* Status Badges: Distinct Vibrant Live Badge */}
                  {tourney.status === 'live' ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-black px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 text-white shadow-lg shadow-orange-600/40 border border-amber-300 animate-pulse">
                      <Flame className="w-3.5 h-3.5 fill-current text-yellow-200 animate-bounce" /> กำลังแข่งขัน (Live)
                    </span>
                  ) : tourney.isRegistrationOpen ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> เปิดรับสมัคร
                    </span>
                  ) : tourney.status === 'finished' ? (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Trophy className="w-3 h-3 text-amber-400" /> แข่งขันเสร็จสิ้น
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      ปิดรับสมัครแล้ว
                    </span>
                  )}
                </div>

                {/* Title & Category */}
                <div className="mb-3">
                  <div className="text-xs font-semibold text-slate-400 mb-1 flex items-center justify-between">
                    <span>{tourney.categoryName}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{tourney.roundName}</span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-[#008DDA] transition-colors line-clamp-2">
                    {tourney.title}
                  </h3>
                </div>

                <p className="text-xs text-slate-300/80 line-clamp-2 mb-4 leading-relaxed">
                  {tourney.description}
                </p>

                {/* Match Schedule / Capacity Info */}
                <div className="space-y-2 bg-[#0B192C]/70 rounded-xl p-3 border border-white/5 text-xs mb-4">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-[#008DDA]" /> วัน-เวลาแข่ง:
                    </span>
                    <span className="font-semibold text-white">
                      {new Date(tourney.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3.5 h-3.5 text-amber-400" /> เวลาคิดต่อแมตช์:
                    </span>
                    <span className="font-mono font-bold text-amber-300">
                      {tourney.durationMinutes || 15} นาที
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <Users className="w-3.5 h-3.5 text-[#008DDA]" /> ผู้สมัคร:
                    </span>
                    <span className="font-mono font-bold text-white">
                      {participantCount} / {tourney.maxParticipants} คน
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        capacityPercent >= 90 ? 'bg-rose-500' : capacityPercent >= 70 ? 'bg-amber-400' : 'bg-[#008DDA]'
                      }`}
                      style={{ width: `${capacityPercent}%` }}
                    />
                  </div>
                </div>

                {/* Registered Student Action Section */}
                {registered && (
                  <div className="mb-3 space-y-2">
                    {forfeited ? (
                      <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-500 text-rose-300 text-xs font-bold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                        <span>ท่านถูกตัดสิทธิ์จากการแข่งขัน (Forfeited / Late)</span>
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            <span>ลงทะเบียนเรียบร้อยแล้ว</span>
                          </div>
                        </div>

                        {/* Prominent Enter Match Button to REAL TOURNAMENT ARENA */}
                        <button
                          type="button"
                          onClick={() => handleEnterArena(tourney)}
                          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all border border-emerald-400"
                        >
                          <Flame className="w-4 h-4 fill-current text-slate-950 animate-bounce" /> เข้าสู่การแข่งขัน (Tournament Arena)
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-auto pt-2 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedTournament(tourney)}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold transition-all"
                  >
                    กติกา & ผล
                  </button>

                  {isGradeMismatch ? (
                    <div className="flex-1 py-2 px-3 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-[11px] font-bold text-center flex items-center justify-center gap-1.5 cursor-not-allowed">
                      <Lock className="w-3.5 h-3.5 text-amber-400" />
                      <span>เฉพาะ {isJunior ? 'สาย ม.ต้น' : 'สาย ม.ปลาย'} (ล็อกสิทธิ์)</span>
                    </div>
                  ) : registered ? (
                    <button
                      onClick={() => handleUnregisterClick(tourney)}
                      className="flex-1 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all"
                    >
                      ยกเลิกสมัคร
                    </button>
                  ) : tourney.isRegistrationOpen ? (
                    <button
                      onClick={() => handleRegisterClick(tourney)}
                      disabled={isFull}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 ${
                        isFull
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-[#008DDA] to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-blue-500/20 active:scale-95'
                      }`}
                    >
                      {isFull ? 'ที่นั่งเต็มแล้ว' : 'กดลงทะเบียน'} <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="flex-1 py-2 rounded-xl bg-slate-800 text-slate-500 text-xs font-semibold cursor-not-allowed"
                    >
                      ปิดรับสมัครแล้ว
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <Modal
          isOpen={Boolean(selectedTournament)}
          onClose={() => setSelectedTournament(null)}
          title={selectedTournament.title}
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-[#0B192C] rounded-xl border border-white/10 space-y-1">
              <div className="text-[11px] text-[#008DDA] font-bold">{selectedTournament.categoryName}</div>
              <div className="text-sm font-black text-white">{selectedTournament.roundName}</div>
              <div className="text-[11px] text-slate-400">
                สายการแข่งขัน: <strong className="text-amber-300">{selectedTournament.divisionName || (selectedTournament.division === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย')}</strong>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-1">กติกาการแข่งขัน:</h4>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {selectedTournament.rules?.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
              <div className="text-xs font-bold text-amber-300 mb-1 flex items-center gap-1.5">
                <Trophy className="w-4 h-4" /> รางวัลเกียรติยศ
              </div>
              <div className="text-xs text-amber-100">{selectedTournament.prizes}</div>
            </div>

            {selectedTournament.winner && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="text-xs font-bold text-emerald-300 mb-1 flex items-center gap-1.5">
                  🥇 ทำเนียบผู้ชนะเลิศ (Hall of Fame)
                </div>
                <div className="text-xs text-white">
                  <strong>{selectedTournament.winner.name}</strong> ({selectedTournament.winner.studentId}) • {selectedTournament.winner.grade}
                </div>
                <div className="text-[11px] text-emerald-300 mt-0.5">
                  คะแนนชนะเลิศ: {selectedTournament.winner.winningScore} แต้ม
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Cancel Registration Confirmation Modal */}
      {cancelingTournament && (
        <CancelRegistrationModal
          isOpen={Boolean(cancelingTournament)}
          onClose={() => setCancelingTournament(null)}
          onConfirm={(id) => unregisterTournament(id)}
          tournament={cancelingTournament}
        />
      )}
    </div>
  );
}
