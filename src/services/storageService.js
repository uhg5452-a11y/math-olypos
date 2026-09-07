import { INITIAL_TOURNAMENTS } from '../data/defaultTournaments';
import { INITIAL_LEADERBOARD } from '../data/defaultLeaderboard';
import { INITIAL_STUDENTS, ADMIN_ACCOUNTS } from '../data/mockUsers';

const STORAGE_KEYS = {
  USERS: 'math_olympiad_users',
  TOURNAMENTS: 'math_olympiad_tournaments',
  LEADERBOARD: 'math_olympiad_leaderboard',
  CURRENT_USER: 'math_olympiad_current_user',
  SETTINGS: 'math_olympiad_settings'
};

export const storageService = {
  // Tournaments
  getTournaments: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.TOURNAMENTS);
      return data ? JSON.parse(data) : INITIAL_TOURNAMENTS;
    } catch {
      return INITIAL_TOURNAMENTS;
    }
  },

  saveTournaments: (tournaments) => {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENTS, JSON.stringify(tournaments));
  },

  // Leaderboard
  getLeaderboard: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
      return data ? JSON.parse(data) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  },

  saveLeaderboard: (leaderboard) => {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  },

  // Users
  getStudents: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USERS);
      return data ? JSON.parse(data) : INITIAL_STUDENTS;
    } catch {
      return INITIAL_STUDENTS;
    }
  },

  saveStudents: (students) => {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(students));
  },

  // Session
  getCurrentUser: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return data ? JSON.parse(data) : INITIAL_STUDENTS[0]; // Default to student 1 for quick demo
    } catch {
      return INITIAL_STUDENTS[0];
    }
  },

  saveCurrentUser: (user) => {
    if (!user) {
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
      leaderboard: INITIAL_LEADERBOARD,
      students: INITIAL_STUDENTS,
      currentUser: INITIAL_STUDENTS[0]
    };
  }
};
