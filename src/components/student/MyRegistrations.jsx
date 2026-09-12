import React, { useState } from 'react';
import { Trophy, Calendar, Clock, ArrowRight, XCircle, CheckCircle2, User, Award, Flame, Gamepad2 } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import CancelRegistrationModal from './CancelRegistrationModal';

export default function MyRegistrations({ onNavigateToTournaments }) {
  const { tournaments, unregisterTournament } = useTournament();
  const { currentUser, isStudent } = useAuth();
  const [cancelingTourney, setCancelingTourney] = useState(null);

  const handleEnterMatch = (tourney) => {
    const game = tourney.category || 'a-math';
    const url = new URL(window.location.href);
    url.searchParams.set('game', game);
    url.searchParams.delete('room');
    url.searchParams.delete('role');
    window.history.pushState({}, '', url.toString());
    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'practice', game } }));
  };

  if (!currentUser || !isStudent) {
    return (
      <div className="text-center py-20 bg-[#1E3E62]/40 rounded-3xl border border-white/10 backdrop-blur-md">
        <User className="w-12 h-12 text-[#008DDA] mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">กรุณาเข้าสู่ระบบด้วยบัญชีนักเรียน</h2>
        <p className="text-xs text-slate-400 mb-6">คุณต้องเข้าสู่ระบบด้วยรหัสนักเรียนเพื่อดูประวัติการลงทะเบียนของตนเอง</p>
      </div>
    );
  }

  const myTournaments = tournaments.filter(t =>
    t.registeredStudents?.includes(currentUser.studentId)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Student Profile Banner */}
      <div className="bg-gradient-to-r from-[#1E3E62] via-[#0B192C] to-[#1E3E62] border border-[#008DDA]/30 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#008DDA] to-blue-700 flex items-center justify-center text-3xl shadow-lg shadow-blue-500/30">
              {currentUser.avatar || '🧑‍🎓'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{currentUser.name}</h1>
                <span className="text-xs font-mono font-bold bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30 px-2 py-0.5 rounded-full">
                  {currentUser.studentId}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                {currentUser.school} • {currentUser.grade}
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">Olympiad Elo</div>
              <div className="text-lg font-black text-[#008DDA] glow-primary">{currentUser.elo || 1800}</div>
            </div>
            <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">รายการที่ลงทะเบียน</div>
              <div className="text-lg font-black text-white">{myTournaments.length}</div>
            </div>
            <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3">
              <div className="text-[10px] uppercase font-bold text-slate-400">เหรียญทอง</div>
              <div className="text-lg font-black text-amber-400">{currentUser.stats?.goldMedals || 0} 🥇</div>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Tournaments Section */}
      <div className="bg-[#1E3E62]/40 rounded-3xl p-6 border border-white/10 backdrop-blur-md">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#008DDA]" /> รายการแข่งขันที่ลงทะเบียนไว้
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              ตรวจสอบสถานะ เวลาแข่งขัน และยกเลิกการสมัครได้ตลอดช่วงที่เปิดรับสมัคร
            </p>
          </div>

          <button
            onClick={onNavigateToTournaments}
            className="px-4 py-2 rounded-xl bg-[#008DDA]/20 hover:bg-[#008DDA]/30 border border-[#008DDA]/40 text-[#008DDA] text-xs font-bold transition-all flex items-center gap-1.5"
          >
            ค้นหารายการแข่งขันเพิ่ม <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {myTournaments.length > 0 ? (
          <div className="space-y-4">
            {myTournaments.map((tourney) => (
              <div
                key={tourney.id}
                className="bg-[#0B192C]/90 border border-white/10 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-[#008DDA]/40"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA]">
                      {tourney.roundName}
                    </span>
                    <span className="text-xs text-slate-400">• {tourney.categoryName}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">
                    {tourney.title}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#008DDA]" />
                      {new Date(tourney.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#008DDA]" />
                      {new Date(tourney.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => handleEnterMatch(tourney)}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all border border-emerald-400/40"
                  >
                    <Gamepad2 className="w-3.5 h-3.5" /> เข้าสู่การแข่งขัน (Enter Match)
                  </button>

                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ลงทะเบียนแล้ว
                  </span>

                  {tourney.isRegistrationOpen && (
                    <button
                      type="button"
                      onClick={() => setCancelingTourney(tourney)}
                      className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-all flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> ยกเลิก
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#0B192C]/50 rounded-2xl border border-dashed border-white/10">
            <Trophy className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-300 font-semibold text-sm">คุณยังไม่ได้ลงทะเบียนรายการใด</p>
            <p className="text-slate-500 text-xs mt-1 mb-4">สำรวจรายการแข่งขันที่กำลังเปิดรับสมัครและกดลงทะเบียนเพื่อร่วมประลอง</p>
            <button
              onClick={onNavigateToTournaments}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#008DDA] to-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-500/20"
            >
              ดูรอบการแข่งขันที่เปิดรับสมัคร
            </button>
          </div>
        )}

        {/* Cancel Registration Confirmation Modal */}
        {cancelingTourney && (
          <CancelRegistrationModal
            isOpen={Boolean(cancelingTourney)}
            onClose={() => setCancelingTourney(null)}
            onConfirm={unregisterTournament}
            tournament={cancelingTourney}
          />
        )}
      </div>
    </div>
  );
}
