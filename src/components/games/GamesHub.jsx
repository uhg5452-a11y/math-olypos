import React, { useState, useEffect } from 'react';
import { Gamepad2, ArrowRight, Sparkles, Trophy, Zap, Grid, Eye, Shuffle, ShieldAlert } from 'lucide-react';
import AMathGame from './AMathGame';
import SudokuGame from './SudokuGame';
import ThaiCheckersGame from './ThaiCheckersGame';
import SpeedMathGame from './SpeedMathGame';
import Make24Game from './Make24Game';
import FlashAnzanGame from './FlashAnzanGame';

export default function GamesHub() {
  const [activeGame, setActiveGame] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('game') || null;
  });

  useEffect(() => {
    const handleNav = (e) => {
      if (e.detail?.game !== undefined) {
        setActiveGame(e.detail.game);
      } else if (e.detail?.view === 'practice' && !e.detail?.game) {
        setActiveGame(null);
      }
    };
    window.addEventListener('navigate_view', handleNav);
    return () => window.removeEventListener('navigate_view', handleNav);
  }, []);

  const handleSelectGame = (id) => {
    setActiveGame(id);
    const url = new URL(window.location.href);
    url.searchParams.set('game', id);
    window.history.pushState({}, '', url.toString());
  };

  const handleBackToHub = () => {
    setActiveGame(null);
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.pathname);
  };

  const games = [
    {
      id: 'a-math',
      title: 'เอแมท (Standard 15x15 A-Math)',
      subtitle: 'สมการอักษรไขว้มาตรฐาน 2 ผู้เล่น',
      description: 'วางเบี้ยตัวเลขและเครื่องหมายลงบนกระดาน 15x15 เพื่อสร้างสมการที่ถูกต้องทั้งแนวตั้งและแนวนอน พร้อมช่องคะแนนพิเศษ 3E, 2E, 3P, 2P และดาวกึ่งกลาง ★',
      icon: '🔤',
      badge: '15x15 Standard Competition',
      component: <AMathGame />
    },
    {
      id: 'sudoku',
      title: 'ซูโดกุ (Sudoku)',
      subtitle: 'Olympiad Number Grid',
      description: 'ปริศนาตัวเลข 9x9 ระดับแข่งขัน เลือกระดับความยากง่าย-ปานกลาง พร้อมโหมดโน้ตดินสอและจับเวลาแข่งขัน',
      icon: '🔢',
      badge: 'Deduction Puzzle',
      component: <SudokuGame />
    },
    {
      id: 'checkers',
      title: 'หมากฮอสไทย (Thai Checkers)',
      subtitle: 'Classic Tactics 8x8',
      description: 'กติกาหมากฮอสไทยแท้ เดินทแยง กินเบี้ย และเข้าฮอสเพื่อเปิดทางเดินกว้าง เลือกระหว่างสู้กับบอท หรือเล่นสองคน',
      icon: '♟️',
      badge: 'Board Strategy',
      component: <ThaiCheckersGame />
    },
    {
      id: 'speed-math',
      title: 'คิดเลขเร็ว (Speed Math)',
      subtitle: 'Sprint 30s & 60s',
      description: 'ท้าประลองคิดเลขเร็วต่อเนื่องสะสมคอมโบ Streak Multiplier วัดความไวและความแม่นยำในการคิดคำนวณ',
      icon: '⚡',
      badge: 'High Speed Calculation',
      component: <SpeedMathGame />
    },
    {
      id: 'make-24',
      title: 'เกม 24 (Make 24)',
      subtitle: 'Speed Challenge',
      description: 'ผสมตัวเลข 4 ตัวด้วย +, -, ×, ÷ และวงเล็บ ให้ได้ 24 โหมดจับเวลา 60 วินาที ตอบผิดเปลี่ยนโจทย์ใหม่ทันที',
      icon: '🧮',
      badge: 'Combinatorics',
      component: <Make24Game />
    },
    {
      id: 'flash-anzan',
      title: 'จินตคณิต (Flash Anzan)',
      subtitle: 'คิดเลขเร็วกลางอากาศ',
      description: 'ตัวเลขกะพริบกลางอากาศด้วยความเร็ว 0.5 - 1.2 วินาที รวมผลลัพธ์ในใจอย่างแม่นยำโดยไม่ต้องใช้กระดาษทด',
      icon: '🧠',
      badge: 'Mental Arithmetic',
      component: <FlashAnzanGame />
    }
  ];

  if (activeGame) {
    const selected = games.find(g => g.id === activeGame);
    return (
      <div className="space-y-6">
        <button
          onClick={handleBackToHub}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold transition-all"
        >
          ← กลับสู่ศูนย์รวมเกมฝึกซ้อม
        </button>

        {selected?.component}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E3E62] via-[#0B192C] to-[#1E3E62] border border-[#008DDA]/30 p-8 shadow-2xl box-glow">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold mb-4">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            โหมดทดลองเล่น / ฝึกซ้อม (เปิดตลอด 24 ชั่วโมง)
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-3">
            สนามฝึกซ้อม <span className="text-[#008DDA] glow-primary">6 มินิเกมคณิตศาสตร์</span>
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            พื้นที่ฝึกทักษะและประลองไหวพริบได้ตลอดเวลาโดยไม่มีการปิดรอบ เล่นสะสมคะแนน 
            ทดลองกลยุทธ์ และเตรียมความพร้อมก่อนลงแข่งขันในทัวร์นาเมนต์จริง
          </p>
        </div>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {games.map((g) => (
          <div
            key={g.id}
            onClick={() => handleSelectGame(g.id)}
            className="flex flex-col bg-[#1E3E62]/70 border border-white/10 hover:border-[#008DDA]/50 rounded-3xl p-6 shadow-xl hover:-translate-y-1.5 hover:shadow-2xl hover:box-glow transition-all cursor-pointer backdrop-blur-md group"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-[#0B192C] border border-white/10 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform">
                {g.icon}
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-300 border border-white/5">
                {g.badge}
              </span>
            </div>

            <div className="mb-2">
              <h3 className="text-xl font-bold text-white group-hover:text-[#008DDA] transition-colors">
                {g.title}
              </h3>
              <div className="text-xs font-medium text-[#008DDA]">
                {g.subtitle}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 mb-6">
              {g.description}
            </p>

            <div className="mt-auto pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> พร้อมเล่น 24 ชม.
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-bold text-white group-hover:text-[#008DDA] transition-colors">
                เริ่มเล่นเลย <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
