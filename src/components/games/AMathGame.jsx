import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle2, RotateCcw, Award, Sparkles, HelpCircle, Trophy, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

const INITIAL_BOARD_SIZE = 7;

// Special multiplier cells
const SPECIAL_CELLS = {
  '0,0': { text: '3E', bg: 'bg-rose-900/60 text-rose-300' },
  '0,6': { text: '3E', bg: 'bg-rose-900/60 text-rose-300' },
  '6,0': { text: '3E', bg: 'bg-rose-900/60 text-rose-300' },
  '6,6': { text: '3E', bg: 'bg-rose-900/60 text-rose-300' },
  '3,3': { text: '★', bg: 'bg-amber-500/40 text-amber-200' },
  '1,1': { text: '2P', bg: 'bg-blue-900/60 text-blue-300' },
  '5,5': { text: '2P', bg: 'bg-blue-900/60 text-blue-300' },
  '1,5': { text: '2P', bg: 'bg-blue-900/60 text-blue-300' },
  '5,1': { text: '2P', bg: 'bg-blue-900/60 text-blue-300' }
};

const SAMPLE_TILES = [
  '7', '+', '5', '=', '12',
  '9', '×', '3', '=', '27',
  '20', '-', '8', '=', '12',
  '4', '8', '2', '÷', '+'
];

export default function AMathGame() {
  const { recordGameResult } = useGame();
  const [board, setBoard] = useState(() => {
    const b = Array(INITIAL_BOARD_SIZE).fill(null).map(() => Array(INITIAL_BOARD_SIZE).fill(''));
    // Pre-populate an initial starter equation on center row (row 3)
    b[3][1] = '9';
    b[3][2] = '+';
    b[3][3] = '6';
    b[3][4] = '=';
    b[3][5] = '15';
    return b;
  });

  const [rack, setRack] = useState(['8', '×', '2', '=', '16', '+', '4', '12']);
  const [selectedTileIdx, setSelectedTileIdx] = useState(null);
  const [score, setScore] = useState(15);
  const [timeLeft, setTimeLeft] = useState(180); // 3-minute competition countdown
  const [isTimeUp, setIsTimeUp] = useState(false);
  const [equationMessage, setEquationMessage] = useState('ยินดีต้อนรับสู่ A-Math! เลือกเบี้ยด้านล่างแล้วคลิกวางลงบนกระดาน');
  const [history, setHistory] = useState([
    { eq: '9 + 6 = 15', pts: 15, valid: true }
  ]);

  // Countdown timer effect
  useEffect(() => {
    if (isTimeUp) return;
    if (timeLeft <= 0) {
      setIsTimeUp(true);
      setEquationMessage('⏱️ หมดเวลาแข่งขัน 3 นาทีสำหรับเกม A-Math!');
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isTimeUp]);

  // Handle clicking a cell on the board
  const handleCellClick = (r, c) => {
    if (selectedTileIdx !== null) {
      const tileValue = rack[selectedTileIdx];
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = tileValue;
      setBoard(newBoard);

      // Remove from rack
      const newRack = [...rack];
      newRack.splice(selectedTileIdx, 1);
      setRack(newRack);
      setSelectedTileIdx(null);
      setEquationMessage(`วาง "${tileValue}" ลงในแถว ${r + 1} คอลัมน์ ${c + 1}`);
    } else if (board[r][c] !== '') {
      // Pick up tile back to rack if player wishes
      const char = board[r][c];
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = '';
      setBoard(newBoard);
      setRack(prev => [...prev, char]);
      setEquationMessage(`ดึงเบี้ย "${char}" กลับสู่แท่นวาง`);
    }
  };

  // Evaluate row or column equations
  const handleCheckEquations = () => {
    let newEquationsFound = 0;
    let earnedPoints = 0;

    // Check rows
    for (let r = 0; r < INITIAL_BOARD_SIZE; r++) {
      const rowStr = board[r].filter(Boolean).join(' ');
      if (rowStr.includes('=')) {
        const parts = rowStr.split('=');
        if (parts.length === 2) {
          try {
            const leftExpr = parts[0].replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.]/g, '');
            const rightExpr = parts[1].replace(/×/g, '*').replace(/÷/g, '/').replace(/[^0-9+\-*/.]/g, '');
            if (leftExpr && rightExpr) {
              // eslint-disable-next-line no-eval
              const leftVal = Function(`'use strict'; return (${leftExpr})`)();
              const rightVal = Function(`'use strict'; return (${rightExpr})`)();
              if (leftVal === rightVal && !isNaN(leftVal)) {
                newEquationsFound++;
                earnedPoints += 25;
              }
            }
          } catch {
            // Ignore syntax errors
          }
        }
      }
    }

    if (earnedPoints > 0) {
      setScore(prev => prev + earnedPoints);
      setEquationMessage(`🎉 ตรวจพบสมการถูกต้อง! ได้รับคะแนน +${earnedPoints} แต้ม`);
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      recordGameResult('a-math', score + earnedPoints, { equations: newEquationsFound });
    } else {
      setEquationMessage('⚠️ ไม่พบสมการใหม่ที่ถูกต้องตามหลักคณิตศาสตร์ (ลองสร้างสมการ เช่น 8 × 2 = 16)');
    }
  };

  const refillRack = () => {
    const extra = ['3', '7', '-', '×', '5', '=', '15', '2'];
    setRack(extra);
    setEquationMessage('แจกเบี้ยชุดใหม่เรียบร้อยแล้ว');
  };

  const resetBoard = () => {
    const b = Array(INITIAL_BOARD_SIZE).fill(null).map(() => Array(INITIAL_BOARD_SIZE).fill(''));
    b[3][1] = '9';
    b[3][2] = '+';
    b[3][3] = '6';
    b[3][4] = '=';
    b[3][5] = '15';
    setBoard(b);
    setScore(15);
    setRack(['8', '×', '2', '=', '16', '+', '4', '12']);
    setTimeLeft(180);
    setIsTimeUp(false);
    setEquationMessage('รีเซ็ตกระดานเรียบร้อยแล้ว');
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
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
              มินิเกมที่ 1
            </span>
            <span className="text-xs text-slate-400">โหมดแข่งขันจับเวลา 3 นาที</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            เอแมท (A-Math) <span className="text-[#008DDA] glow-primary">สมการอักษรไขว้</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            วางเบี้ยตัวเลขและเครื่องหมายคำนวณ เพื่อสร้างสมการที่ถูกต้องทั้งแนวนอนและแนวตั้ง
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Countdown timer badge */}
          <div className={`px-4 py-2 rounded-2xl border text-center transition-all ${
            timeLeft <= 30 && !isTimeUp
              ? 'bg-rose-950/80 border-rose-500 animate-pulse'
              : 'bg-[#0B192C] border-white/10'
          }`}>
            <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3 text-[#008DDA]" /> เวลาแข่งขัน
            </div>
            <div className={`text-xl font-black font-mono ${
              timeLeft <= 30 && !isTimeUp ? 'text-rose-400' : 'text-white'
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
            onClick={resetBoard}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
            title="รีเซ็ตกระดาน"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Board & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Board Canvas */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="p-3 bg-[#0B192C]/90 rounded-2xl border border-[#008DDA]/30 shadow-2xl box-glow">
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {board.map((row, rIdx) =>
                row.map((cell, cIdx) => {
                  const special = SPECIAL_CELLS[`${rIdx},${cIdx}`];
                  const hasValue = cell !== '';

                  return (
                    <button
                      key={`${rIdx}-${cIdx}`}
                      onClick={() => handleCellClick(rIdx, cIdx)}
                      className={`w-9 h-9 sm:w-12 sm:h-12 rounded-lg font-bold text-sm sm:text-base flex items-center justify-center transition-all relative select-none ${
                        hasValue
                          ? 'bg-amber-500 text-slate-950 shadow-md font-black ring-2 ring-amber-300'
                          : special
                          ? `${special.bg} border border-white/10 text-[10px] sm:text-xs font-semibold hover:border-amber-400`
                          : 'bg-[#1E3E62]/40 hover:bg-[#1E3E62] border border-white/5 text-slate-500'
                      }`}
                    >
                      {hasValue ? cell : special?.text || ''}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Feedback bar */}
          <div className="mt-4 w-full max-w-lg p-3 rounded-xl bg-[#0B192C]/80 border border-white/10 text-center text-xs text-slate-200 flex items-center justify-center gap-2">
            <Sparkles className="w-4 h-4 text-[#008DDA] flex-shrink-0" />
            <span>{equationMessage}</span>
          </div>
        </div>

        {/* Tile Rack & Action Controls */}
        <div className="space-y-6">
          {/* Tile Rack */}
          <div className="bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                แท่นวางเบี้ย (Your Rack)
              </h3>
              <button
                onClick={refillRack}
                className="text-[11px] font-semibold text-[#008DDA] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> สุ่มเบี้ยใหม่
              </button>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[50px] p-2 rounded-xl bg-slate-900/60 border border-white/5">
              {rack.map((tile, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedTileIdx(selectedTileIdx === idx ? null : idx)}
                  className={`w-10 h-10 rounded-lg font-black text-sm flex items-center justify-center transition-all ${
                    selectedTileIdx === idx
                      ? 'bg-[#008DDA] text-white ring-4 ring-[#008DDA]/40 scale-110 shadow-lg'
                      : 'bg-amber-400 text-slate-900 hover:bg-amber-300 active:scale-95 shadow'
                  }`}
                >
                  {tile}
                </button>
              ))}
              {rack.length === 0 && (
                <span className="text-xs text-slate-500 self-center m-auto">เบี้ยหมดแล้ว กดปุ่มสุ่มเบี้ยใหม่</span>
              )}
            </div>

            <p className="text-[11px] text-slate-400 mt-3">
              💡 คลิกเลือกเบี้ยที่ต้องการ แล้วคลิกช่องบนกระดานเพื่อวาง หรือคลิกเบี้ยบนกระดานเพื่อเก็บกลับ
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            <button
              onClick={handleCheckEquations}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" /> ตรวจสอบสมการและคิดคะแนน
            </button>
          </div>

          {/* Rules Summary */}
          <div className="bg-[#0B192C]/50 p-4 rounded-xl border border-white/5 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-[#008DDA]" /> กติกาเอแมท:
            </div>
            <div>• ต้องมีเครื่องหมาย = อย่างน้อย 1 ตัวในสมการ</div>
            <div>• ฝั่งซ้ายและขวาของเครื่องหมาย = ต้องมีค่าเท่ากัน</div>
            <div>• ช่องพิเศษ 2P/3E ทวีคูณแต้มของตัวเลขหรือสมการ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
