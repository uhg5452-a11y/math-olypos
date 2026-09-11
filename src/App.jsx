import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import { GameProvider } from './context/GameContext';
import MathBackground from './components/layout/MathBackground';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotificationToast from './components/common/NotificationToast';
import LoginModal from './components/auth/LoginModal';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Views
import TournamentList from './components/student/TournamentList';
import TournamentCalendar from './components/student/TournamentCalendar';
import MyRegistrations from './components/student/MyRegistrations';
import GamesHub from './components/games/GamesHub';
import LeaderboardView from './components/leaderboard/LeaderboardView';
import AdminDashboard from './components/admin/AdminDashboard';

function MainContent() {
  const [currentView, setCurrentView] = useState('tournaments');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { currentUser, isAdmin } = useAuth();

  // Check URL parameters for Direct Room Link (Requirement 2)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setCurrentView('practice');
    }
  }, []);

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('tournaments');
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Floating Math Symbols Background */}
      <MathBackground />

      {/* Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {currentView === 'tournaments' && (
          <TournamentList onOpenLogin={() => setIsLoginOpen(true)} />
        )}

        {currentView === 'calendar' && (
          <TournamentCalendar />
        )}

        {currentView === 'practice' && (
          <GamesHub />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView />
        )}

        {currentView === 'my-registrations' && (
          <MyRegistrations onNavigateToTournaments={() => setCurrentView('tournaments')} />
        )}

        {/* Admin Dashboard with Strict RBAC (Requirement 5) */}
        {currentView === 'admin' && (
          isAdmin ? (
            <AdminDashboard onOpenLogin={() => setIsLoginOpen(true)} />
          ) : (
            <div className="text-center py-20 bg-[#1E3E62]/40 rounded-3xl border border-rose-500/30 backdrop-blur-md max-w-xl mx-auto p-8 shadow-2xl animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto mb-4">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-white">Access Denied (ปฏิเสธการเข้าถึง)</h2>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                หน้านี้จำกัดสิทธิ์เฉพาะ 2 บัญชีอีเมลผู้สร้างระบบที่ได้รับการรับรองในระบบ Whitelist เท่านั้น บัญชีอื่นไม่มีสิทธิ์เข้าถึงข้อมูลแอดมิน
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <button
                  onClick={() => setCurrentView('tournaments')}
                  className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> กลับหน้าหลัก
                </button>
                <button
                  onClick={() => setIsLoginOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-[#008DDA] hover:bg-cyan-500 text-white text-xs font-bold transition-all"
                >
                  เข้าสู่ระบบแอดมิน
                </button>
              </div>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Notification Toast System */}
      <NotificationToast />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TournamentProvider>
        <GameProvider>
          <MainContent />
        </GameProvider>
      </TournamentProvider>
    </AuthProvider>
  );
}
