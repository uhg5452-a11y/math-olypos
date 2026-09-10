import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TournamentProvider } from './context/TournamentContext';
import { GameProvider } from './context/GameContext';
import MathBackground from './components/layout/MathBackground';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import NotificationToast from './components/common/NotificationToast';
import MatchAlertBanner from './components/common/MatchAlertBanner';
import LoginModal from './components/auth/LoginModal';

// Views
import TournamentList from './components/student/TournamentList';
import TournamentCalendar from './components/student/TournamentCalendar';
import MyRegistrations from './components/student/MyRegistrations';
import GamesHub from './components/games/GamesHub';
import LeaderboardView from './components/leaderboard/LeaderboardView';
import AdminDashboard from './components/admin/AdminDashboard';
import CentralArenaDisplay from './components/arena/CentralArenaDisplay';

function MainContent() {
  const [currentView, setCurrentView] = useState('tournaments');
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { isAdmin } = useAuth();

  const handleLoginSuccess = (role) => {
    if (role === 'admin') {
      setCurrentView('admin');
    } else {
      setCurrentView('tournaments');
    }
  };

  const handleAlertNavigate = (tourneyId) => {
    setCurrentView('tournaments');
  };

  return (
    <div className="min-h-screen flex flex-col relative z-10">
      {/* Floating Math Symbols Background */}
      <MathBackground />

      {/* 15-Minute Countdown Alert Banner */}
      <MatchAlertBanner onNavigateToTournament={handleAlertNavigate} />

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

        {currentView === 'arena' && (
          <CentralArenaDisplay />
        )}

        {currentView === 'my-registrations' && (
          <MyRegistrations onNavigateToTournaments={() => setCurrentView('tournaments')} />
        )}

        {currentView === 'admin' && (
          <AdminDashboard onOpenLogin={() => setIsLoginOpen(true)} />
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
