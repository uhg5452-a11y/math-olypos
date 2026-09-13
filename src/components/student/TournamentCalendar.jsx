import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, CheckCircle2, ChevronRight, Sparkles, Eye, Layers, Flame } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import LiveSpectatorModal from '../spectator/LiveSpectatorModal';

export default function TournamentCalendar() {
  const { tournaments } = useTournament();
  const { currentUser } = useAuth();
  const [divisionFilter, setDivisionFilter] = useState('all');
  const [spectatorMatch, setSpectatorMatch] = useState(null);
  const [spectatorTournament, setSpectatorTournament] = useState(null);

  // Filter & Sort tournaments by start date
  const filteredTournaments = tournaments.filter(t => 
    divisionFilter === 'all' || t.division === divisionFilter
  );

  const sortedTournaments = [...filteredTournaments].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
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
            ติดตามตารางเวลาเริ่มแข่งขันของแต่ละระดับชั้น (สาย ม.ต้น & สาย ม.ปลาย) โรงเรียนบรรหารแจ่มใสวิทยา 3
          </p>
        </div>
      </div>

      {/* Division Selector */}
      <div className="flex items-center gap-2 bg-[#0B192C]/90 p-2 rounded-2xl border border-white/10 shadow-lg">
        <span className="text-xs font-bold text-slate-400 px-3 hidden sm:flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#008DDA]" /> ระดับชั้น:
        </span>
        <button
          onClick={() => setDivisionFilter('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            divisionFilter === 'all' ? 'bg-[#008DDA] text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          ทุกระดับชั้น
        </button>
        <button
          onClick={() => setDivisionFilter('junior')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            divisionFilter === 'junior' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          📘 สาย ม.ต้น (ม.1 - ม.3)
        </button>
        <button
          onClick={() => setDivisionFilter('senior')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all text-center ${
            divisionFilter === 'senior' ? 'bg-purple-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          📙 สาย ม.ปลาย (ม.4 - ม.6)
        </button>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-[#008DDA]/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 py-2">
        {sortedTournaments.map((tourney, idx) => {
          const startDate = new Date(tourney.startDate);
          const isRegistered = currentUser && tourney.registeredStudents?.includes(currentUser.studentId);
          const timeFormatted = startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = startDate.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });
          const isLiveNow = tourney.status === 'live';
          const liveMatch = tourney.matches?.find(m => m.status === 'live');

          return (
            <div key={tourney.id} className="relative group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-[#0B192C] border-2 border-[#008DDA] flex items-center justify-center text-[10px] font-bold text-[#008DDA] shadow-lg group-hover:scale-125 transition-transform">
                {idx + 1}
              </div>

              {/* Card */}
              <div className={`bg-[#1E3E62]/60 hover:bg-[#1E3E62]/90 border rounded-2xl p-5 shadow-xl transition-all backdrop-blur-md ${
                isLiveNow ? 'border-rose-500 ring-2 ring-rose-500/20' : 'border-white/10 hover:border-[#008DDA]/50'
              }`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="px-3 py-1 rounded-lg bg-[#0B192C] text-[#008DDA] font-mono text-xs font-bold border border-white/5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#008DDA]" /> {dateFormatted} • {timeFormatted} น.
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                      tourney.division === 'junior'
                        ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                        : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                    }`}>
                      {tourney.divisionName || (tourney.division === 'junior' ? 'ม.ต้น' : 'ม.ปลาย')}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {tourney.roundName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tourney.status === 'live' ? (
                      <span className="text-xs font-black px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 text-white shadow-lg shadow-rose-600/30 border border-rose-400 flex items-center gap-1.5 animate-pulse">
                        <Flame className="w-3.5 h-3.5 fill-current text-amber-200 animate-bounce" /> กำลังแข่งขันสด (Live)
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

                    {isLiveNow && liveMatch && (
                      <button
                        onClick={() => {
                          setSpectatorMatch(liveMatch);
                          setSpectatorTournament(tourney);
                        }}
                        className="px-3.5 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-lg shadow-rose-500/30 flex items-center gap-1.5 transition-all"
                      >
                        <Eye className="w-4 h-4 animate-pulse" /> เข้าชมสด
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
