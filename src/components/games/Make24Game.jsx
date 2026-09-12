import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Trophy, Clock, Play, Delete } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

// Standard 24 solvable puzzle sets
const PRESET_PUZZLES = [
  [3, 8, 3, 8], // 8 / (3 - 8/3) = 24
  [1, 3, 4, 6], // 6 / (1 - 3/4) = 24
  [4, 4, 7, 7], // (7 - 4/7) * 4? no, (4 - 4/7)*7 = 24
  [5, 5, 5, 1], // (5 - 1/5) * 5 = 24
  [2, 3, 5, 7], // (7 - 5 + 2) * 6 = 24 or (5 - 2)*(7 + 1)
  [6, 8, 2, 1], // (6 - 2) * (8 - 1) = 28 -> (8 - 6/2)*...
  [9, 9, 3, 1], // (9 + 9 - 1) + 7
  [4, 6, 8, 2], // 4 * 6 = 24
  [3, 3, 7, 7]  // (3 + 3/7) * 7 = 24
];

export default function Make24Game() {
  const { recordGameResult } = useGame();
  const [numbers, setNumbers] = useState([3, 8, 3, 8]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [tokens, setTokens] = useState([]); // expression tokens
  const [message, setMessage] = useState('ประกอบสมการโดยใช้ตัวเลขทั้ง 4 ตัวให้ได้ผลลัพธ์เท่ากับ 24');
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  // Competition Countdown Timer Mode (60s)
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [gameEnded, setGameEnded] = useState(false);

  // Anti-exploit: prevent duplicate submission of the exact same puzzle
  const solvedPuzzlesRef = React.useRef(new Set());

  // Countdown timer effect
  useEffect(() => {
    if (!isTimerActive || gameEnded) return;
    if (timeLeft <= 0) {
      setGameEnded(true);
      setIsTimerActive(false);
      setMessage(`⏱️ หมดเวลาแข่งขัน! คุณทำคะแนนได้ทั้งหมด ${score} แต้ม (${solvedCount} ข้อ)`);
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, gameEnded, score, solvedCount]);

  // New random solvable puzzle
  const newPuzzle = () => {
    let randomSet;
    do {
      randomSet = PRESET_PUZZLES[Math.floor(Math.random() * PRESET_PUZZLES.length)];
    } while (randomSet.join(',') === numbers.join(',') && PRESET_PUZZLES.length > 1);

    setNumbers([...randomSet]);
    setUsedIndices([]);
    setTokens([]);
    setMessage('สร้างสมการใหม่ให้ได้ 24');
  };

  const handleRestartGame = () => {
    solvedPuzzlesRef.current.clear();
    setScore(0);
    setSolvedCount(0);
    setTimeLeft(60);
    setGameEnded(false);
    setIsTimerActive(true);
    newPuzzle();
  };

  const handleAddNumber = (num, idx) => {
    if (usedIndices.includes(idx)) return;
    setUsedIndices([...usedIndices, idx]);
    setTokens([...tokens, { type: 'num', value: num, idx }]);
  };

  const handleAddOperator = (op) => {
    setTokens([...tokens, { type: 'op', value: op }]);
  };

  const handleBackspace = () => {
    if (tokens.length === 0) return;
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'num') {
      setUsedIndices(usedIndices.filter(i => i !== lastToken.idx));
    }
    setTokens(tokens.slice(0, -1));
  };

  const handleClear = () => {
    setTokens([]);
    setUsedIndices([]);
  };

  // Evaluate Equation
  const handleCheck = () => {
    if (gameEnded || !isTimerActive) return;

    if (usedIndices.length < 4) {
      setMessage('⚠️ คุณต้องใช้ตัวเลขให้ครบทั้ง 4 ตัว!');
      return;
    }

    const puzzleKey = numbers.join(',');
    const exprStr = tokens.map(t => t.value).join('');
    const sanitized = exprStr.replace(/×/g, '*').replace(/÷/g, '/');

    try {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (Math.abs(result - 24) < 1e-6) {
        // Anti-exploit check: prevent duplicate scoring of same puzzle
        if (solvedPuzzlesRef.current.has(puzzleKey)) {
          setMessage('⚠️ ปริศนานี้ถูกบันทึกคะแนนไปแล้ว กำลังสุ่มโจทย์ใหม่...');
          setTimeout(() => newPuzzle(), 600);
          return;
        }

        solvedPuzzlesRef.current.add(puzzleKey);
        const newScore = score + 25;
        setMessage(`🎉 ยอดเยี่ยม! ${exprStr} = 24 ถูกต้องสมบูรณ์ (+25 แต้ม)`);
        confetti({ particleCount: 50, spread: 60 });
        setScore(newScore);
        setSolvedCount(c => c + 1);
        recordGameResult('make-24', newScore, { puzzle: puzzleKey, solvedCount: solvedCount + 1 });
        setTimeout(() => newPuzzle(), 800);
      } else {
        // When wrong: immediately randomize a new question
        setMessage(`❌ คำตอบไม่ถูกต้อง (ได้ ${result} ≠ 24)! กำลังเปลี่ยนโจทย์ใหม่ทันที...`);
        setTimeout(() => {
          newPuzzle();
        }, 700);
      }
    } catch {
      // When syntax error: immediately randomize a new question
      setMessage('⚠️ รูปแบบสมการไม่ถูกต้อง! กำลังเปลี่ยนโจทย์ใหม่ทันที...');
      setTimeout(() => {
        newPuzzle();
      }, 700);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#1E3E62]/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
              มินิเกมที่ 5
            </span>
            <span className="text-xs text-slate-400">โหมดแข่งขันจับเวลา 60 วิ • ป้องกันการปั๊มคะแนน</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            เกม 24 (Make 24) <span className="text-[#008DDA] glow-primary">Speed Challenge</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            นำตัวเลข 4 ตัวมาคำนวณให้ได้ 24 หากตอบผิดระบบจะสุ่มเปลี่ยนโจทย์ใหม่ทันที
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown Timer Badge */}
          <div className={`px-4 py-2 rounded-2xl border text-center transition-all ${
            timeLeft <= 10 && !gameEnded
              ? 'bg-rose-950/80 border-rose-500 animate-pulse'
              : 'bg-[#0B192C] border-white/10'
          }`}>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#008DDA]" /> เวลาที่เหลือ
            </div>
            <div className={`text-xl font-black font-mono ${
              timeLeft <= 10 && !gameEnded ? 'text-rose-400' : 'text-white'
            }`}>
              {formatTimer(timeLeft)}
            </div>
          </div>

          <div className="bg-[#0B192C] px-4 py-2 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">คะแนนสะสม</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> {score}
            </div>
          </div>

          <button
            onClick={newPuzzle}
            disabled={gameEnded}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all disabled:opacity-40"
            title="สุ่มโจทย์ใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Start Game Ready Banner (Requirement 3: Timer does not start before Start Game) */}
      {!isTimerActive && !gameEnded && (
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-[#008DDA]/20 to-teal-500/20 border border-emerald-500/40 text-center space-y-3 animate-fade-in">
          <div className="text-xl font-black text-white flex items-center justify-center gap-2">
            <Clock className="w-6 h-6 text-emerald-400" /> โหมดแข่งขันจับเวลา 60 วินาที
          </div>
          <p className="text-xs text-slate-300 max-w-md mx-auto">
            เวลานับถอยหลังจะยังไม่เริ่มนับจนกว่าคุณจะกดปุ่ม "เริ่มเกม" ด้านล่างนี้ นำตัวเลข 4 ตัวมาผสมกันให้ได้ผลลัพธ์ 24 ให้ได้มากที่สุด
          </p>
          <button
            type="button"
            onClick={() => {
              setIsTimerActive(true);
              setTimeLeft(60);
              newPuzzle();
            }}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl inline-flex items-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> เริ่มเกม (Start Game)
          </button>
        </div>
      )}

      {/* Game Ended Overlay Banner */}
      {gameEnded && (
        <div className="mb-6 p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-[#008DDA]/20 to-purple-500/20 border border-amber-500/40 text-center space-y-3 animate-fade-in">
          <div className="text-2xl font-black text-amber-400 flex items-center justify-center gap-2">
            <Trophy className="w-7 h-7" /> หมดเวลาการแข่งขันรอบนี้!
          </div>
          <p className="text-sm text-slate-200">
            คุณตอบถูกทั้งหมด <span className="text-amber-300 font-bold text-base">{solvedCount}</span> ข้อ ได้คะแนนสะสม <span className="text-emerald-400 font-bold text-base">{score}</span> แต้ม
          </p>
          <button
            onClick={handleRestartGame}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-xl inline-flex items-center gap-2 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" /> เริ่มแข่งรอบใหม่ (60 วิ)
          </button>
        </div>
      )}

      {/* Main Play Area */}
      <div className="max-w-xl mx-auto space-y-6">
        {/* 4 Cards / Numbers */}
        <div className="grid grid-cols-4 gap-3">
          {numbers.map((num, idx) => {
            const isUsed = usedIndices.includes(idx);
            return (
              <button
                key={idx}
                disabled={isUsed || gameEnded || !isTimerActive}
                onClick={() => handleAddNumber(num, idx)}
                className={`h-24 sm:h-28 rounded-2xl font-black text-3xl sm:text-4xl shadow-xl transition-all flex items-center justify-center select-none ${
                  isUsed
                    ? 'bg-slate-800/40 text-slate-600 border border-slate-700/30 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-b from-white to-slate-200 text-slate-900 hover:-translate-y-1 hover:shadow-2xl hover:ring-4 hover:ring-[#008DDA]/50 active:scale-95'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Expression Screen */}
        <div className="bg-[#0B192C]/90 rounded-2xl border border-[#008DDA]/40 p-4 min-h-[68px] flex items-center justify-between shadow-2xl box-glow">
          <div className="text-xl sm:text-2xl font-black font-mono text-white tracking-wider overflow-x-auto pr-2">
            {tokens.length > 0 ? tokens.map(t => t.value).join(' ') : (
              <span className="text-slate-500 text-sm font-normal">กดเลือกตัวเลขและเครื่องหมายคำนวณ</span>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleBackspace}
              disabled={gameEnded}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-40"
              title="ลบตัวสุดท้าย"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              disabled={gameEnded}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold disabled:opacity-40"
            >
              ล้าง
            </button>
          </div>
        </div>

        {/* Operators & Actions */}
        <div className="grid grid-cols-6 gap-2">
          {['+', '-', '×', '÷', '(', ')'].map((op) => (
            <button
              key={op}
              disabled={gameEnded}
              onClick={() => handleAddOperator(op)}
              className="py-3 rounded-xl bg-[#1E3E62] hover:bg-[#008DDA] text-white font-black text-lg shadow transition-all active:scale-95 disabled:opacity-40"
            >
              {op}
            </button>
          ))}
        </div>

        {/* Submit Button (Hint Removed completely) */}
        <div>
          <button
            onClick={handleCheck}
            disabled={gameEnded}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <CheckCircle2 className="w-5 h-5" /> ตรวจคำตอบ (= 24)
          </button>
        </div>

        {/* Message */}
        <div className={`text-center text-xs font-medium p-3 rounded-xl transition-all ${
          message.includes('❌') || message.includes('⚠️')
            ? 'bg-rose-950/40 border border-rose-500/30 text-rose-300'
            : message.includes('🎉')
            ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-300'
            : 'text-slate-300'
        }`}>
          {message}
        </div>
      </div>
    </div>
  );
}
