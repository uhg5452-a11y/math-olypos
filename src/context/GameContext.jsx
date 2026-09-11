import React, { createContext, useContext, useState, useEffect } from 'react';
import { storageService } from '../services/storageService';

const GameContext = createContext();

export function GameProvider({ children }) {
  const [leaderboard, setLeaderboard] = useState(() => storageService.getLeaderboard());
  const [gameHistory, setGameHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('math_olympiad_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    storageService.saveLeaderboard(leaderboard);
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('math_olympiad_history', JSON.stringify(gameHistory));
  }, [gameHistory]);

  // Anti-exploit: track recent submissions by student and puzzle signature
  const [recentSubmissions, setRecentSubmissions] = useState({});

  // Record completed practice game session with anti-exploit protection
  const recordGameResult = (gameType, score, details = {}) => {
    // Generate signature for deduplication
    const signature = `${gameType}_${score}_${JSON.stringify(details)}`;
    const now = Date.now();
    
    // Prevent duplicate submission within 3 seconds or same puzzle duplication
    if (recentSubmissions[signature] && (now - recentSubmissions[signature] < 4000)) {
      console.warn('Anti-exploit: Duplicate game score submission blocked', signature);
      return null;
    }

    setRecentSubmissions(prev => ({
      ...prev,
      [signature]: now
    }));

    const newEntry = {
      id: 'G-' + Date.now(),
      gameType,
      score,
      timestamp: new Date().toISOString(),
      ...details
    };
    setGameHistory(prev => [newEntry, ...prev.slice(0, 99)]);
    return newEntry;
  };

  // Admin Leaderboard Updates
  const updatePlayerScore = (studentId, pointsDelta, winsDelta = 0, eloDelta = 0) => {
    setLeaderboard(prev => {
      const updated = prev.map(p => {
        if (p.studentId === studentId) {
          const newPoints = Math.max(0, p.points + pointsDelta);
          const newWins = Math.max(0, p.wins + winsDelta);
          const newElo = Math.max(1000, p.elo + eloDelta);
          return {
            ...p,
            points: newPoints,
            wins: newWins,
            elo: newElo
          };
        }
        return p;
      });

      // Re-sort by points / elo
      updated.sort((a, b) => b.points - a.points || b.elo - a.elo);
      return updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });
  };

  const addLeaderboardEntry = (newEntry) => {
    setLeaderboard(prev => {
      const updated = [...prev, { ...newEntry, points: Number(newEntry.points) || 0 }];
      updated.sort((a, b) => b.points - a.points);
      return updated.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });
  };

  const removeLeaderboardEntry = (studentId) => {
    setLeaderboard(prev => {
      const filtered = prev.filter(p => p.studentId !== studentId);
      return filtered.map((item, idx) => ({ ...item, rank: idx + 1 }));
    });
  };

  return (
    <GameContext.Provider
      value={{
        leaderboard,
        gameHistory,
        recordGameResult,
        updatePlayerScore,
        addLeaderboardEntry,
        removeLeaderboardEntry
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
