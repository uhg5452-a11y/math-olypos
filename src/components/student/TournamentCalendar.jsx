import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Bell, Trophy, CheckCircle2, ChevronRight, AlertCircle, Sparkles } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';

export default function TournamentCalendar() {
  const { tournaments, trigger15MinAlert } = useTournament();
  const { currentUser } = useAuth();
  const [selectedDay, setSelectedDay] = useState('all');

  // Sort tournaments by start date
  const sortedTournaments = [...tournaments].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E3E62]/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-[#008DDA] text-xs font-bold uppercase tracking-wider mb-1">
            <CalendarIcon className="w-4 h-4" /> ตารางการแข่งขันและไทม์ไลน์รอบแข่ง
          </div>
          <h2 className="text-2xl font-black text-white">
            ปฏิทินการแข่งขัน <span className="text-[#008DDA] glow-primary">Olympiad Schedule</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            ติดตามเวลาเริ่มแข่งขันของแต่ละรอบ พร้อมระบบแจ้งเตือนล่วงหน้า 15 นาทีก่อนการแข่งขัน
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => trigger15MinAlert(tournaments[0]?.id)}
            className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center gap-2 shadow-lg active:scale-95"
          >
            <Bell className="w-4 h-4 text-amber-400 animate-bounce" />
            จำลองแจ้งเตือน 15 นาที
          </button>
        </div>
      </div>

      {/* Timeline List */}
      <div className="relative border-l-2 border-[#008DDA]/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-8 py-2">
        {sortedTournaments.map((tourney, idx) => {
          const startDate = new Date(tourney.startDate);
          const isRegistered = currentUser && tourney.registeredStudents?.includes(currentUser.studentId);
          const timeFormatted = startDate.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
          const dateFormatted = startDate.toLocaleDateString('th-TH', { weekday: 'short', day: 'numeric', month: 'short' });

          return (
            <div key={tourney.id} className="relative group">
              {/* Timeline Pin Node */}
              <div className="absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full bg-[#0B192C] border-2 border-[#008DDA] flex items-center justify-center text-[10px] font-bold text-[#008DDA] shadow-lg group-hover:scale-125 transition-transform">
                {idx + 1}
              </div>

              {/* Card */}
              <div className="bg-[#1E3E62]/60 hover:bg-[#1E3E62]/90 border border-white/10 hover:border-[#008DDA]/50 rounded-2xl p-5 shadow-xl transition-all backdrop-blur-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-3 py-1 rounded-lg bg-[#0B192C] text-[#008DDA] font-mono text-xs font-bold border border-white/5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#008DDA]" /> {dateFormatted} • {timeFormatted} น.
                    </span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {tourney.roundName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {tourney.status === 'live' ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-500" /> แข่งขันอยู่ (Live)
                      </span>
                    ) : tourney.isRegistrationOpen ? (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        เปิดรับสมัคร
                      </span>
                    ) : (
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-700 text-slate-400">
                        ปิดรับสมัคร
                      </span>
                    )}

                    {isRegistered && (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-500/20 text-[#008DDA] border border-[#008DDA]/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> ลงทะเบียนแล้ว
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-semibold text-[#008DDA] mb-0.5">
                      {tourney.categoryName}
                    </div>
                    <h3 className="text-lg font-bold text-white group-hover:text-[#008DDA] transition-colors">
                      {tourney.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                      {tourney.description}
                    </p>
                  </div>

                  <button
                    onClick={() => trigger15MinAlert(tourney.id)}
                    className="flex-shrink-0 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-slate-300 hover:text-amber-300 text-xs font-semibold transition-all flex items-center gap-1.5"
                    title="ทดสอบแจ้งเตือนก่อนแข่ง 15 นาที"
                  >
                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                    ตั้งปลุก 15 น.
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
