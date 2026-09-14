import { INITIAL_TOURNAMENTS } from '../data/defaultTournaments';
import { INITIAL_LEADERBOARD } from '../data/defaultLeaderboard';
import { INITIAL_STUDENTS, INITIAL_TEACHERS, ADMIN_ACCOUNTS } from '../data/mockUsers';

const STORAGE_KEYS = {
  USERS: 'math_olympiad_users',
  TEACHERS: 'math_olympiad_teachers',
  TOURNAMENTS: 'math_olympiad_tournaments',
  LEADERBOARD: 'math_olympiad_leaderboard',
  CURRENT_USER: 'math_olympiad_current_user',
  ANNOUNCEMENTS: 'math_olympiad_announcements',
  SETTINGS: 'math_olympiad_settings'
};

// Helper to filter out legacy mock/fake student names and IDs
const isMockStudent = (item) => {
  if (!item) return false;
  const id = item.id || '';
  const stuId = item.studentId || '';
  const name = item.name || '';
  return (
    id.startsWith('student_') && id.length < 12 || // student_1 .. student_5
    stuId.startsWith('STU-2026-00') ||
    ['วรเมธ', 'กานต์รวี', 'ภูริณัฐ', 'ชลิตา', 'ณภัทร', 'อภิชญา', 'ธีรภัทร์'].some(n => name.includes(n))
  );
};

// Helper to filter out legacy mock/sample tournaments
const isMockTournament = (t) => {
  if (!t || !t.id) return true;
  return (
    t.id.startsWith('tourney-amath-') ||
    t.id.startsWith('tourney-sudoku-') ||
    t.id.startsWith('tourney-checkers-') ||
    t.id.startsWith('tourney-speedmath-') ||
    t.id.startsWith('tourney-make24-') ||
    t.id.startsWith('tourney-flash-')
  );
};

export const storageService = {
  // Tournaments (Only real tournaments created by admin)
  getTournaments: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      let list = data ? JSON.parse(data) : [];
      // Clean out any legacy mock tournaments
      const cleaned = (list || []).filter(t => !isMockTournament(t));
      if (data && cleaned.length !== (list || []).length) {
        localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(cleaned));
      }
      return cleaned.map(t => ({
        ...t,
        durationMinutes: t.durationMinutes || 15,
        registeredStudents: (t.registeredStudents || []).filter(sid => !sid.startsWith('STU-2026-00')),
        forfeitedStudents: t.forfeitedStudents || [],
        matches: (t.matches || []).filter(m => !isMockStudent(m.player1) && !isMockStudent(m.player2))
      }));
    } catch {
      return [];
    }
  },

  saveTournaments: (tournaments) => {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  },

  // Leaderboard
  getLeaderboard: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      const list = data ? JSON.parse(data) : INITIAL_LEADERBOARD;
      const cleaned = (list || []).filter(item => !isMockStudent(item));
      return cleaned;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  },

  saveLeaderboard: (leaderboard) => {
    const cleaned = (leaderboard || []).filter(item => !isMockStudent(item));
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(cleaned));
  },

  // Users (Only real students from โรงเรียนบรรหารแจ่มใสวิทยา 3)
  getStudents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      const list = data ? JSON.parse(data) : INITIAL_STUDENTS;
      const cleaned = (list || []).filter(s => !isMockStudent(s));
      if (data && cleaned.length !== list.length) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
      }
      return cleaned;
    } catch {
      return [];
    }
  },

  saveStudents: (students) => {
    const cleaned = (students || []).filter(s => !isMockStudent(s));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(cleaned));
  },

  // Teachers (Approved by Admin & Whitelist)
  getTeachers: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TEACHERS);
      const list = data ? JSON.parse(data) : INITIAL_TEACHERS;
      const merged = [...INITIAL_TEACHERS];
      (list || []).forEach(t => {
        if (!merged.some(m => m.email.toLowerCase() === t.email.toLowerCase())) {
          merged.push(t);
        }
      });
      return merged;
    } catch {
      return INITIAL_TEACHERS;
    }
  },

  saveTeachers: (teachers) => {
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
  },

  // Real-time Announcements from Teachers / Arbiter
  getAnnouncements: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ANNOUNCEMENTS);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveAnnouncements: (list) => {
    localStorage.setItem(STORAGE_KEYS.ANNOUNCEMENTS, JSON.stringify(list));
  },

  // Session: Default to null (NO auto-login as fake student)
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (!data) return null;
      const user = JSON.parse(data);
      if (isMockStudent(user)) {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        return null;
      }
      return user;
    } catch {
      return null;
    }
  },

  saveCurrentUser: (user) => {
    if (!user || isMockStudent(user)) {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    } else {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    }
  },

  // Reset to Factory Defaults
  resetDefaults: () => {
    localStorage.removeItem(STORAGE_KEYS.TOURNAMENTS);
    localStorage.removeItem(STORAGE_KEYS.LEADERBOARD);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    return {
      tournaments: INITIAL_TOURNAMENTS,
      leaderboard: [],
      students: [],
      currentUser: null
    };
  }
};
