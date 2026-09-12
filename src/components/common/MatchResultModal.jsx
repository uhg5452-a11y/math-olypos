import React from 'react';
import { Trophy, Award, Clock, RotateCcw, Home, Sparkles, XCircle, ShieldCheck } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function MatchResultModal({
  isOpen,
  onClose,
  onPlayAgain,
  result = 'win', // 'win', 'loss', 'draw'
  winnerName = '',
  p1Name = 'Player 1',
  p2Name = 'Player 2',
  p1Score = 0,
  p2Score = 0,
  elapsedTime = '0:00',
  gameTitle = 'การแข่งขัน',
  details = null
}) {
  if (!isOpen) return null;

  React.useEffect(() => {
    if (result === 'win') {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }, [result]);

  const isWin = result === 'win';
  const isDraw = result === 'draw';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-[#1E3E62] to-[#0B192C] border-2 border-[#008DDA]/50 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden box-glow">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#008DDA]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header Badge */}
        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-cyan-300 text-xs font-bold mb-3 border border-white/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            สรุปผลการแข่งขัน: {gameTitle}
          </div>

          {/* Result Icon */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl flex items-center justify-center text-4xl shadow-xl transition-transform transform hover:scale-105">
            {isWin ? (
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-amber-500/40">
                <Trophy className="w-10 h-10" />
              </div>
            ) : isDraw ? (
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-blue-500/40">
                <Award className="w-10 h-10" />
              </div>
            ) : (
              <div className="w-full h-full rounded-3xl bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center text-white">
                <XCircle className="w-10 h-10 text-rose-400" />
              </div>
            )}
          </div>

          <h2 className="text-3xl font-black text-white tracking-tight">
            {isWin ? '🏆 ยินดีด้วย! คุณเป็นผู้ชนะ' : isDraw ? '🤝 เสมอกัน! ฝีมือสูสีมาก' : '👏 จบการแข่งขัน พยายามได้ดีมาก!'}
          </h2>
          <p className="text-sm text-slate-300 mt-1">
            {winnerName ? `ผู้ชนะคือ: ${winnerName}` : 'บันทึกสถิติและคะแนนเข้าสู่ระบบกระดานผู้นำเรียบร้อยแล้ว'}
          </p>
        </div>

        {/* Scoreboard Comparison */}
        <div className="my-6 p-4 rounded-2xl bg-[#0B192C]/80 border border-white/10 relative z-10">
          <div className="grid grid-cols-2 gap-4 text-center divide-x divide-white/10">
            <div className="px-2">
              <div className="text-xs text-slate-400 font-bold truncate">{p1Name}</div>
              <div className="text-3xl font-black text-cyan-400 font-mono mt-1">{p1Score}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">คะแนนฝั่งผู้เล่น 1</div>
            </div>
            <div className="px-2">
              <div className="text-xs text-slate-400 font-bold truncate">{p2Name}</div>
              <div className="text-3xl font-black text-amber-400 font-mono mt-1">{p2Score}</div>
              <div className="text-[10px] text-slate-400 mt-0.5">คะแนนฝั่งผู้เล่น 2</div>
            </div>
          </div>

          {/* Time & Details */}
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#008DDA]" /> เวลาแข่งขัน: <strong className="text-white font-mono">{elapsedTime}</strong>
            </span>
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> ตรวจสอบเรียบร้อย
            </span>
          </div>

          {details && (
            <div className="mt-2 text-center text-xs text-slate-300 font-medium">
              {details}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 relative z-10">
          {onPlayAgain && (
            <button
              onClick={() => {
                onClose();
                onPlayAgain();
              }}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#008DDA] to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> แข่งขันอีกรอบ
            </button>
          )}

          <button
            onClick={onClose}
            className={`px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${!onPlayAgain ? 'col-span-2' : ''}`}
          >
            <Home className="w-4 h-4" /> กลับสู่ล็อบบี้
          </button>
        </div>

      </div>
    </div>
  );
}
