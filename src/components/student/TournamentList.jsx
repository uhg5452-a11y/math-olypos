import React, { useState } from 'react';
import { 
  Trophy, Calendar, Users, Clock, CheckCircle, AlertCircle, 
  ArrowRight, ShieldCheck, Sparkles, Filter, Eye, Gamepad2, Flame, AlertTriangle, Layers
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import LiveSpectatorModal from '../spectator/LiveSpectatorModal';
import CancelRegistrationModal from './CancelRegistrationModal';
import TournamentArena from '../tournament/TournamentArena';

export default function TournamentList({ onOpenLogin }) {
  const { tournaments, registerTournament, unregisterTournament } = useTournament();
  const { currentUser, isStudent } = useAuth();

  // Filters
  const [divisionFilter, setDivisionFilter] = useState('all'); // 'all', 'junior', 'senior'
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modals & Active Arena
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [spectatorMatch, setSpectatorMatch] = useState(null);
  const [spectatorTournament, setSpectatorTournament] = useState(null);
  const [cancelingTournament, setCancelingTournament] = useState(null);
  const [activeArenaTournament, setActiveArenaTournament] = useState(null);

  const categories = [
    { id: 'all', label: 'ทุกประเภทเกม' },
    { id: 'a-math', label: 'เอแมท (A-Math)' },
    { id: 'sudoku', label: 'ซูโดกุ (Sudoku)' },
    { id: 'checkers', label: 'หมากฮอส (Checkers)' },
    { id: 'speed-math', label: 'คิดเลขเร็ว (Speed Math)' },
    { id: 'make-24', label: 'เกม 24 (Make 24)' },
    { id: 'flash-anzan', label: 'จินตคณิต (Flash Anzan)' }
  ];

  const filteredTournaments = tournaments.filter((t) => {
    const matchDivision = divisionFilter === 'all' || t.division === divisionFilter;
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'open' && t.isRegistrationOpen) ||
      (statusFilter === 'closed' && !t.isRegistrationOpen && t.status !== 'live') ||
      (statusFilter === 'live' && t.status === 'live');
    return matchDivision && matchCategory && matchStatus;
  });

  const isUserRegistered = (tourney) => {
    if (!currentUser || !currentUser.studentId) return false;
    return tourney.registeredStudents?.includes(currentUser.studentId);
  };

  const isUserForfeited = (tourney) => {
    if (!currentUser || !currentUser.studentId) return false;
    return tourney.forfeitedStudents?.includes(currentUser.studentId);
  };

  const handleRegisterClick = (tourney) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    registerTournament(tourney.id);
  };

  const handleUnregisterClick = (tourney) => {
    setCancelingTournament(tourney);
  };

  const handleEnterArena = (tourney) => {
    setActiveArenaTournament(tourney);
  };

  // If student entered Tournament Arena, render official arena view!
  if (activeArenaTournament) {
    return (
      <TournamentArena
        tournament={activeArenaTournament}
        onExitArena={() => setActiveArenaTournament(null)}
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3E62] via-[#0B192C] to-[#1E3E62] border border-[#008DDA]/30 p-8 shadow-2xl box-glow">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008DDA]/20 border border-[#008DDA]/40 text-[#008DDA] text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> การแข่งขันคณิตศาสตร์ภายในโรงเรียน (Intramural School Tournament)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            เวทีประลองปัญญา <span className="text-[#008DDA] glow-primary">คณิตศาสตร์ระดับโรงเรียน</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-4">
            แบ่งสายการแข่งขันอย่างชัดเจนระหว่าง <strong>สาย ม.ต้น (ม.1 - ม.3)</strong> และ <strong>สาย ม.ปลาย (ม.4 - ม.6)</strong> 
            นักเรียนต้องลงทะเบียนล่วงหน้าเพื่อรับสิทธิ์เข้าสู่ห้องแข่งขันจริง (Tournament Arena) 
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
              {cat.label}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2 self-end md:self-auto text-xs">
          <span className="text-slate-400 font-medium">สถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B192C] border border-white/15 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-[#008DDA] text-xs font-semibold"
          >
            <option value="all">ทั้งหมด (All)</option>
            <option value="open">🟢 กำลังเปิดรับสมัคร (Open)</option>
            <option value="live">🔥 กำลังแข่งขันสด (Live)</option>
            <option value="closed">🔴 ปิดรับสมัครแล้ว (Closed)</option>
          </select>
        </div>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tourney) => {
          const registered = isUserRegistered(tourney);
          const forfeited = isUserForfeited(tourney);
          const participantCount = tourney.registeredStudents?.length || 0;
          const capacityPercent = Math.min(100, Math.round((participantCount / tourney.maxParticipants) * 100));
          const isFull = participantCount >= tourney.maxParticipants;

          return (
            <div
              key={tourney.id}
              className={`flex flex-col bg-[#1E3E62]/70 border rounded-3xl p-5 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl backdrop-blur-md relative overflow-hidden group ${
                tourney.status === 'live'
                  ? 'border-rose-500/80 ring-2 ring-rose-500/30 shadow-rose-900/30'
                  : 'border-white/10 hover:border-[#008DDA]/50'
              }`}
            >
              {/* Top Badges: Division + Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className={`text-[11px] font-black px-2.5 py-1 rounded-full border ${
                  tourney.division === 'junior'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                }`}>
                  {tourney.divisionName || (tourney.division === 'junior' ? 'ม.ต้น (ม.1 - ม.3)' : 'ม.ปลาย (ม.4 - ม.6)')}
                </span>

                {/* Status Badges: Distinct Vibrant Live Badge */}
                {tourney.status === 'live' ? (
                  <span className="flex items-center gap-1.5 text-[11px] font-black px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white shadow-lg shadow-rose-600/40 border border-rose-400 animate-pulse">
                    <Flame className="w-3.5 h-3.5 fill-current text-amber-200 animate-bounce" /> กำลังแข่งขันสด (Live)
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

                {/* Live Watch Button for spectators */}
                {tourney.status === 'live' && tourney.matches?.some(m => m.status === 'live') && (
                  <button
                    type="button"
                    onClick={() => {
                      const matchToWatch = tourney.matches.find(m => m.status === 'live');
                      setSpectatorMatch(matchToWatch);
                      setSpectatorTournament(tourney);
                    }}
                    className="px-2.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-1 shadow-md shadow-rose-500/10 active:scale-95"
                    title="เข้าชมการแข่งขันสด (Live Spectator Mode)"
                  >
                    <Eye className="w-3.5 h-3.5 text-rose-400 animate-pulse" /> ชมสด (Live)
                  </button>
                )}

                {registered ? (
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

      {filteredTournaments.length === 0 && (
        <div className="text-center py-16 bg-[#1E3E62]/30 rounded-3xl border border-white/5">
          <Trophy className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-semibold">ไม่พบรายการแข่งขันในหมวดหมู่นี้</p>
          <p className="text-slate-500 text-xs mt-1">ลองเปลี่ยนตัวกรองระดับชั้นหรือประเภทเกมเพื่อค้นหารอบแข่งขันอื่น</p>
        </div>
      )}

      {/* Tournament Details Modal */}
      {selectedTournament && (
        <Modal
          isOpen={Boolean(selectedTournament)}
          onClose={() => setSelectedTournament(null)}
          title={selectedTournament.title}
        >
          <div className="space-y-4 text-sm text-slate-200">
            <div className="p-3 bg-[#0B192C]/80 rounded-xl border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs text-[#008DDA] font-bold">
                  {selectedTournament.categoryName} • {selectedTournament.roundName}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  {selectedTournament.divisionName}
                </span>
              </div>
              <div className="text-xs text-slate-300">{selectedTournament.description}</div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> กติกาการแข่งขัน
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                {selectedTournament.rules?.map((r, i) => (
                  <li key={i}>{r}</li>
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

      {/* Live Spectator Modal */}
      {spectatorMatch && (
        <LiveSpectatorModal
          isOpen={Boolean(spectatorMatch)}
          onClose={() => {
            setSpectatorMatch(null);
            setSpectatorTournament(null);
          }}
          match={spectatorMatch}
          tournament={spectatorTournament}
        />
      )}
    </div>
  );
}
