import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Sparkles, Layers, Flame, Lock } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';

export default function TournamentCalendar() {
  const { tournaments } = useTournament();
  const { currentUser } = useAuth();
  const [divisionFilter, setDivisionFilter] = useState('all');

  // Helper for grade division
  const getStudentDivision = (gradeStr) => {
    if (!gradeStr) return null;
    const g = gradeStr.toLowerCase();
    if (g.includes('ม.1') || g.includes('ม.2') || g.includes('ม.3') || g.includes('junior')) return 'junior';
    if (g.includes('ม.4') || g.includes('ม.5') || g.includes('ม.6') || g.includes('senior')) return 'senior';
    return null;
  };

  const userDivision = currentUser ? getStudentDivision(currentUser.grade) : null;

  // Filter & Sort tournaments by start date
  const filteredTournaments = tournaments.filter(t => 
    divisionFilter === 'all' || t.division === divisionFilter
  );

  const sortedTournaments = [...filteredTournaments].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="bg-[#1E3E62]/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-[#008DDA] text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" /> ตารางการแข่งขันและไทม์ไลน์รอบแข่ง
          </div>
          <h2 className="text-2xl font-black text-white">
            ปฏิทินการแข่งขัน <span className="text-[#008DDA] glow-primary">School Competition Schedule</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            ติดตามตารางเวลาเริ่มแข่งขันของแต่ละระดับชั้น (สาย ม.ต้น & สาย ม.ปลาย) โรงเรียนบรรหารแจ่มใสวิทยา 3 (บ.จ.3)
          </p>
        </div>
      </div>

      {/* Division Selector */}
      <div className="flex items-center gap-2 bg-[#0B192C]/90 p-2 rounded-2xl border border-white/10 shadow-lg">
        <span className="text-xs font-bold text-slate-400 px-3 hidden sm:flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#008DDA]" /> สายการแข่งขัน:
        </span>
        <button
          onClick={() => setDivisionFilter('all')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center ${
            divisionFilter === 'all'
              ? 'bg-[#008DDA] text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          ทุกสายชั้น (All)
        </button>
        <button
          onClick={() => setDivisionFilter('junior')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            divisionFilter === 'junior'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📘 สาย ม.ต้น (ม.1 - ม.3)</span>
        </button>
        <button
          onClick={() => setDivisionFilter('senior')}
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5 ${
            divisionFilter === 'senior'
              ? 'bg-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span>📙 สาย ม.ปลาย (ม.4 - ม.6)</span>
        </button>
      </div>

      {/* Timeline List */}
      {sortedTournaments.length === 0 ? (
        <div className="text-center py-16 bg-[#1E3E62]/30 rounded-3xl border border-dashed border-white/10 p-8">
          <CalendarIcon className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-white">ยังไม่มีกำหนดการแข่งขันในขณะนี้</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            เมื่อคณะกรรมการจัดการแข่งขันสร้างรอบการแข่งขันใหม่ กำหนดวันและเวลาจะปรากฏบนปฏิทินนี้ทันที
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedTournaments.map((tourney) => {
            const isRegistered = currentUser && tourney.registeredStudents?.includes(currentUser.studentId);
            const isJunior = tourney.division === 'junior';
            const isGradeMismatch = Boolean(currentUser && tourney.division && userDivision && tourney.division !== userDivision);

            return (
              <div
                key={tourney.id}
                className={`relative overflow-hidden bg-[#1E3E62]/40 border rounded-3xl p-5 sm:p-6 backdrop-blur-md transition-all hover:border-[#008DDA]/40 ${
                  tourney.status === 'live'
                    ? 'border-orange-500/60 shadow-xl shadow-orange-500/10'
                    : 'border-white/10'
                }`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono text-cyan-400 bg-blue-500/10 px-2.5 py-1 rounded-lg border border-blue-500/20">
                        {tourney.categoryName}
                      </span>
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
                        isJunior
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                          : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                      }`}>
                        {tourney.divisionName || (isJunior ? 'สาย ม.ต้น' : 'สาย ม.ปลาย')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-xs text-slate-300 font-medium flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{new Date(tourney.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</span>
                        <span>•</span>
                        <span className="text-white font-mono font-bold">
                          {new Date(tourney.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </span>
                      </div>

                      {tourney.status === 'live' ? (
                        <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-orange-600 via-amber-500 to-rose-600 text-white shadow-lg shadow-orange-600/30 border border-amber-300 flex items-center gap-1.5 animate-pulse">
                          <Flame className="w-3.5 h-3.5 fill-current text-yellow-200 animate-bounce" /> กำลังแข่งขัน (Match in Progress)
                        </span>
                      ) : tourney.isRegistrationOpen ? (
                        <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          🟢 เปิดรับสมัคร
                        </span>
                      ) : (
                        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-400">
                          ปิดรับสมัครแล้ว
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-black text-white">{tourney.title}</h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl">{tourney.description}</p>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      {isRegistered && (
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4" /> ลงทะเบียนแล้ว
                        </span>
                      )}

                      {isGradeMismatch && (
                        <span className="px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs font-bold flex items-center gap-1">
                          <Lock className="w-3.5 h-3.5 text-amber-400" /> ล็อกระดับชั้น
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
