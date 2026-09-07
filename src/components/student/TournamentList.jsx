import React, { useState } from 'react';
import { Trophy, Calendar, Users, Clock, CheckCircle, AlertCircle, ArrowRight, ShieldCheck, Sparkles, Filter } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';

export default function TournamentList({ onOpenLogin }) {
  const { tournaments, registerTournament, unregisterTournament } = useTournament();
  const { currentUser, isStudent } = useAuth();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTournament, setSelectedTournament] = useState(null);

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
    const matchCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || 
      (statusFilter === 'open' && t.isRegistrationOpen) ||
      (statusFilter === 'closed' && !t.isRegistrationOpen && t.status !== 'live') ||
      (statusFilter === 'live' && t.status === 'live');
    return matchCategory && matchStatus;
  });

  const isUserRegistered = (tourney) => {
    if (!currentUser || !currentUser.studentId) return false;
    return tourney.registeredStudents?.includes(currentUser.studentId);
  };

  const handleRegisterClick = (tourney) => {
    if (!currentUser) {
      onOpenLogin();
      return;
    }
    registerTournament(tourney.id);
  };

  const handleUnregisterClick = (tourney) => {
    if (window.confirm(`ยืนยันการยกเลิกการสมัครรายการ "${tourney.title}" หรือไม่?`)) {
      unregisterTournament(tourney.id);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3E62] via-[#0B192C] to-[#1E3E62] border border-[#008DDA]/30 p-8 shadow-2xl box-glow">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#008DDA]/20 border border-[#008DDA]/40 text-[#008DDA] text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> ระบบการแข่งขันแบบเปิด-ปิดตามรอบอย่างเป็นทางการ
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
            เวทีประลองปัญญา <span className="text-[#008DDA] glow-primary">คณิตศาสตร์โอลิมปิก</span>
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed mb-6">
            รายการแข่งขันจัดขึ้นเป็นรอบตามที่แอดมินกำหนด นักเรียนสามารถตรวจสอบตารางเวลา 
            กดลงทะเบียน และรับการแจ้งเตือนสดก่อนเริ่มแข่งขัน 15 นาที
          </p>

          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> ตรวจจับเวลาแข่งขันอัตโนมัติ
            </div>
            <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <Clock className="w-4 h-4 text-amber-400" /> ระบบแจ้งเตือน 15 นาทีก่อนแข่ง
            </div>
          </div>
        </div>

        {/* Decorative Background Math equations */}
        <div className="absolute -right-6 -bottom-8 opacity-15 select-none pointer-events-none text-right font-mono text-7xl text-[#008DDA] leading-none">
          <div>∑(n²)</div>
          <div className="text-4xl">lim x→∞</div>
        </div>
      </div>

      {/* Filter Toolbar */}
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
            <option value="live">⚡ กำลังแข่งขัน (Live)</option>
            <option value="closed">🔴 ปิดรับสมัครแล้ว (Closed)</option>
          </select>
        </div>
      </div>

      {/* Tournament Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTournaments.map((tourney) => {
          const registered = isUserRegistered(tourney);
          const participantCount = tourney.registeredStudents?.length || 0;
          const capacityPercent = Math.min(100, Math.round((participantCount / tourney.maxParticipants) * 100));
          const isFull = participantCount >= tourney.maxParticipants;

          return (
            <div
              key={tourney.id}
              className="flex flex-col bg-[#1E3E62]/70 border border-white/10 hover:border-[#008DDA]/50 rounded-2xl p-5 shadow-xl transition-all hover:-translate-y-1 hover:shadow-2xl hover:box-glow backdrop-blur-md relative overflow-hidden group"
            >
              {/* Status & Round Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
                  {tourney.roundName}
                </span>

                {tourney.status === 'live' ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span> กำลังแข่ง (Live)
                  </span>
                ) : tourney.isRegistrationOpen ? (
                  <span className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> เปิดรับสมัคร
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                    ปิดรับสมัครแล้ว
                  </span>
                )}
              </div>

              {/* Title & Category */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-slate-400 mb-1">
                  {tourney.categoryName}
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#008DDA] transition-colors line-clamp-2">
                  {tourney.title}
                </h3>
              </div>

              <p className="text-xs text-slate-300/80 line-clamp-2 mb-4 leading-relaxed">
                {tourney.description}
              </p>

              {/* Match Schedule / Countdown Info */}
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

              {/* Registered Badge if applicable */}
              {registered && (
                <div className="mb-3 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>คุณได้ลงทะเบียนรอบนี้แล้ว</span>
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
          <p className="text-slate-500 text-xs mt-1">ลองเปลี่ยนตัวกรองเพื่อค้นหารอบแข่งขันอื่น</p>
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
              <div className="text-xs text-[#008DDA] font-bold mb-1">
                {selectedTournament.categoryName} • {selectedTournament.roundName}
              </div>
              <p className="text-xs text-slate-300">{selectedTournament.description}</p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#008DDA]" /> กติกาการแข่งขัน:
              </h4>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-300 bg-[#0B192C]/50 p-3 rounded-xl border border-white/5">
                {selectedTournament.rules?.map((rule, idx) => (
                  <li key={idx}>{rule}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" /> รางวัลและเกียรติบัตร:
              </h4>
              <p className="text-xs text-amber-300/90 bg-amber-950/30 p-3 rounded-xl border border-amber-500/20">
                {selectedTournament.prizes}
              </p>
            </div>

            {/* Match Pairing / History in this tournament */}
            {selectedTournament.matches && selectedTournament.matches.length > 0 && (
              <div>
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#008DDA]" /> ผลการแข่งขันในรอบนี้:
                </h4>
                <div className="space-y-2">
                  {selectedTournament.matches.map((m) => (
                    <div
                      key={m.matchId}
                      className="p-2.5 rounded-xl bg-[#0B192C] border border-white/10 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono bg-white/10 px-1.5 py-0.5 rounded text-slate-300">
                          โต๊ะ {m.tableNo}
                        </span>
                        <span className={m.winner === m.player1.id ? 'font-bold text-emerald-400' : 'text-slate-300'}>
                          {m.player1.name} {m.player1.score !== null && `(${m.player1.score})`}
                        </span>
                        <span className="text-slate-500 font-bold">vs</span>
                        <span className={m.winner === m.player2.id ? 'font-bold text-emerald-400' : 'text-slate-300'}>
                          {m.player2.name} {m.player2.score !== null && `(${m.player2.score})`}
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        m.status === 'finished' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {m.status === 'finished' ? 'จบแล้ว' : 'กำลังแข่ง'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
