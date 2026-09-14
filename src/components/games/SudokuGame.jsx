import React, { useState, useEffect } from 'react';
import { RotateCcw, CheckCircle2, Trophy, Clock, AlertTriangle, Edit3, Sparkles, Play, ArrowLeft, Shield, Check } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

// Pre-built valid Sudoku boards and solutions for instant play
const SUDOKU_PRESETS = {
  easy: {
    puzzle: [
      [5, 3, 0, 0, 7, 0, 0, 0, 0],
      [6, 0, 0, 1, 9, 5, 0, 0, 0],
      [0, 9, 8, 0, 0, 0, 0, 6, 0],
      [8, 0, 0, 0, 6, 0, 0, 0, 3],
      [4, 0, 0, 8, 0, 3, 0, 0, 1],
      [7, 0, 0, 0, 2, 0, 0, 0, 6],
      [0, 6, 0, 0, 0, 0, 2, 8, 0],
      [0, 0, 0, 4, 1, 9, 0, 0, 5],
      [0, 0, 0, 0, 8, 0, 0, 7, 9]
    ],
    solution: [
      [5, 3, 4, 6, 7, 8, 9, 1, 2],
      [6, 7, 2, 1, 9, 5, 3, 4, 8],
      [1, 9, 8, 3, 4, 2, 5, 6, 7],
      [8, 5, 9, 7, 6, 1, 4, 2, 3],
      [4, 2, 6, 8, 5, 3, 7, 9, 1],
      [7, 1, 3, 9, 2, 4, 8, 5, 6],
      [9, 6, 1, 5, 3, 7, 2, 8, 4],
      [2, 8, 7, 4, 1, 9, 6, 3, 5],
      [3, 4, 5, 2, 8, 6, 1, 7, 9]
    ]
  },
  medium: {
    puzzle: [
      [0, 0, 0, 2, 6, 0, 7, 0, 1],
      [6, 8, 0, 0, 7, 0, 0, 9, 0],
      [1, 9, 0, 0, 0, 4, 5, 0, 0],
      [8, 2, 0, 1, 0, 0, 0, 4, 0],
      [0, 0, 4, 6, 0, 2, 9, 0, 0],
      [0, 5, 0, 0, 0, 3, 0, 2, 8],
      [0, 0, 9, 3, 0, 0, 0, 7, 4],
      [0, 4, 0, 0, 5, 0, 0, 3, 6],
      [7, 0, 3, 0, 1, 8, 0, 0, 0]
    ],
    solution: [
      [4, 3, 5, 2, 6, 9, 7, 8, 1],
      [6, 8, 2, 5, 7, 1, 4, 9, 3],
      [1, 9, 7, 8, 3, 4, 5, 6, 2],
      [8, 2, 6, 1, 9, 5, 3, 4, 7],
      [3, 7, 4, 6, 8, 2, 9, 1, 5],
      [9, 5, 1, 7, 4, 3, 6, 2, 8],
      [5, 1, 9, 3, 2, 6, 8, 7, 4],
      [2, 4, 8, 9, 5, 7, 1, 3, 6],
      [7, 6, 3, 4, 1, 8, 2, 5, 9]
    ]
  }
};

export default function SudokuGame({ mode = 'practice' }) {
  const { recordGameResult } = useGame();
  const [difficulty, setDifficulty] = useState('easy');
  const [grid, setGrid] = useState(() => SUDOKU_PRESETS.easy.puzzle.map(r => [...r]));
  const [notes, setNotes] = useState(() => Array(9).fill(null).map(() => Array(9).fill([])));
  const [pencilMode, setPencilMode] = useState(false);
  const [selectedCell, setSelectedCell] = useState([0, 0]);
  const [mistakes, setMistakes] = useState(0);
  // Countdown Timer: 5-minute limit (300s)
  const [timer, setTimer] = useState(300);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [validationMsg, setValidationMsg] = useState(null);

  const currentPreset = SUDOKU_PRESETS[difficulty];

  // Countdown Timer: Only counts down when isPlaying is true
  useEffect(() => {
    if (!isPlaying || isCompleted || isTimeUp) return;
    if (timer <= 0) {
      setIsTimeUp(true);
      return;
    }
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isCompleted, isTimeUp, timer]);

  const loadDifficulty = (diff) => {
    setDifficulty(diff);
    setGrid(SUDOKU_PRESETS[diff].puzzle.map(r => [...r]));
    setNotes(Array(9).fill(null).map(() => Array(9).fill([])));
    setSelectedCell([0, 0]);
    setMistakes(0);
    setTimer(300);
    setIsPlaying(false);
    setIsTimeUp(false);
    setIsCompleted(false);
    setValidationMsg(null);
  };

  const handleExitGame = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.pathname);
    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'practice', game: null } }));
  };

  const handleCellSelect = (r, c) => {
    setSelectedCell([r, c]);
  };

  const handleNumberInput = (num) => {
    if (!isPlaying || isCompleted || isTimeUp) return;
    const [r, c] = selectedCell;
    const isOriginal = currentPreset.puzzle[r][c] !== 0;
    if (isOriginal) return;

    if (pencilMode) {
      // Toggle note
      const cellNotes = notes[r][c];
      const nextNotes = cellNotes.includes(num)
        ? cellNotes.filter(n => n !== num)
        : [...cellNotes, num].sort();
      const newNotes = notes.map(row => [...row]);
      newNotes[r][c] = nextNotes;
      setNotes(newNotes);
      return;
    }

    const solVal = currentPreset.solution[r][c];
    const newGrid = grid.map(row => [...row]);

    if (num === 0) {
      newGrid[r][c] = 0;
      setGrid(newGrid);
      return;
    }

    // In practice mode only: track mistakes
    if (mode === 'practice' && num !== solVal) {
      setMistakes(m => m + 1);
    }

    newGrid[r][c] = num;
    setGrid(newGrid);

    // Check if fully solved
    let complete = true;
    let allFilled = true;
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (newGrid[i][j] === 0) allFilled = false;
        if (newGrid[i][j] !== currentPreset.solution[i][j]) {
          complete = false;
        }
      }
    }

    if (complete) {
      setIsCompleted(true);
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      const finalScore = Math.max(100, 1000 - timer * 2 - (mode === 'practice' ? mistakes * 50 : 0));
      recordGameResult('sudoku', finalScore, { difficulty, mode, mistakes: mode === 'practice' ? mistakes : 0, time: 300 - timer });
      setValidationMsg({ type: 'success', text: '🎉 ยอดเยี่ยมมาก! คุณแก้ปริศนาซูโดกุถูกต้องสมบูรณ์ทั้งตาราง' });
    } else if (allFilled && mode === 'competition') {
      setValidationMsg({ type: 'error', text: '⚠️ ตารางยังมีตัวเลขที่ไม่ถูกต้อง ตรวจทานและแก้ไขอีกครั้ง' });
    }
  };

  const handleReset = () => {
    loadDifficulty(difficulty, mode);
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-[#1E3E62]/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md animate-fade-in">
      {/* Game Header */}
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
                มินิเกมที่ 2
              </span>
              <span className="text-xs text-slate-400">ฝึกตรรกะตัวเลข • มาตรฐานโอลิมปิก</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              ซูโดกุ (Sudoku) <span className="text-[#008DDA] glow-primary">Olympiad Grid</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              เติมตัวเลข 1-9 ไม่ให้ซ้ำกันในแต่ละแถว คอลัมน์ และตารางย่อย 3x3
            </p>
          </div>
        </div>

        {/* Mode Indicator & Difficulty Selector */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Mode Indicator Badge (No mode toggle inside game) */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-[#0B192C] border border-white/10">
            {mode === 'competition' ? (
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" /> โหมดแข่งขัน (ไร้ตัวช่วย)
              </span>
            ) : (
              <span className="text-xs font-bold text-[#008DDA] flex items-center gap-1.5">
                <Edit3 className="w-3.5 h-3.5 text-[#008DDA]" /> โหมดฝึกซ้อม
              </span>
            )}
          </div>

          {/* Difficulty Selector */}
          <div className="flex items-center gap-1.5 bg-[#0B192C] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => loadDifficulty('easy')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                difficulty === 'easy' ? 'bg-[#008DDA] text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ง่าย (Easy)
            </button>
            <button
              onClick={() => loadDifficulty('medium')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
                difficulty === 'medium' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              ปานกลาง (Medium)
            </button>
          </div>
        </div>
      </div>

      {/* Main Board Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Sudoku 9x9 Grid */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="p-3 sm:p-4 bg-[#0B192C]/90 rounded-2xl border border-[#008DDA]/40 shadow-2xl box-glow">
            <div className="grid grid-cols-9 gap-0.5 sm:gap-1 bg-slate-700/60 p-1 rounded-xl">
              {grid.map((row, r) =>
                row.map((val, c) => {
                  const isOrig = currentPreset.puzzle[r][c] !== 0;
                  const isSelected = selectedCell[0] === r && selectedCell[1] === c;
                  const isSameRowOrCol = selectedCell[0] === r || selectedCell[1] === c;
                  // In competition mode: NEVER show wrong color highlight! Only in practice mode.
                  const isWrong = mode === 'practice' && val !== 0 && !isOrig && val !== currentPreset.solution[r][c];
                  const borderR = (c + 1) % 3 === 0 && c < 8 ? 'border-r-2 border-r-slate-500/80' : '';
                  const borderB = (r + 1) % 3 === 0 && r < 8 ? 'border-b-2 border-b-slate-500/80' : '';

                  return (
                    <button
                      key={`${r}-${c}`}
                      onClick={() => handleCellSelect(r, c)}
                      className={`w-8 h-8 sm:w-11 sm:h-11 flex items-center justify-center font-bold text-sm sm:text-lg transition-all select-none ${borderR} ${borderB} ${
                        isSelected
                          ? 'bg-[#008DDA] text-white ring-2 ring-cyan-300 scale-105 z-10 rounded'
                          : isWrong
                          ? 'bg-rose-950/80 text-rose-300'
                          : isOrig
                          ? 'bg-[#1E3E62]/70 text-cyan-200'
                          : !isOrig && val !== 0
                          ? 'bg-[#0B192C] text-emerald-400 font-black'
                          : isSameRowOrCol
                          ? 'bg-slate-800/80 text-white'
                          : 'bg-[#0B192C]/90 text-white hover:bg-slate-800'
                      }`}
                    >
                      {val !== 0 ? (
                        val
                      ) : (
                        <span className="text-[9px] text-slate-500 font-mono">
                          {notes[r][c]?.slice(0, 2).join('')}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {validationMsg && (
            <div className={`mt-4 p-4 rounded-2xl border text-sm font-bold flex items-center gap-2 animate-fade-in ${
              validationMsg.type === 'success'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-200 animate-bounce'
                : 'bg-rose-950/80 border-rose-500 text-rose-200'
            }`}>
              <Sparkles className="w-5 h-5" /> {validationMsg.text}
            </div>
          )}

          {isTimeUp && !isCompleted && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500 text-rose-200 text-sm font-bold flex items-center justify-between gap-2 w-full max-w-md">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" /> หมดเวลา 5 นาทีสำหรับการแข่งขัน!
              </div>
              <button
                onClick={handleReset}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all"
              >
                เริ่มใหม่
              </button>
            </div>
          )}
        </div>

        {/* Stats & Number Pad */}
        <div className="space-y-6">
          {/* Status Bar */}
          <div className="grid grid-cols-2 gap-3 bg-[#0B192C]/80 p-4 rounded-2xl border border-white/10">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#008DDA]" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">เวลานับถอยหลัง</div>
                <div className={`text-base font-black font-mono ${timer <= 60 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {formatTimer(timer)}
                </div>
              </div>
            </div>

            {/* In Competition mode: Mistake counter is strictly hidden */}
            {mode === 'competition' ? (
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ระบบคัดกรอง</div>
                  <div className="text-xs font-bold text-amber-300">โหมดแข่งขัน (ไร้ตัวช่วย)</div>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-semibold">ข้อผิดพลาด</div>
                  <div className="text-base font-black font-mono text-rose-300">{mistakes} ครั้ง</div>
                </div>
              </div>
            )}
          </div>

          {/* Start Game Button: Timer only begins upon clicking */}
          {!isPlaying && !isCompleted && !isTimeUp && (
            <button
              onClick={() => {
                setIsPlaying(true);
                setTimer(300);
              }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" /> เริ่มเกม (Start Game)
            </button>
          )}

          {/* Number Pad 1-9 & Tools */}
          <div className="bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10">
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                <button
                  key={num}
                  disabled={isCompleted || isTimeUp || !isPlaying}
                  onClick={() => handleNumberInput(num)}
                  className="py-3 rounded-xl bg-[#1E3E62] hover:bg-[#008DDA] text-white font-black text-lg transition-all active:scale-95 shadow disabled:opacity-40"
                >
                  {num}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
              <button
                disabled={isCompleted || isTimeUp || !isPlaying}
                onClick={() => handleNumberInput(0)}
                className="py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all active:scale-95 disabled:opacity-40"
              >
                ลบตัวเลข (Erase)
              </button>
              <button
                onClick={() => setPencilMode(!pencilMode)}
                className={`py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  pencilMode
                    ? 'bg-amber-500 text-slate-950 font-black shadow-lg shadow-amber-500/20'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" /> ดินสอ {pencilMode ? 'เปิด' : 'ปิด'}
              </button>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all border border-white/5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> เริ่มต้นตารางใหม่
          </button>
        </div>
      </div>
    </div>
  );
}
