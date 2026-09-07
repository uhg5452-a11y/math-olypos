import React, { useState, useEffect } from 'react';
import { RotateCcw, Lightbulb, CheckCircle2, Trophy, Sparkles, HelpCircle, Delete } from 'lucide-react';
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
  const [hint, setHint] = useState(null);

  // New random solvable puzzle
  const newPuzzle = () => {
    const randomSet = PRESET_PUZZLES[Math.floor(Math.random() * PRESET_PUZZLES.length)];
    setNumbers([...randomSet]);
    setUsedIndices([]);
    setTokens([]);
    setHint(null);
    setMessage('สร้างสมการใหม่ให้ได้ 24');
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
    if (usedIndices.length < 4) {
      setMessage('⚠️ คุณต้องใช้ตัวเลขให้ครบทั้ง 4 ตัว!');
      return;
    }

    const exprStr = tokens.map(t => t.value).join('');
    const sanitized = exprStr.replace(/×/g, '*').replace(/÷/g, '/');

    try {
      // eslint-disable-next-line no-eval
      const result = Function(`'use strict'; return (${sanitized})`)();
      if (Math.abs(result - 24) < 1e-6) {
        setMessage(`🎉 ยอดเยี่ยม! ${exprStr} = 24 ถูกต้องสมบูรณ์!`);
        confetti({ particleCount: 50, spread: 60 });
        setScore(s => s + 25);
        setSolvedCount(c => c + 1);
        recordGameResult('make-24', score + 25, { puzzle: numbers.join(',') });
      } else {
        setMessage(`❌ ยังไม่ถูก! ผลลัพธ์ได้ ${result} (ต้องการ 24)`);
      }
    } catch {
      setMessage('⚠️ ไวยากรณ์ของสมการไม่ถูกต้อง ตรวจสอบวงเล็บหรือเครื่องหมาย');
    }
  };

  // AI 24 Solver to produce a hint
  const solve24 = (nums) => {
    const ops = ['+', '-', '*', '/'];
    const perms = [];

    // Simple permutation generator
    function permute(arr, m = []) {
      if (arr.length === 0) {
        perms.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permute(curr.slice(), m.concat(next));
        }
      }
    }
    permute(nums);

    for (let p of perms) {
      const [a, b, c, d] = p;
      for (let o1 of ops) {
        for (let o2 of ops) {
          for (let o3 of ops) {
            const forms = [
              `((${a} ${o1} ${b}) ${o2} ${c}) ${o3} ${d}`,
              `(${a} ${o1} (${b} ${o2} ${c})) ${o3} ${d}`,
              `${a} ${o1} ((${b} ${o2} ${c}) ${o3} ${d})`,
              `${a} ${o1} (${b} ${o2} (${c} ${o3} ${d}))`,
              `(${a} ${o1} ${b}) ${o2} (${c} ${o3} ${d})`
            ];
            for (let f of forms) {
              try {
                // eslint-disable-next-line no-eval
                const res = Function(`'use strict'; return (${f})`)();
                if (Math.abs(res - 24) < 1e-6) {
                  return f.replace(/\*/g, '×').replace(/\//g, '÷');
                }
              } catch {}
            }
          }
        }
      }
    }
    return 'ลองจับคู่ตัวเลขเพื่อหาตัวคูณ เช่น 3 × 8 หรือ 4 × 6';
  };

  const handleShowHint = () => {
    const solution = solve24(numbers);
    setHint(solution);
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
            <span className="text-xs text-slate-400">ฝึกตรรกะและการผสมตัวเลข 24 ชม.</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            เกม 24 (Make 24) <span className="text-[#008DDA] glow-primary">Math Puzzle</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            นำตัวเลข 4 ตัวมาคำนวณด้วย +, -, ×, ÷ และวงเล็บ ให้ได้ผลลัพธ์เท่ากับ 24
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0B192C] px-4 py-2 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">คะแนนสะสม</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> {score}
            </div>
          </div>

          <button
            onClick={newPuzzle}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-all"
            title="สุ่มโจทย์ใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Play Area */}
      <div className="max-w-xl mx-auto space-y-6">
        {/* 4 Cards / Numbers */}
        <div className="grid grid-cols-4 gap-3">
          {numbers.map((num, idx) => {
            const isUsed = usedIndices.includes(idx);
            return (
              <button
                key={idx}
                disabled={isUsed}
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
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white"
              title="ลบตัวสุดท้าย"
            >
              <Delete className="w-4 h-4" />
            </button>
            <button
              onClick={handleClear}
              className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white text-xs font-semibold"
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
              onClick={() => handleAddOperator(op)}
              className="py-3 rounded-xl bg-[#1E3E62] hover:bg-[#008DDA] text-white font-black text-lg shadow transition-all active:scale-95"
            >
              {op}
            </button>
          ))}
        </div>

        {/* Submit & Hint Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleCheck}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" /> ตรวจคำตอบ (= 24)
          </button>

          <button
            onClick={handleShowHint}
            className="px-4 py-3.5 rounded-2xl bg-[#008DDA]/20 hover:bg-[#008DDA]/30 border border-[#008DDA]/40 text-[#008DDA] font-bold text-xs flex items-center gap-1.5 transition-all"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" /> ขอคำใบ้
          </button>
        </div>

        {/* Hint Box */}
        {hint && (
          <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-xl text-xs text-amber-200 text-center animate-fade-in">
            <span className="font-bold text-amber-400">เฉลยจาก AI Solver:</span> {hint}
          </div>
        )}

        {/* Message */}
        <div className="text-center text-xs text-slate-300">
          {message}
        </div>
      </div>
    </div>
  );
}
