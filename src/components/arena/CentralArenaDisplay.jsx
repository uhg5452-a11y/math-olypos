import React, { useState, useEffect } from 'react';
import { Maximize, Minimize, Trophy, Clock, Users, Eye, Sparkles, Volume2, ShieldCheck, Flame, Award } from 'lucide-react';
import { realtimeService } from '../../services/realtimeService';
import { useTournament } from '../../context/TournamentContext';

export default function CentralArenaDisplay() {
  const { tournaments } = useTournament();
  const [selectedTable, setSelectedTable] = useState('M101');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live match state
  const [matchData, setMatchData] = useState({
    player1: { name: 'วรเมธ ปัญญาวงศ์ (ม.5/1)', score: 385, elo: 1850 },
    player2: { name: 'กานต์รวี เจริญศิลป์ (ม.6/2)', score: 412, elo: 1920 },
    turn: 1, // 1 = player 1, -1 = player 2
    lastMoveText: 'ฝ่ายฟ้า (วรเมธ) เดินเบี้ยขึ้น (5,2) → (4,3)',
    gameType: 'checkers',
    clockSeconds: 14 * 60 + 28
  });

  // 8x8 Board state
  const [board, setBoard] = useState(() => {
    const b = Array(8).fill(null).map(() => Array(8).fill(0));
    for (let r = 0; r < 2; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) b[r][c] = -1;
      }
    }
    for (let r = 6; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        if ((r + c) % 2 === 1) b[r][c] = 1;
      }
    }
    // Set an active mid-game example
    b[5][2] = 0;
    b[4][3] = 1;
    b[2][3] = -1;
    return b;
  });

  const [cheerTicker, setCheerTicker] = useState([
    '📢 ด.ช. ภานุพงศ์ (ม.3): คู่ชิงโต๊ะ 1 ดุเดือดมากครับ!',
    '📢 พิมพ์พิชชา (ม.5): พี่กานต์รวี สู้ๆ นะคะ ตัวแทนห้องเรา! 👏',
    '📢 นายนภนต์ (ม.6): ฝ่ายฟ้าเดินแก้ทางได้สวยงามมาก 🔥',
    '📢 อัครวินท์ (ม.4): ใครจะเข้าฮอสก่อนกันเนี่ย ลุ้นระทึกมาก 👑'
  ]);

  const [spectatorCount, setSpectatorCount] = useState(48);

  // Subscribe to Real-time Events for selected table
  useEffect(() => {
    realtimeService.joinRoom(selectedTable, 'arena_display', { name: 'Central Arena Screen' });

    // Listen for board move updates from players
    const unsubMove = realtimeService.subscribe(selectedTable, 'board_move', (payload) => {
      if (payload.board) setBoard(payload.board);
      if (payload.turn !== undefined) setMatchData(prev => ({ ...prev, turn: payload.turn, lastMoveText: payload.moveText || prev.lastMoveText }));
      if (payload.scores) setMatchData(prev => ({ ...prev, player1: { ...prev.player1, score: payload.scores.p1 }, player2: { ...prev.player2, score: payload.scores.p2 } }));
    });

    // Listen for live cheer messages
    const unsubCheer = realtimeService.subscribe(selectedTable, 'cheer_message', (payload) => {
      if (payload.text) {
        setCheerTicker(prev => [`📢 ${payload.sender || 'เพื่อนในโรงเรียน'}: ${payload.text}`, ...prev.slice(0, 7)]);
      }
    });

    return () => {
      unsubMove();
      unsubCheer();
      realtimeService.leaveRoom(selectedTable);
    };
  }, [selectedTable]);

  // Match clock countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setMatchData(prev => ({
        ...prev,
        clockSeconds: Math.max(0, prev.clockSeconds - 1)
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatClock = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col bg-[#070F1E] text-white min-h-[90vh] rounded-3xl border-2 border-[#008DDA]/50 shadow-2xl p-6 relative overflow-hidden box-glow ${isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none p-8' : ''}`}>
      {/* Top Banner for Projector View */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#008DDA] to-blue-700 flex items-center justify-center font-black text-2xl shadow-lg">
            ∑
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg sm:text-2xl font-black tracking-tight text-white">
                โรงเรียนบรรหารแจ่มใสวิทยา 3
              </span>
              <span className="px-3 py-0.5 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/50 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> ARENA LIVE
              </span>
            </div>
            <p className="text-xs text-slate-300 font-medium">
              หน้าจอแสดงผลกลางสำหรับการแข่งขันคณิตศาสตร์ (Projector & Arena Display)
            </p>
          </div>
        </div>

        {/* Controls: Table Switcher & Fullscreen Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#0B192C] px-3 py-1.5 rounded-xl border border-white/10 text-xs">
            <span className="text-slate-400 font-semibold">โต๊ะแข่งขัน:</span>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="bg-transparent text-[#008DDA] font-bold focus:outline-none cursor-pointer"
            >
              <option value="M101" className="bg-[#0B192C] text-white">โต๊ะ 1: หมากฮอส / เอแมท (ม.5 vs ม.6)</option>
              <option value="M102" className="bg-[#0B192C] text-white">โต๊ะ 2: ซูโดกุประลองความไว (ม.4 vs ม.5)</option>
              <option value="M401" className="bg-[#0B192C] text-white">โต๊ะ 3: คิดเลขเร็วสายฟ้าแลบ (ม.3 vs ม.4)</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0B192C] px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-slate-300">
            <Eye className="w-4 h-4 text-[#008DDA]" />
            <span className="text-white font-mono">{spectatorCount}</span> ผู้ชมในพื้นที่
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-2.5 rounded-xl bg-white/10 hover:bg-[#008DDA] text-white transition-all shadow"
            title="สลับโหมดเต็มหน้าจอสำหรับโปรเจกเตอร์"
          >
            {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Main Versus Scoreboard Header */}
      <div className="grid grid-cols-3 gap-4 my-6 items-center bg-gradient-to-r from-blue-950/70 via-[#0B192C] to-red-950/70 p-6 rounded-3xl border border-white/15 shadow-2xl">
        {/* Player 1 (Blue) */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-cyan-400 to-[#008DDA] flex items-center justify-center text-4xl shadow-xl ring-4 ring-cyan-400/50">
            🧑‍🎓
          </div>
          <div>
            <div className="text-xs text-cyan-300 font-bold uppercase tracking-wider">ฝ่ายฟ้า (PLAYER 1)</div>
            <h2 className="text-lg sm:text-2xl font-black text-white">{matchData.player1.name}</h2>
            <div className="text-xs text-slate-300 font-medium">Elo: {matchData.player1.elo}</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400 mt-1">
              คะแนน: {matchData.player1.score}
            </div>
          </div>
        </div>

        {/* Center Clock & Turn Indicator */}
        <div className="text-center flex flex-col items-center justify-center">
          <div className="px-6 py-2 rounded-2xl bg-black/60 border border-amber-400/50 text-amber-300 font-mono text-3xl sm:text-5xl font-black tracking-widest shadow-2xl glow-gold">
            {formatClock(matchData.clockSeconds)}
          </div>
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold">
            <span className={`w-2.5 h-2.5 rounded-full ${matchData.turn === 1 ? 'bg-cyan-400' : 'bg-red-500'} animate-ping`} />
            <span>ตานี้ของ: {matchData.turn === 1 ? 'ฝ่ายฟ้า' : 'ฝ่ายแดง'}</span>
          </div>
        </div>

        {/* Player 2 (Red) */}
        <div className="flex items-center justify-end gap-4 text-right">
          <div>
            <div className="text-xs text-red-300 font-bold uppercase tracking-wider">ฝ่ายแดง (PLAYER 2)</div>
            <h2 className="text-lg sm:text-2xl font-black text-white">{matchData.player2.name}</h2>
            <div className="text-xs text-slate-300 font-medium">Elo: {matchData.player2.elo}</div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-red-400 mt-1">
              คะแนน: {matchData.player2.score}
            </div>
          </div>
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-4xl shadow-xl ring-4 ring-red-500/50">
            👩‍🎓
          </div>
        </div>
      </div>

      {/* Center Live Board Canvas (Giant High-Contrast Projector Display) */}
      <div className="flex-1 flex flex-col items-center justify-center my-4">
        <div className="p-4 sm:p-6 bg-[#0B192C] rounded-3xl border-4 border-[#1E3E62] shadow-2xl box-glow">
          <div className="grid grid-cols-8 gap-0 border-4 border-slate-700 rounded-xl overflow-hidden shadow-inner">
            {board.map((row, r) =>
              row.map((cell, c) => {
                const isDark = (r + c) % 2 === 1;

                return (
                  <div
                    key={`${r}-${c}`}
                    className={`w-11 h-11 sm:w-16 sm:h-16 md:w-20 md:h-20 flex items-center justify-center relative select-none transition-all ${
                      isDark ? 'bg-[#1E3E62]/85' : 'bg-[#0B192C]/40'
                    }`}
                  >
                    {cell !== 0 && (
                      <div
                        className={`w-9 h-9 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center font-black text-sm sm:text-2xl shadow-2xl transition-transform ${
                          cell > 0
                            ? 'bg-gradient-to-br from-cyan-300 to-blue-600 text-white border-2 sm:border-4 border-white ring-2 sm:ring-4 ring-cyan-400'
                            : 'bg-gradient-to-br from-amber-400 to-red-600 text-white border-2 sm:border-4 border-white ring-2 sm:ring-4 ring-red-400'
                        }`}
                      >
                        {Math.abs(cell) === 2 ? '👑' : ''}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Last Move Status Bar */}
        <div className="mt-4 px-6 py-2 rounded-xl bg-black/50 border border-white/10 text-xs sm:text-sm font-semibold text-slate-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>การเดินล่าสุด: <strong className="text-white">{matchData.lastMoveText}</strong></span>
        </div>
      </div>

      {/* Bottom Live Cheer Ticker for Projector Audience */}
      <div className="mt-auto pt-4 border-t border-white/10 flex items-center gap-3 overflow-hidden">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 text-xs font-bold flex-shrink-0">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" /> ข้อความเชียร์สด:
        </div>
        <div className="flex-1 overflow-x-auto whitespace-nowrap text-xs text-slate-300 space-x-6">
          {cheerTicker.map((item, idx) => (
            <span key={idx} className="inline-block px-2 py-0.5 rounded bg-white/5 font-medium text-slate-200">
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
