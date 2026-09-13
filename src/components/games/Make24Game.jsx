import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Trophy, Clock, Play, Delete, ArrowLeft, Sliders, Shuffle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

// Standard 24 solvable puzzle sets
const PRESET_PUZZLES = [
  [3, 8, 3, 8], // 8 / (3 - 8/3) = 24
  [1, 3, 4, 6], // 6 / (1 - 3/4) = 24
  [4, 4, 7, 7], // (4 - 4/7) * 7 = 24
  [5, 5, 5, 1], // (5 - 1/5) * 5 = 24
  [2, 3, 5, 7], // (7 - 5 + 2) * 6 = 24 or (5 - 2)*(7 + 1)
  [6, 8, 2, 1], // (6 - 2) * (8 - 1) = 28 -> (8 - 6/2)
  [9, 9, 3, 1], // (9 + 9 - 1) + 7
  [4, 6, 8, 2], // 4 * 6 = 24
  [3, 3, 7, 7], // (3 + 3/7) * 7 = 24
  [1, 2, 3, 4], // 1 * 2 * 3 * 4 = 24
  [2, 4, 6, 8], // 8 * 4 - 6 - 2 = 24
  [5, 6, 7, 8]  // (8 - (7 - 5)) * 4
];

export default function Make24Game() {
  const { recordGameResult } = useGame();
  const [numbers, setNumbers] = useState([3, 8, 3, 8]);
  const [usedIndices, setUsedIndices] = useState([]);
  const [tokens, setTokens] = useState([]); // expression tokens
  const [message, setMessage] = useState('ประกอบสมการโดยใช้ตัวเลขทั้ง 4 ตัวให้ได้ผลลัพธ์เท่ากับ 24');
  const [score, setScore] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);

  // Custom Timer Duration (default 60s, supports 15s, 30s, 60s, 120s, custom)
  const [duration, setDuration] = useState(60);
  const [customInputVal, setCustomInputVal] = useState('60');
  const [showCustomInput, setShowCustomInput] = useState(false);
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

  // New random solvable puzzle - RESETS TIMER BACK TO FULL DURATION EVERY TIME
  const newPuzzle = (customDuration = duration) => {
    let randomSet;
    do {
      randomSet = PRESET_PUZZLES[Math.floor(Math.random() * PRESET_PUZZLES.length)];
    } while (randomSet.join(',') === numbers.join(',') && PRESET_PUZZLES.length > 1);

    setNumbers([...randomSet]);
    setUsedIndices([]);
    setTokens([]);
    // Reset timer back to starting duration per request
    setTimeLeft(customDuration);
    setMessage('สร้างสมการใหม่ให้ได้ 24 (รีเซ็ตเวลาใหม่)');
  };

  const handleRestartGame = () => {
    solvedPuzzlesRef.current.clear();
    setScore(0);
    setSolvedCount(0);
    setTimeLeft(duration);
    setGameEnded(false);
    setIsTimerActive(true);
    newPuzzle(duration);
  };

  const handleSetPresetDuration = (secs) => {
    setDuration(secs);
    setShowCustomInput(false);
    setTimeLeft(secs);
  };

  const handleApplyCustomDuration = (e) => {
    e.preventDefault();
    const val = parseInt(customInputVal, 10);
    if (!isNaN(val) && val >= 5 && val <= 600) {
      setDuration(val);
      setTimeLeft(val);
      setShowCustomInput(false);
    }
  };

  const handleExitGame = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.pathname);
    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'practice', game: null } }));
  };

  const handleAddNumber = (num, idx) => {
    if (usedIndices.includes(idx) || !isTimerActive) return;
    setUsedIndices([...usedIndices, idx]);
    setTokens([...tokens, { type: 'num', value: num, idx }]);
  };

  const handleAddOperator = (op) => {
    if (!isTimerActive) return;
    setTokens([...tokens, { type: 'op', value: op }]);
  };

  const handleBackspace = () => {
    if (tokens.length === 0 || !isTimerActive) return;
    const lastToken = tokens[tokens.length - 1];
    if (lastToken.type === 'num') {
      setUsedIndices(usedIndices.filter(i => i !== lastToken.idx));
    }
    setTokens(tokens.slice(0, -1));
  };

  const handleClear = () => {
    if (!isTimerActive) return;
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
          setTimeout(() => newPuzzle(duration), 600);
          return;
        }

        solvedPuzzlesRef.current.add(puzzleKey);
        const newScore = score + 25;
        setMessage(`🎉 ยอดเยี่ยม! ${exprStr} = 24 ถูกต้องสมบูรณ์ (+25 แต้ม)`);
        confetti({ particleCount: 50, spread: 60 });
        setScore(newScore);
        setSolvedCount(c => c + 1);
        recordGameResult('make-24', newScore, { puzzle: puzzleKey, solvedCount: solvedCount + 1 });
        // Automatically reset timer back to full duration on next puzzle
        setTimeout(() => newPuzzle(duration), 700);
      } else {
        // When wrong: immediately randomize a new question and reset timer
        setMessage(`❌ คำตอบไม่ถูกต้อง (ได้ ${result} ≠ 24)! กำลังเปลี่ยนโจทย์และรีเซ็ตเวลาใหม่...`);
        setTimeout(() => {
          newPuzzle(duration);
        }, 700);
      }
    } catch {
      // When syntax error: immediately randomize a new question and reset timer
      setMessage('⚠️ รูปแบบสมการไม่ถูกต้อง! กำลังเปลี่ยนโจทย์และรีเซ็ตเวลาใหม่...');
      setTimeout(() => {
        newPuzzle(duration);
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
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={handleExitGame}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 text-xs font-bold shrink-0"
            title="ออกจากเกม / กลับศูนย์รวมเกม"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">กลับศูนย์รวมเกม</span>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
                มินิเกมที่ 5
              </span>
              <span className="text-xs text-slate-400">โหมดแข่งขันจับเวลา • รีเซ็ตเวลาใหม่ทุกข้อ</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              เกม 24 (Make 24) <span className="text-[#008DDA] glow-primary">Speed Challenge</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              นำตัวเลข 4 ตัวมาคำนวณให้ได้ 24 ทุกครั้งที่เปลี่ยนข้อหรือตอบ ระบบจะรีเซ็ตเวลากลับไปเริ่มต้นทันที
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Custom Timer Duration Controls */}
          {!isTimerActive && (
            <div className="flex flex-wrap items-center gap-1.5 bg-[#0B192C] p-1.5 rounded-2xl border border-white/10">
              {[15, 30, 60, 120].map(s => (
                <button
                  key={s}
                  onClick={() => handleSetPresetDuration(s)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all ${
                    duration === s && !showCustomInput
                      ? 'bg-[#008DDA] text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {s}s
                </button>
              ))}
              <button
                onClick={() => setShowCustomInput(p => !p)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                  showCustomInput
                    ? 'bg-[#008DDA] text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Sliders className="w-3 h-3" /> กำหนดเอง
              </button>
            </div>
          )}

          {/* Countdown Timer Badge */}
          <div className={`px-4 py-2 rounded-2xl border text-center transition-all ${
            timeLeft <= 10 && !gameEnded && isTimerActive
              ? 'bg-rose-950/80 border-rose-500 animate-pulse'
              : 'bg-[#0B192C] border-white/10'
          }`}>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#008DDA]" /> เวลาประจำข้อ
            </div>
            <div className={`text-xl font-black font-mono mt-0.5 ${
              timeLeft <= 10 && !gameEnded && isTimerActive ? 'text-rose-400' : 'text-white'
            }`}>
              {formatTimer(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Custom Duration Input Box */}
      {!isTimerActive && showCustomInput && (
        <form onSubmit={handleApplyCustomDuration} className="mb-6 p-3 bg-[#0B192C]/90 rounded-2xl border border-[#008DDA]/40 max-w-sm flex items-center gap-2">
          <span className="text-xs text-slate-300 font-bold whitespace-nowrap">ตั้งเวลาเอง (วินาที):</span>
          <input
            type="number"
            min="5"
            max="600"
            value={customInputVal}
            onChange={(e) => setCustomInputVal(e.target.value)}
            className="w-20 px-2 py-1 rounded-lg bg-[#1E3E62] border border-slate-600 text-white font-mono text-center font-bold text-sm"
          />
          <button
            type="submit"
            className="px-3 py-1 rounded-lg bg-[#008DDA] hover:bg-blue-600 text-white text-xs font-bold"
          >
            ใช้ค่านีั
          </button>
        </form>
      )}

      {/* Score and Stats */}
      <div className="flex items-center justify-between bg-[#0B192C]/80 p-4 rounded-2xl border border-white/10 mb-6">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <div>
            <div className="text-[10px] text-slate-400 uppercase font-semibold">คะแนนสะสม</div>
            <div className="text-lg font-black text-amber-400 glow-gold">{score} แต้ม</div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-[10px] text-slate-400 uppercase font-semibold">ตอบถูกแล้ว</div>
          <div className="text-lg font-black text-emerald-400">{solvedCount} ข้อ</div>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="max-w-xl mx-auto text-center space-y-6">
        {/* Status Message */}
        <div className="text-xs font-semibold text-slate-300 px-4 py-2 rounded-xl bg-[#0B192C]/60 border border-white/5">
          {message}
        </div>

        {/* 4 Number Cards */}
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {numbers.map((num, idx) => {
            const isUsed = usedIndices.includes(idx);
            return (
              <button
                key={idx}
                disabled={isUsed || !isTimerActive || gameEnded}
                onClick={() => handleAddNumber(num, idx)}
                className={`h-20 sm:h-24 rounded-2xl font-black text-2xl sm:text-4xl shadow-xl transition-all flex items-center justify-center ${
                  isUsed
                    ? 'bg-slate-800/40 text-slate-600 border border-white/5 cursor-not-allowed scale-95'
                    : 'bg-gradient-to-b from-[#1E3E62] to-[#0B192C] text-white border-2 border-[#008DDA]/60 hover:border-[#008DDA] hover:scale-105 active:scale-95 shadow-blue-500/20'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        {/* Formed Equation Display */}
        <div className="min-h-[64px] bg-[#0B192C] p-4 rounded-2xl border-2 border-[#008DDA]/40 flex items-center justify-center gap-1.5 overflow-x-auto">
          {tokens.length === 0 ? (
            <span className="text-xs text-slate-500 italic">แตะตัวเลขและเครื่องหมายเพื่อสร้างสมการ</span>
          ) : (
            tokens.map((token, i) => (
              <span
                key={i}
                className={`px-2.5 py-1 rounded-xl font-mono font-bold text-lg sm:text-xl ${
                  token.type === 'num'
                    ? 'bg-[#008DDA] text-white shadow'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {token.value}
              </span>
            ))
          )}
        </div>

        {/* Operators & Controls */}
        <div className="grid grid-cols-6 gap-2">
          {['+', '-', '×', '÷', '(', ')'].map((op) => (
            <button
              key={op}
              disabled={!isTimerActive || gameEnded}
              onClick={() => handleAddOperator(op)}
              className="py-3 rounded-xl bg-[#0B192C] hover:bg-[#1E3E62] text-amber-300 font-black text-lg border border-white/10 active:scale-95 transition-all disabled:opacity-40"
            >
              {op}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleClear}
            disabled={tokens.length === 0 || !isTimerActive || gameEnded}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all disabled:opacity-40"
          >
            ล้างกระดาน
          </button>

          <button
            onClick={handleBackspace}
            disabled={tokens.length === 0 || !isTimerActive || gameEnded}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1"
          >
            <Delete className="w-4 h-4" /> ลบทีละตัว
          </button>

          <button
            onClick={() => newPuzzle(duration)}
            disabled={!isTimerActive || gameEnded}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all disabled:opacity-40 flex items-center justify-center gap-1"
            title="เปลี่ยนโจทย์ใหม่และรีเซ็ตเวลา"
          >
            <Shuffle className="w-3.5 h-3.5" /> เปลี่ยนโจทย์
          </button>

          <button
            onClick={handleCheck}
            disabled={usedIndices.length < 4 || !isTimerActive || gameEnded}
            className="flex-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" /> ตรวจคำตอบ
          </button>
        </div>

        {/* Start / Restart Game Gate */}
        {(!isTimerActive || gameEnded) && (
          <div className="pt-4">
            <button
              onClick={handleRestartGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 mx-auto active:scale-95 transition-all"
            >
              <Play className="w-4 h-4 fill-current" /> {gameEnded ? 'เริ่มแข่งรอบใหม่' : `เริ่มเกมจับเวลา (${duration} วิ/ข้อ)`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
