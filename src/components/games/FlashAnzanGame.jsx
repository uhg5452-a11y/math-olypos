import React, { useState, useEffect } from 'react';
import { Eye, Play, RotateCcw, CheckCircle2, Trophy, Clock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

export default function FlashAnzanGame() {
  const { recordGameResult } = useGame();
  const [speed, setSpeed] = useState(800); // ms per number (500, 800, 1200)
  const [count, setCount] = useState(5); // 3, 5, 8 numbers
  const [digits, setDigits] = useState(2); // 1 or 2 digits

  const [gameState, setGameState] = useState('idle'); // 'idle', 'countdown', 'flashing', 'answering', 'result'
  const [countdown, setCountdown] = useState(3);
  const [currentNumber, setCurrentNumber] = useState('');
  const [numbersList, setNumbersList] = useState([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [correctTotal, setCorrectTotal] = useState(0);
  const [answerTimeLeft, setAnswerTimeLeft] = useState(15);
  const [isWrong, setIsWrong] = useState(false);

  // Start sequence
  const startAnzan = () => {
    // Generate numbers
    const list = [];
    const min = digits === 1 ? 1 : 10;
    const max = digits === 1 ? 9 : 99;

    for (let i = 0; i < count; i++) {
      list.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    const sum = list.reduce((a, b) => a + b, 0);

    setNumbersList(list);
    setCorrectTotal(sum);
    setUserAnswer('');
    setIsWrong(false);
    setGameState('countdown');
    setCountdown(3);
    setAnswerTimeLeft(15);
  };

  // Countdown effect
  useEffect(() => {
    if (gameState === 'countdown') {
      if (countdown > 0) {
        const t = setTimeout(() => setCountdown(c => c - 1), 1000);
        return () => clearTimeout(t);
      } else {
        setGameState('flashing');
      }
    }
  }, [gameState, countdown]);

  // Flashing sequence
  useEffect(() => {
    if (gameState === 'flashing') {
      let idx = 0;
      setCurrentNumber(numbersList[0]);

      const interval = setInterval(() => {
        idx++;
        if (idx < numbersList.length) {
          setCurrentNumber(numbersList[idx]);
        } else {
          clearInterval(interval);
          setCurrentNumber('');
          setAnswerTimeLeft(15);
          setGameState('answering');
        }
      }, speed);

      return () => clearInterval(interval);
    }
  }, [gameState, numbersList, speed]);

  // Answering countdown timer effect (15 seconds limit)
  useEffect(() => {
    if (gameState !== 'answering') return;
    if (answerTimeLeft <= 0) {
      // Time up: immediately mark wrong and randomize new question
      setIsWrong(true);
      setGameState('result');
      setTimeout(() => startAnzan(), 1000);
      return;
    }

    const timer = setInterval(() => {
      setAnswerTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, answerTimeLeft]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const ans = parseInt(userAnswer.trim(), 10);
    setGameState('result');

    if (ans === correctTotal) {
      setIsWrong(false);
      const points = count * (digits * 10) + Math.round((1500 - speed) / 10);
      setScore(s => s + points);
      confetti({ particleCount: 60, spread: 70 });
      recordGameResult('flash-anzan', points, { count, digits, speed });
    } else {
      // Wrong answer: do not reveal solution, immediately randomize next question
      setIsWrong(true);
      setTimeout(() => {
        startAnzan();
      }, 1000);
    }
  };

  return (
    <div className="bg-[#1E3E62]/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
              มินิเกมที่ 6
            </span>
            <span className="text-xs text-slate-400">จินตคณิตฝึกสมอง 24 ชม.</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            จินตคณิต (Flash Anzan) <Eye className="w-6 h-6 text-[#008DDA]" />
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            ตัวเลขจะกะพริบกลางอากาศด้วยความเร็วสูง คำนวณผลรวมในใจและกรอกคำตอบ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#0B192C] px-4 py-2 rounded-2xl border border-white/10 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">คะแนนสะสม</div>
            <div className="text-xl font-black text-amber-400 flex items-center justify-center gap-1">
              <Trophy className="w-4 h-4" /> {score}
            </div>
          </div>
        </div>
      </div>

      {/* Settings Controls (Only when not playing) */}
      {(gameState === 'idle' || gameState === 'result') && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-[#0B192C]/80 p-4 rounded-2xl border border-white/10 mb-6 max-w-2xl mx-auto text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">ความเร็ว (Speed):</label>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-full bg-[#1E3E62] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value={1200}>1.2 วินาที (ระดับเริ่มต้น)</option>
              <option value={800}>0.8 วินาที (มาตรฐาน)</option>
              <option value={500}>0.5 วินาที (โอลิมปิกสปีด)</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">จำนวนตัวเลข (Count):</label>
            <select
              value={count}
              onChange={(e) => setCount(Number(e.target.value))}
              className="w-full bg-[#1E3E62] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value={3}>3 ตัวเลข</option>
              <option value={5}>5 ตัวเลข</option>
              <option value={8}>8 ตัวเลข</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">จำนวนหลัก (Digits):</label>
            <select
              value={digits}
              onChange={(e) => setDigits(Number(e.target.value))}
              className="w-full bg-[#1E3E62] border border-slate-700 rounded-xl px-3 py-2 text-white font-bold"
            >
              <option value={1}>1 หลัก (1 - 9)</option>
              <option value={2}>2 หลัก (10 - 99)</option>
            </select>
          </div>
        </div>
      )}

      {/* Flashing Arena Screen */}
      <div className="max-w-xl mx-auto">
        <div className="h-64 sm:h-72 rounded-3xl bg-gradient-to-b from-[#1E3E62] to-[#0B192C] border border-[#008DDA]/40 shadow-2xl box-glow flex items-center justify-center relative overflow-hidden">
          {gameState === 'idle' && (
            <div className="text-center space-y-3">
              <div className="text-5xl">🧠</div>
              <p className="text-slate-300 text-sm">พร้อมแล้วกดปุ่มเริ่มการทดสอบ</p>
              <button
                onClick={startAnzan}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#008DDA] to-blue-600 text-white font-bold text-sm shadow-xl shadow-blue-500/30 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" /> เริ่มแฟลชตัวเลข
              </button>
            </div>
          )}

          {gameState === 'countdown' && (
            <div className="text-center">
              <div className="text-7xl font-black font-mono text-amber-400 animate-ping">
                {countdown}
              </div>
              <div className="text-xs text-slate-400 mt-4">เตรียมตัวจดจ่อ...</div>
            </div>
          )}

          {gameState === 'flashing' && (
            <div className="text-center">
              <div className="text-7xl sm:text-8xl font-black font-mono text-white glow-primary tracking-widest animate-pulse">
                {currentNumber}
              </div>
            </div>
          )}

          {gameState === 'answering' && (
            <div className="w-full px-8 text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Clock className="w-3.5 h-3.5" /> เวลาตอบที่เหลือ: {answerTimeLeft} วิ
              </div>
              <h3 className="text-lg font-bold text-white">ผลรวมของตัวเลขทั้งหมดคือเท่าใด?</h3>
              <form onSubmit={handleSubmit} className="flex items-center gap-2 max-w-xs mx-auto">
                <input
                  type="number"
                  autoFocus
                  placeholder="คำตอบ..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="flex-1 py-3 text-center text-2xl font-black rounded-xl bg-[#0B192C] border-2 border-[#008DDA] text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-5 py-3 rounded-xl bg-[#008DDA] text-white font-bold text-sm"
                >
                  ส่ง
                </button>
              </form>
            </div>
          )}

          {gameState === 'result' && (
            <div className="text-center space-y-3 px-4">
              {!isWrong ? (
                <div>
                  <div className="text-emerald-400 text-3xl font-black flex items-center justify-center gap-2">
                    <CheckCircle2 className="w-8 h-8" /> ถูกต้องสมบูรณ์!
                  </div>
                  <div className="text-sm text-slate-300 mt-2">
                    คำตอบที่แท้จริงคือ: <span className="font-bold text-white text-lg">{correctTotal}</span>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-rose-400 text-2xl font-black">
                    ❌ ยังไม่ถูกต้อง!
                  </div>
                  <div className="text-sm text-slate-300 mt-2">
                    ระบบกำลังสุ่มเปลี่ยนชุดตัวเลขข้อใหม่ทันที...
                  </div>
                </div>
              )}

              <div className="text-xs text-slate-400 font-mono">
                ชุดตัวเลข: {numbersList.join(' + ')} = {correctTotal}
              </div>

              <div className="pt-2">
                <button
                  onClick={startAnzan}
                  className="px-6 py-2.5 rounded-xl bg-[#008DDA] text-white font-bold text-xs shadow hover:bg-cyan-500 transition-all inline-flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> เล่นอีกครั้ง
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
