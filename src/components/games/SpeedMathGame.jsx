import React, { useState, useEffect } from 'react';
import { Zap, Clock, Trophy, Flame, Play, RotateCcw, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

export default function SpeedMathGame() {
  const { recordGameResult } = useGame();
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(30); // 30 or 60 seconds
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentProblem, setCurrentProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [highestStreak, setHighestStreak] = useState(0);
  const [feedback, setFeedback] = useState(null);

  // Generate random problem suitable for math competition
  const generateProblem = () => {
    const ops = ['+', '-', '×', '÷'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let a, b, answer;

    if (op === '+') {
      a = Math.floor(Math.random() * 80) + 12;
      b = Math.floor(Math.random() * 80) + 12;
      answer = a + b;
    } else if (op === '-') {
      a = Math.floor(Math.random() * 90) + 20;
      b = Math.floor(Math.random() * a) + 5;
      answer = a - b;
    } else if (op === '×') {
      a = Math.floor(Math.random() * 15) + 3;
      b = Math.floor(Math.random() * 15) + 3;
      answer = a * b;
    } else {
      // Division with clean integer answers
      answer = Math.floor(Math.random() * 12) + 2;
      b = Math.floor(Math.random() * 12) + 2;
      a = answer * b;
    }

    return { text: `${a} ${op} ${b}`, answer };
  };

  const startGame = () => {
    setIsPlaying(true);
    setTimeLeft(duration);
    setScore(0);
    setStreak(0);
    setHighestStreak(0);
    setUserAnswer('');
    setCurrentProblem(generateProblem());
  };

  // Timer
  useEffect(() => {
    if (!isPlaying) return;
    if (timeLeft <= 0) {
      setIsPlaying(false);
      confetti({ particleCount: 70, spread: 70 });
      recordGameResult('speed-math', score, { duration, streak: highestStreak });
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, score, duration, highestStreak]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isPlaying || !currentProblem) return;

    const parsed = parseInt(userAnswer.trim(), 10);
    if (parsed === currentProblem.answer) {
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      if (nextStreak > highestStreak) setHighestStreak(nextStreak);

      const multiplier = Math.min(4, 1 + Math.floor(nextStreak / 3));
      const gained = 10 * multiplier;
      setScore(s => s + gained);
      setFeedback({ type: 'correct', text: `+${gained} (คอมโบ x${multiplier})` });
    } else {
      setStreak(0);
      setFeedback({ type: 'wrong', text: `ผิด! เฉลย: ${currentProblem.answer}` });
    }

    setUserAnswer('');
    setCurrentProblem(generateProblem());

    setTimeout(() => {
      setFeedback(null);
    }, 1000);
  };

  return (
    <div className="bg-[#1E3E62]/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
              มินิเกมที่ 4
            </span>
            <span className="text-xs text-slate-400">ประลองความเร็ว 24 ชม.</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            คิดเลขเร็ว (Speed Math) <Zap className="w-6 h-6 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            คำนวณและตอบโจทย์คณิตศาสตร์ให้ไวที่สุด ยิ่งตอบถูกต่อเนื่องคอมโบยิ่งพุ่งสูง!
          </p>
        </div>

        {/* Duration selector */}
        {!isPlaying && (
          <div className="flex items-center gap-2 bg-[#0B192C] p-1.5 rounded-2xl border border-white/10">
            <button
              onClick={() => setDuration(30)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                duration === 30 ? 'bg-[#008DDA] text-white shadow' : 'text-slate-400'
              }`}
            >
              30 วินาที
            </button>
            <button
              onClick={() => setDuration(60)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                duration === 60 ? 'bg-[#008DDA] text-white shadow' : 'text-slate-400'
              }`}
            >
              60 วินาที
            </button>
          </div>
        )}
      </div>

      {/* Main Play Area */}
      <div className="max-w-xl mx-auto text-center">
        {isPlaying ? (
          <div className="space-y-6">
            {/* Status Bar */}
            <div className="flex items-center justify-between bg-[#0B192C]/80 p-4 rounded-2xl border border-white/10">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <span className="text-xl font-black font-mono text-white">{timeLeft}s</span>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
                <Flame className="w-4 h-4 text-amber-400" /> Streak {streak}
              </div>

              <div className="flex items-center gap-1.5">
                <Trophy className="w-5 h-5 text-[#008DDA]" />
                <span className="text-xl font-black text-[#008DDA] glow-primary">{score}</span>
              </div>
            </div>

            {/* Problem Display Card */}
            <div className="relative py-12 px-6 bg-gradient-to-b from-[#1E3E62] to-[#0B192C] rounded-3xl border border-[#008DDA]/40 shadow-2xl box-glow">
              <div className="text-4xl sm:text-6xl font-black font-mono tracking-wider text-white">
                {currentProblem?.text} = ?
              </div>

              {feedback && (
                <div
                  className={`absolute bottom-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full ${
                    feedback.type === 'correct' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {feedback.text}
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="flex items-center gap-3">
              <input
                type="number"
                autoFocus
                placeholder="พิมพ์คำตอบแล้วกด Enter"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="flex-1 text-center text-2xl font-black py-3 rounded-2xl bg-[#0B192C] border-2 border-[#008DDA] text-white focus:outline-none focus:ring-4 focus:ring-[#008DDA]/30"
              />
              <button
                type="submit"
                className="px-6 py-4 rounded-2xl bg-gradient-to-r from-[#008DDA] to-blue-600 text-white font-bold text-sm shadow-lg shadow-blue-500/30 active:scale-95 transition-all"
              >
                ส่ง
              </button>
            </form>
          </div>
        ) : (
          /* Game Ready / Summary Screen */
          <div className="py-12 space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-[#008DDA] to-blue-700 flex items-center justify-center text-4xl shadow-xl shadow-blue-500/30">
              ⚡
            </div>

            <div>
              <h3 className="text-2xl font-black text-white">พร้อมประลองความเร็วหรือยัง?</h3>
              <p className="text-xs text-slate-300 mt-1 max-w-sm mx-auto">
                ระบบจะสุ่มโจทย์ บวกลบคูณหาร อย่างต่อเนื่อง ตอบให้เร็วและรักษาคอมโบเพื่อแต้มสูงสุด
              </p>
            </div>

            {score > 0 && (
              <div className="p-4 bg-[#0B192C]/80 rounded-2xl border border-white/10 max-w-xs mx-auto">
                <div className="text-xs text-slate-400">ผลงานรอบล่าสุด:</div>
                <div className="text-3xl font-black text-amber-400 glow-gold mt-1">{score} แต้ม</div>
                <div className="text-xs text-slate-300 mt-1">Streak สูงสุด: {highestStreak} ข้อ</div>
              </div>
            )}

            <button
              onClick={startGame}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-[#008DDA] to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-base shadow-xl shadow-blue-500/30 active:scale-95 transition-all inline-flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" /> เริ่มประลอง {duration} วินาที
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
