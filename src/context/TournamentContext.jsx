import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { useAuth } from './AuthContext';

const TournamentContext = createContext();

export function TournamentProvider({ children }) {
  const [tournaments, setTournaments] = useState(() => storageService.getTournaments());
  const [activeToast, setActiveToast] = useState(null);
  const [activeAlertMatch, setActiveAlertMatch] = useState(null);
  const { currentUser, updateStudentData } = useAuth();

  useEffect(() => {
    storageService.saveTournaments(tournaments);
  }, [tournaments]);

  // Check for tournaments starting in 15 minutes or registered matches
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'student') return;

    // Check if student is registered for tourney-1 which is set to start in 15 mins
    const userTournaments = tournaments.filter(t => 
      t.registeredStudents?.includes(currentUser.studentId)
    );

    const upcomingWithin15Min = userTournaments.find(t => {
      const start = new Date(t.startDate).getTime();
      const now = Date.now();
      const diffMinutes = (start - now) / (1000 * 60);
      return diffMinutes > 0 && diffMinutes <= 20;
    });

    if (upcomingWithin15Min) {
      setActiveAlertMatch(upcomingWithin15Min);
    }
  }, [tournaments, currentUser]);

  // Show a toast message
  const showToast = (message, type = 'info', duration = 5000) => {
    setActiveToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setActiveToast(prev => (prev?.id === activeToast?.id ? null : prev));
    }, duration);
  };

  const closeToast = () => setActiveToast(null);

  // Manual Trigger for 15-Minute Countdown Alert Demo
  const trigger15MinAlert = (tournamentId) => {
    const target = tournaments.find(t => t.id === tournamentId) || tournaments[0];
    setActiveAlertMatch(target);
    showToast(`⏰ แจ้งเตือนด่วน: รายการ "${target.title}" จะเริ่มแข่งขันในอีก 15 นาที! กรุณาเตรียมตัว`, 'warning', 7000);
  };

  const dismissMatchAlert = () => {
    setActiveAlertMatch(null);
  };

  // Student Register for Tournament
  const registerTournament = (tournamentId) => {
    if (!currentUser || currentUser.role !== 'student') {
      showToast('กรุณาเข้าสู่ระบบด้วยรหัสนักเรียนก่อนลงทะเบียน', 'error');
      return false;
    }

    const tourney = tournaments.find(t => t.id === tournamentId);
    if (!tourney) return false;

    if (!tourney.isRegistrationOpen || tourney.status !== 'open') {
      showToast('รายการนี้ไม่ได้อยู่ในช่วงเปิดรับสมัคร', 'error');
      return false;
    }

    if (tourney.registeredStudents?.includes(currentUser.studentId)) {
      showToast('คุณได้ลงทะเบียนรายการนี้ไปแล้ว', 'warning');
      return false;
    }

    if (tourney.registeredStudents?.length >= tourney.maxParticipants) {
      showToast('รายการนี้มีผู้สมัครครบตามจำนวนจำกัดแล้ว', 'error');
      return false;
    }

    // Update Tournament
    const updatedTournaments = tournaments.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          registeredStudents: [...(t.registeredStudents || []), currentUser.studentId]
        };
      }
      return t;
    });
    setTournaments(updatedTournaments);

    // Update Student Profile
    const updatedStudent = {
      ...currentUser,
      registeredTournaments: [...(currentUser.registeredTournaments || []), tournamentId]
    };
    updateStudentData(updatedStudent);

    showToast(`🎉 ลงทะเบียนสำเร็จ: "${tourney.title}"`, 'success');
    return true;
  };

  // Student Cancel Registration
  const unregisterTournament = (tournamentId) => {
    if (!currentUser || currentUser.role !== 'student') return false;

    const tourney = tournaments.find(t => t.id === tournamentId);
    if (!tourney) return false;

    const updatedTournaments = tournaments.map(t => {
      if (t.id === tournamentId) {
        return {
          ...t,
          registeredStudents: (t.registeredStudents || []).filter(id => id !== currentUser.studentId)
        };
      }
      return t;
    });
    setTournaments(updatedTournaments);

    const updatedStudent = {
      ...currentUser,
      registeredTournaments: (currentUser.registeredTournaments || []).filter(id => id !== tournamentId)
    };
    updateStudentData(updatedStudent);

    showToast(`ยกเลิกการลงทะเบียน "${tourney.title}" เรียบร้อยแล้ว`, 'info');
    return true;
  };

  // Admin Actions
  const toggleTournamentRegistration = (tournamentId) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        const nextState = !t.isRegistrationOpen;
        const nextStatus = nextState ? 'open' : 'closed';
        return { ...t, isRegistrationOpen: nextState, status: nextStatus };
      }
      return t;
    }));
    showToast('อัปเดตสถานะการรับสมัครเรียบร้อยแล้ว', 'success');
  };

  const updateTournament = (updatedTourney) => {
    setTournaments(prev => prev.map(t => t.id === updatedTourney.id ? updatedTourney : t));
    showToast(`อัปเดตรายการ "${updatedTourney.title}" สำเร็จ`, 'success');
  };

  const addTournament = (newTourney) => {
    setTournaments(prev => [newTourney, ...prev]);
    showToast(`เพิ่มการแข่งขันใหม่: "${newTourney.title}" สำเร็จ`, 'success');
  };

  const deleteTournament = (tournamentId) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    showToast('ลบรายการแข่งขันเรียบร้อยแล้ว', 'info');
  };

  // Record Match result
  const recordMatchResult = (tournamentId, matchId, player1Score, player2Score, winnerId, roomStatus = 'closed') => {
    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        const updatedMatches = (t.matches || []).map(m => {
          if (m.matchId === matchId) {
            return {
              ...m,
              player1: { ...m.player1, score: player1Score },
              player2: { ...m.player2, score: player2Score },
              winner: winnerId,
              status: 'finished',
              roomStatus
            };
          }
          return m;
        });
        return { ...t, matches: updatedMatches };
      }
      return t;
    }));
    showToast('บันทึกผลการแข่งขันและปิดห้องแข่งขันเรียบร้อยแล้ว', 'success');
  };

  return (
    <TournamentContext.Provider
      value={{
        tournaments,
        registerTournament,
        unregisterTournament,
        toggleTournamentRegistration,
        updateTournament,
        addTournament,
        deleteTournament,
        recordMatchResult,
        activeToast,
        showToast,
        closeToast,
        activeAlertMatch,
        dismissMatchAlert,
        trigger15MinAlert
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export const useTournament = () => useContext(TournamentContext);
