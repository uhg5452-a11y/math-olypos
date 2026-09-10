import React from 'react';
import { Trophy, Calendar, Gamepad2, Award, Shield, User, LogOut, LogIn, Bell, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTournament } from '../../context/TournamentContext';

export default function Navbar({ currentView, setCurrentView, onOpenLogin }) {
  const { currentUser, isAdmin, isStudent, logout } = useAuth();
  const { trigger15MinAlert, tournaments } = useTournament();

  const handleTestAlert = () => {
    // Find tourney-1
    const t = tournaments.find(item => item.id === 'tourney-1') || tournaments[0];
    trigger15MinAlert(t.id);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#0B192C]/90 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div
            onClick={() => setCurrentView('tournaments')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#008DDA] to-blue-700 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-all">
              ∑
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Math Olympiad <span className="text-[#008DDA] glow-primary">Hub</span>
              </span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium tracking-wide">
                ศูนย์การแข่งขันและฝึกซ้อมคณิตศาสตร์ภายในโรงเรียน
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setCurrentView('tournaments')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                currentView === 'tournaments'
                  ? 'bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Trophy className="w-4 h-4" /> รอบแข่งขัน
            </button>

            <button
              onClick={() => setCurrentView('calendar')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                currentView === 'calendar'
                  ? 'bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Calendar className="w-4 h-4" /> ตารางเวลา
            </button>

            <button
              onClick={() => setCurrentView('practice')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                currentView === 'practice'
                  ? 'bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Gamepad2 className="w-4 h-4" /> ฝึกซ้อม 24 ชม.
              <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-emerald-500/30">
                6 เกม
              </span>
            </button>

            <button
              onClick={() => setCurrentView('leaderboard')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                currentView === 'leaderboard'
                  ? 'bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/40'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <Award className="w-4 h-4" /> กระดานผู้นำ
            </button>

            {/* Student Registration History */}
            {isStudent && (
              <button
                onClick={() => setCurrentView('my-registrations')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
                  currentView === 'my-registrations'
                    ? 'bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <User className="w-4 h-4" /> การสมัครของฉัน
              </button>
            )}

            {/* Admin Dashboard Tab (Protected) */}
            {isAdmin && (
              <button
                onClick={() => setCurrentView('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all ${
                  currentView === 'admin'
                    ? 'bg-amber-500/25 text-amber-300 border border-amber-500/50'
                    : 'text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/10'
                }`}
              >
                <Shield className="w-4 h-4 text-amber-400" /> Admin Dashboard
              </button>
            )}
          </nav>

          {/* Right Action Items */}
          <div className="flex items-center gap-2.5">
            {/* Quick 15-Minute Alert Demo Trigger */}
            <button
              onClick={handleTestAlert}
              title="ทดสอบระบบจำลองแจ้งเตือน 15 นาทีก่อนเริ่มแข่ง"
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border border-white/10 hover:border-amber-500/40 text-xs font-semibold transition-all"
            >
              <Bell className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span>เทสต์แจ้งเตือน 15 นาที</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={() => isStudent ? setCurrentView('my-registrations') : setCurrentView('admin')}
                  className="flex items-center gap-2 p-1.5 pl-2 rounded-xl bg-[#1E3E62]/80 border border-white/10 hover:border-[#008DDA]/40 cursor-pointer transition-all"
                >
                  <span className="text-lg">{currentUser.avatar || (isAdmin ? '👨‍🏫' : '🧑‍🎓')}</span>
                  <div className="text-left hidden lg:block pr-1">
                    <div className="text-xs font-bold text-white leading-tight">
                      {currentUser.name}
                    </div>
                    <div className="text-[10px] text-[#008DDA] font-mono leading-tight">
                      {isAdmin ? `Admin (${currentUser.badge})` : currentUser.studentId}
                    </div>
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-500/30 transition-all"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#008DDA] to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <LogIn className="w-3.5 h-3.5" /> เข้าสู่ระบบ
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around bg-[#0B192C] border-t border-white/5 px-2 py-2 text-xs">
        <button
          onClick={() => setCurrentView('tournaments')}
          className={`px-2 py-1.5 rounded-lg flex flex-col items-center gap-1 ${
            currentView === 'tournaments' ? 'text-[#008DDA]' : 'text-slate-400'
          }`}
        >
          <Trophy className="w-4 h-4" /> แข่งขัน
        </button>
        <button
          onClick={() => setCurrentView('calendar')}
          className={`px-2 py-1.5 rounded-lg flex flex-col items-center gap-1 ${
            currentView === 'calendar' ? 'text-[#008DDA]' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-4 h-4" /> ตาราง
        </button>
        <button
          onClick={() => setCurrentView('practice')}
          className={`px-2 py-1.5 rounded-lg flex flex-col items-center gap-1 ${
            currentView === 'practice' ? 'text-[#008DDA]' : 'text-slate-400'
          }`}
        >
          <Gamepad2 className="w-4 h-4" /> ฝึกซ้อม
        </button>
        <button
          onClick={() => setCurrentView('leaderboard')}
          className={`px-2 py-1.5 rounded-lg flex flex-col items-center gap-1 ${
            currentView === 'leaderboard' ? 'text-[#008DDA]' : 'text-slate-400'
          }`}
        >
          <Award className="w-4 h-4" /> อันดับ
        </button>
        {isAdmin && (
          <button
            onClick={() => setCurrentView('admin')}
            className={`px-2 py-1.5 rounded-lg flex flex-col items-center gap-1 ${
              currentView === 'admin' ? 'text-amber-400' : 'text-slate-400'
            }`}
          >
            <Shield className="w-4 h-4" /> แอดมิน
          </button>
        )}
      </div>
    </header>
  );
}
