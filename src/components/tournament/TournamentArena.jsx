import React, { useState } from 'react';
import { Trophy, Clock, ArrowLeft, ShieldAlert, CheckCircle, Sparkles, Award, Star, Flame, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTournament } from '../../context/TournamentContext';
import AMathGame from '../games/AMathGame';
import SudokuGame from '../games/SudokuGame';
import ThaiCheckersGame from '../games/ThaiCheckersGame';
import SpeedMathGame from '../games/SpeedMathGame';
import Make24Game from '../games/Make24Game';
import FlashAnzanGame from '../games/FlashAnzanGame';
import ConfirmModal from '../common/ConfirmModal';

export default function TournamentArena({ tournament, onExitArena }) {
  const { currentUser } = useAuth();
  const { showToast } = useTournament();
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  if (!tournament) return null;

  const isForfeited = tournament.forfeitedStudents?.includes(currentUser?.studentId);

  const renderGame = () => {
    switch (tournament.category) {
      case 'a-math':
        return <AMathGame />;
      case 'sudoku':
        return <SudokuGame />;
      case 'checkers':
        return <ThaiCheckersGame />;
      case 'speed-math':
        return <SpeedMathGame />;
      case 'make-24':
        return <Make24Game />;
      case 'flash-anzan':
        return <FlashAnzanGame />;
      default:
        return <AMathGame />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
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
                <span>โรงเรียนบรรหารแจ่มใสวิทยา 3</span>
              </div>
            </div>
          </div>

          {/* Competitor Profile Card */}
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

        {/* Live Arbiter Monitoring Notice */}
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-2 text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            ระบบเชื่อมต่อการกำกับดูแลของคณะกรรมการ (Arbiter Live Link Active)
          </span>
          <span className="text-slate-400 text-[11px]">
            กติกาอย่างเป็นทางการ • ห้ามเปิดเบราว์เซอร์หรือเครื่องคิดเลขซ้อน
          </span>
        </div>
      </div>

      {/* Forfeit Alert if applicable */}
      {isForfeited && (
        <div className="p-6 rounded-3xl bg-rose-950/90 border-2 border-rose-500 shadow-2xl text-center space-y-3 animate-fade-in">
          <div className="w-16 h-16 rounded-3xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto text-3xl">
            ⚠️
          </div>
          <h2 className="text-xl font-black text-white">คุณถูกตัดสิทธิ์จากการแข่งขัน (Disqualified / Forfeit)</h2>
          <p className="text-xs text-rose-200 max-w-md mx-auto leading-relaxed">
            เนื่องจากรายงานตัวสายเกินกำหนดเวลาแข่งขัน หรือไม่ปฏิบัติตามกฎระเบียบของคณะกรรมการตัดสิน 
            หากมีข้อสงสัยโปรดติดต่อครูกลุ่มสาระฯ คณิตศาสตร์ โรงเรียนบรรหารแจ่มใสวิทยา 3
          </p>
          <button
            onClick={onExitArena}
            className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-600/30"
          >
            กลับสู่หน้ารายการแข่งขัน
          </button>
        </div>
      )}

      {/* Main Official Game Engine (Only playable if not forfeited) */}
      {!isForfeited && (
        <div className="bg-[#0B192C]/80 rounded-3xl p-4 sm:p-6 border border-white/10 shadow-2xl">
          {renderGame()}
        </div>
      )}

      {/* Exit Confirmation Modal */}
      <ConfirmModal
        isOpen={isExitConfirmOpen}
        onClose={() => setIsExitConfirmOpen(false)}
        onConfirm={onExitArena}
        title="ยืนยันการออกจากห้องแข่งขันจริง"
        message="คุณต้องการออกจากห้องแข่งขันจริงใช่หรือไม่?"
        details="⚠️ การออกจากห้องแข่งขันระหว่างรอบการแข่งอาจส่งผลต่อคะแนนหรือสถานะการแข่งขันของท่านในระบบ"
        confirmText="ยืนยันออกจากห้อง"
        cancelText="ทำการแข่งขันต่อ"
        type="warning"
      />
    </div>
  );
}
