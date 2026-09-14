import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';
import { realtimeService } from '../services/realtimeService';
import { useAuth } from './AuthContext';

const TournamentContext = createContext();

export function TournamentProvider({ children }) {
  const [tournaments, setTournaments] = useState(() => storageService.getTournaments());
  const [activeToast, setActiveToast] = useState(null);
  const { currentUser, updateStudentData } = useAuth();

  useEffect(() => {
    storageService.saveTournaments(tournaments);
  }, [tournaments]);

  // Real-time synchronization for tournament registrations and match status across devices
  useEffect(() => {
    const unsub = realtimeService.subscribe('system_sync', 'tournament_updated', (payload) => {
      if (payload?.tournaments) {
        setTournaments(payload.tournaments);
      }
    });

    return () => unsub();
  }, []);

  // Show a toast message
  const showToast = (message, type = 'info', duration = 5000) => {
    setActiveToast({ id: Date.now(), message, type });
    setTimeout(() => {
      setActiveToast(prev => (prev?.id === activeToast?.id ? null : prev));
    }, duration);
  };

  const closeToast = () => setActiveToast(null);

  // Student Register for Tournament (Real-time synced)
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

    // Strict Grade-Level Restriction Check (ม.ต้น vs ม.ปลาย)
    const getStudentDivision = (gradeStr) => {
      if (!gradeStr) return null;
      const g = gradeStr.toLowerCase().replace(/\s+/g, '');
      if (
        g.includes('ม.1') || g.includes('ม.2') || g.includes('ม.3') ||
        g.includes('ม1') || g.includes('ม2') || g.includes('ม3') ||
        g.includes('มัธยม1') || g.includes('มัธยม2') || g.includes('มัธยม3') ||
        g.includes('ม.ต้น') || g.includes('มต้น') || g.includes('junior')
      ) return 'junior';
      if (
        g.includes('ม.4') || g.includes('ม.5') || g.includes('ม.6') ||
        g.includes('ม4') || g.includes('ม5') || g.includes('ม6') ||
        g.includes('มัธยม4') || g.includes('มัธยม5') || g.includes('มัธยม6') ||
        g.includes('ม.ปลาย') || g.includes('มปลาย') || g.includes('senior')
      ) return 'senior';
      return null;
    };

    const userDivision = getStudentDivision(currentUser.grade);
    if (tourney.division && userDivision && tourney.division !== userDivision) {
      const tourneyDivName = tourney.division === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)';
      const userDivName = userDivision === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย';
      showToast(`การสมัครถูกล็อก: คุณอยู่ในระดับ ${userDivName} ไม่สามารถลงทะเบียนในรายการ "${tourneyDivName}" ได้`, 'error');
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
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: updatedTournaments });

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
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: updatedTournaments });

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
    const nextTourneys = tournaments.map(t => {
      if (t.id === tournamentId) {
        const nextState = !t.isRegistrationOpen;
        const nextStatus = nextState ? 'open' : 'closed';
        return { ...t, isRegistrationOpen: nextState, status: nextStatus };
      }
      return t;
    });
    setTournaments(nextTourneys);
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: nextTourneys });
    showToast('อัปเดตสถานะการรับสมัครเรียบร้อยแล้ว', 'success');
  };

  const updateTournament = (updatedTourney) => {
    const nextTourneys = tournaments.map(t => t.id === updatedTourney.id ? updatedTourney : t);
    setTournaments(nextTourneys);
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: nextTourneys });
    showToast(`อัปเดตรายการ "${updatedTourney.title}" สำเร็จ`, 'success');
  };

  const addTournament = (newTourney) => {
    const nextTourneys = [newTourney, ...tournaments];
    setTournaments(nextTourneys);
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: nextTourneys });
    showToast(`เพิ่มการแข่งขันใหม่: "${newTourney.title}" สำเร็จ`, 'success');
  };

  const deleteTournament = (tournamentId) => {
    const nextTourneys = tournaments.filter(t => t.id !== tournamentId);
    setTournaments(nextTourneys);
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: nextTourneys });
    showToast('ลบรายการแข่งขันเรียบร้อยแล้ว', 'info');
  };

  // Record Match result
  const recordMatchResult = (tournamentId, matchId, player1Score, player2Score, winnerId, roomStatus = 'closed') => {
    const nextTourneys = tournaments.map(t => {
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
    });
    setTournaments(nextTourneys);
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: nextTourneys });
    showToast('บันทึกผลการแข่งขันและปิดห้องแข่งขันเรียบร้อยแล้ว', 'success');
  };

  // Forfeit/Disqualify student (late/absent)
  const toggleForfeitStudent = (tournamentId, studentId) => {
    const nextTourneys = tournaments.map(t => {
      if (t.id === tournamentId) {
        const currentForfeited = t.forfeitedStudents || [];
        const isAlreadyForfeited = currentForfeited.includes(studentId);
        const nextForfeited = isAlreadyForfeited
          ? currentForfeited.filter(id => id !== studentId)
          : [...currentForfeited, studentId];
        return {
          ...t,
          forfeitedStudents: nextForfeited
        };
      }
      return t;
    });
    setTournaments(nextTourneys);
    realtimeService.sendEvent('system_sync', 'tournament_updated', { tournaments: nextTourneys });
    showToast('อัปเดตสถานะการตัดสิทธิ์ (Forfeit) เรียบร้อยแล้ว', 'info');
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
        toggleForfeitStudent,
        activeToast,
        showToast,
        closeToast
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export const useTournament = () => useContext(TournamentContext);
export const useTournaments = () => useContext(TournamentContext);
