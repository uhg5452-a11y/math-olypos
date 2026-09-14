import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, ArrowLeft, ShieldAlert, CheckCircle, Sparkles, 
  Award, Star, Flame, Eye, Play, Radio, AlertTriangle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTournament } from '../../context/TournamentContext';
import { realtimeService } from '../../services/realtimeService';
import AMathGame from '../games/AMathGame';
import SudokuGame from '../games/SudokuGame';
import ThaiCheckersGame from '../games/ThaiCheckersGame';
import SpeedMathGame from '../games/SpeedMathGame';
import Make24Game from '../games/Make24Game';
import FlashAnzanGame from '../games/FlashAnzanGame';
import ConfirmModal from '../common/ConfirmModal';

export default function TournamentArena({ tournament, onExitArena }) {
  const { currentUser, isTeacher, isAdmin } = useAuth();
  const { showToast } = useTournament();

  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);
  
  // Match States: 'waiting_teacher', 'countdown', 'in_progress', 'time_up'
  const [matchState, setMatchState] = useState('waiting_teacher');
  const [countdownNum, setCountdownNum] = useState(3);
  
  // Official Preset Timer in seconds
  const totalDurationSeconds = (tournament?.durationMinutes || 15) * 60;
  const [timeLeft, setTimeLeft] = useState(totalDurationSeconds);

  // Trigger 3-2-1 Countdown
  const triggerCountdown = () => {
    setMatchState('countdown');
    setCountdownNum(3);

    let count = 3;
    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdownNum(count);
      } else if (count === 0) {
        setCountdownNum('START!');
      } else {
        clearInterval(interval);
        setMatchState('in_progress');
      }
    }, 1000);
  };

  // Real-time listen to Teacher/Arbiter Start Command
  useEffect(() => {
    if (!tournament) return;

    const unsub = realtimeService.subscribe('match_control', 'start_match', (payload) => {
      if (!payload || payload.tournamentId === tournament.id || !payload.tournamentId) {
        triggerCountdown();
      }
    });

    return () => unsub();
  }, [tournament?.id]);

  // Match Timer interval when in_progress
  useEffect(() => {
    if (matchState !== 'in_progress') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setMatchState('time_up');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchState]);

  if (!tournament) return null;

  const isForfeited = tournament.forfeitedStudents?.includes(currentUser?.studentId);

  // Format MM:SS
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(mins).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderGame = () => {
    switch (tournament.category) {
      case 'a-math':
        return <AMathGame mode="competition" />;
      case 'sudoku':
        return <SudokuGame mode="competition" />;
      case 'checkers':
        return <ThaiCheckersGame mode="competition" />;
      case 'speed-math':
        return <SpeedMathGame mode="competition" />;
      case 'make-24':
        return <Make24Game mode="competition" />;
      case 'flash-anzan':
        return <FlashAnzanGame mode="competition" />;
      default:
        return <AMathGame mode="competition" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Official Arena Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B192C] via-[#1E3E62] to-[#0B192C] border-2 border-amber-400/60 p-6 shadow-2xl box-glow-gold">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start md:items-center gap-4">
            <button
              onClick={() => setIsExitConfirmOpen(true)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 text-xs font-bold shrink-0 border border-white/10 active:scale-95"
              title="ออกจากห้องแข่งขัน"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ออกจากอารีน่า</span>
            </button>

            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-3 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[11px] font-black tracking-wider uppercase flex items-center gap-1 shadow-md shadow-amber-500/20">
                  <Flame className="w-3.5 h-3.5 fill-current text-slate-950" /> ห้องแข่งขันจริง (Official Tournament Arena)
                </span>
                <span className={`px-3 py-0.5 rounded-full text-xs font-black border ${
                  tournament.division === 'junior'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                    : 'bg-purple-500/20 text-purple-300 border-purple-400/40'
                }`}>
                  {tournament.divisionName || (tournament.division === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)')}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                {tournament.title}
              </h1>
              <div className="text-xs text-slate-300 mt-1 flex items-center gap-3">
                <span>{tournament.roundName}</span>
                <span>•</span>
                <span>โรงเรียนบรรหารแจ่มใสวิทยา 3 (บ.จ.3)</span>
              </div>
            </div>
          </div>

          {/* Official Match Countdown Clock & Competitor Card */}
          <div className="flex items-center gap-3">
            {matchState === 'in_progress' && (
              <div className="bg-rose-950/80 border-2 border-rose-500 px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-rose-600/30 animate-pulse">
                <Clock className="w-6 h-6 text-rose-400" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-rose-300">เวลาแข่งขันคงเหลือ</div>
                  <div className="text-2xl font-mono font-black text-white">{formatTime(timeLeft)}</div>
                </div>
              </div>
            )}

            <div className="bg-[#0B192C]/90 border border-amber-400/30 px-5 py-3 rounded-2xl flex items-center gap-3">
              <span className="text-3xl">{currentUser?.avatar || '🧑‍🎓'}</span>
              <div className="text-left">
                <div className="text-[10px] text-amber-300 font-bold uppercase">ผู้เข้าแข่งขัน</div>
                <div className="text-sm font-black text-white">{currentUser?.name || 'ผู้เข้าแข่งขัน'}</div>
                <div className="text-[11px] text-[#008DDA] font-mono">
                  {currentUser?.studentId} • {currentUser?.grade || 'มัธยมศึกษา'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Arbiter Monitoring Notice */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            ระบบควบคุมโดยครูผู้ดูแลการแข่งขัน (Teacher Arbiter Connected)
          </span>
          <span className="text-slate-400 text-[11px]">
            กำหนดเวลาทางการ: <strong>{tournament.durationMinutes || 15} นาที</strong> • ตัดสิทธิ์ทันทีหากทุจริต
          </span>
        </div>
      </div>

      {/* Forfeit Alert if student was disqualified */}
      {isForfeited ? (
        <div className="p-8 rounded-3xl bg-rose-950/90 border-2 border-rose-500 shadow-2xl text-center space-y-4 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <h2 className="text-2xl font-black text-white">คุณถูกตัดสิทธิ์จากการแข่งขัน (Disqualified / Forfeit)</h2>
          <p className="text-sm text-rose-200 max-w-lg mx-auto leading-relaxed">
            เนื่องจากรายงานตัวสายเกินกำหนดเวลาแข่งขัน หรือไม่ปฏิบัติตามกฎระเบียบของคณะกรรมการตัดสิน 
            โรงเรียนบรรหารแจ่มใสวิทยา 3
          </p>
          <button
            onClick={onExitArena}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30"
          >
            ออกจากห้องแข่งขัน
          </button>
        </div>
      ) : matchState === 'waiting_teacher' ? (
        /* STATE 1: WAITING FOR TEACHER TO START MATCH */
        <div className="p-10 rounded-3xl bg-[#1E3E62]/40 border border-white/10 backdrop-blur-xl text-center space-y-6 max-w-3xl mx-auto shadow-2xl animate-fade-in">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 text-amber-300 flex items-center justify-center mx-auto text-4xl shadow-lg shadow-amber-500/20">
            ⏳
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-black uppercase tracking-wider border border-amber-400/30">
              Waiting for Match Arbiter
            </span>
            <h2 className="text-2xl font-black text-white">
              รอครูผู้ดูแลห้องแข่งกดปุ่ม "เริ่มการแข่งขัน"
            </h2>
            <p className="text-xs text-slate-300 max-w-lg mx-auto leading-relaxed">
              ผู้เข้าแข่งขันได้รายงานตัวเข้าสู่สนามประลองเรียบร้อยแล้ว กรุณาเตรียมความพร้อม 
              เมื่อครูผู้ดูแลห้องแข่งกดเริ่มแมตช์จาก Teacher Dashboard หน้าจอจะแสดงตัวนับถอยหลัง 
              <strong className="text-amber-300"> 3... 2... 1... START! </strong> พร้อมกันทันที
            </p>
          </div>

          {/* Match Parameters Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0B192C]/80 p-4 rounded-2xl border border-white/10 text-xs text-left">
            <div>
              <div className="text-slate-400 text-[10px]">ประเภทการแข่งขัน:</div>
              <div className="font-bold text-white mt-0.5">{tournament.categoryName}</div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">สายการแข่งขัน:</div>
              <div className="font-bold text-amber-300 mt-0.5">
                {tournament.division === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 text-[10px]">เวลาแข่งขันทางการ:</div>
              <div className="font-bold text-emerald-400 mt-0.5">{tournament.durationMinutes || 15} นาที</div>
            </div>
          </div>

          {/* Teacher / Admin Direct Start Button (or simulation trigger) */}
          {(isTeacher || isAdmin) && (
            <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-left space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" /> แผงควบคุมกรรมการผู้ตัดสิน (Arbiter Quick Start):
                </span>
                <span className="text-[10px] text-slate-400">คุณมีสิทธิ์ครู/แอดมิน</span>
              </div>
              <button
                onClick={() => triggerCountdown()}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-current" /> กดเริ่มการแข่งขันทันที (Start Match 3-2-1 Countdown)
              </button>
            </div>
          )}
        </div>
      ) : matchState === 'countdown' ? (
        /* STATE 2: 3-2-1-START ANIMATED COUNTDOWN OVERLAY */
        <div className="fixed inset-0 z-50 bg-[#0B192C]/95 backdrop-blur-2xl flex flex-col items-center justify-center animate-fade-in select-none">
          <div className="text-center space-y-6">
            <span className="text-amber-400 text-sm font-black uppercase tracking-widest animate-pulse">
              โรงเรียนบรรหารแจ่มใสวิทยา 3 • {tournament.title}
            </span>

            {/* Giant Animated Number */}
            <div className="relative">
              <div className="text-9xl sm:text-[180px] font-black text-transparent bg-clip-text bg-gradient-to-br from-yellow-300 via-amber-400 to-rose-500 font-mono tracking-tighter drop-shadow-2xl animate-bounce">
                {countdownNum}
              </div>
            </div>

            <div className="text-lg font-bold text-white tracking-wide">
              {countdownNum === 'START!' ? '🚀 เริ่มการแข่งขันได้! ลุย!' : 'เตรียมพร้อมสำหรับการแข่งขัน...'}
            </div>
          </div>
        </div>
      ) : matchState === 'time_up' ? (
        /* STATE 4: TIME UP MODAL */
        <div className="p-10 rounded-3xl bg-rose-950/90 border-2 border-rose-500 text-center space-y-4 max-w-md mx-auto shadow-2xl animate-fade-in">
          <Clock className="w-16 h-16 text-rose-400 mx-auto animate-pulse" />
          <h2 className="text-2xl font-black text-white">หมดเวลาการแข่งขัน!</h2>
          <p className="text-xs text-rose-200">
            หมดเวลาแข่งขันทางการ {tournament.durationMinutes || 15} นาที เรียบร้อยแล้ว ระบบได้หยุดเวลาและบันทึกข้อมูลของท่าน
          </p>
          <button
            onClick={onExitArena}
            className="w-full py-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs"
          >
            กลับสู่หน้ารายการแข่งขัน
          </button>
        </div>
      ) : (
        /* STATE 3: MATCH IN PROGRESS (GAME ACTIVE) */
        <div className="relative animate-fade-in">
          {renderGame()}
        </div>
      )}

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        onConfirm={() => {
          setIsExitConfirmOpen(false);
          onExitArena();
        }}
        title="ออกจากห้องแข่งขัน (Exit Arena)"
        message="ยืนยันการออกจากสนามแข่งขันจริงหรือไม่?"
        details="หากคุณออกระหว่างการแข่งขัน อาจทำให้เสียสิทธิ์หรือถูกปรับแพ้ตามกฎของคณะกรรมการ"
        confirmText="ยืนยันออกจากห้อง"
        type="warning"
      />
    </div>
  );
}
