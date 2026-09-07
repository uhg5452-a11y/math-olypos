import React, { useState, useEffect } from 'react';
import { AlarmClock, ArrowRight, X, Sparkles, ShieldAlert } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';

export default function MatchAlertBanner({ onNavigateToTournament }) {
  const { activeAlertMatch, dismissMatchAlert } = useTournament();
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (!activeAlertMatch) return;

    const updateTimer = () => {
      const start = new Date(activeAlertMatch.startDate).getTime();
      const now = Date.now();
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeftStr('เริ่มการแข่งขันแล้ว!');
      } else {
        const mins = Math.floor((diff / (1000 * 60)) % 60);
        const secs = Math.floor((diff / 1000) % 60);
        setTimeLeftStr(`${mins} นาที ${secs < 10 ? '0' : ''}${secs} วินาที`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [activeAlertMatch]);

  if (!activeAlertMatch) return null;

  return (
    <div className="relative z-40 bg-gradient-to-r from-amber-600/90 via-orange-600/90 to-amber-700/90 border-b border-amber-400/40 text-white px-4 py-3 shadow-lg backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
            <AlarmClock className="w-6 h-6 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-amber-100 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" /> การแข่งขันใกล้เริ่ม (15 Min Alert)
              </span>
              <span className="text-xs text-amber-100 font-mono font-bold bg-black/20 px-2 py-0.5 rounded">
                นับถอยหลัง: {timeLeftStr}
              </span>
            </div>
            <p className="text-sm font-semibold mt-0.5">
              รายการ "{activeAlertMatch.title}" ({activeAlertMatch.roundName})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => {
              if (onNavigateToTournament) onNavigateToTournament(activeAlertMatch.id);
            }}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-orange-900 font-bold text-xs hover:bg-amber-100 transition-all shadow hover:shadow-lg active:scale-95"
          >
            เข้าห้องเตรียมตัว <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={dismissMatchAlert}
            className="p-1.5 rounded-lg bg-black/20 hover:bg-black/30 text-white/80 hover:text-white transition-colors"
            title="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
