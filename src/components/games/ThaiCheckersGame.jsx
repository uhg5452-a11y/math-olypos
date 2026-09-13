import React, { useState, useEffect } from 'react';
import { RotateCcw, Bot, Users, Trophy, Sparkles, ChevronRight, AlertCircle, Play, ArrowLeft } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import MatchResultModal from '../common/MatchResultModal';

// Board size 8x8
// 0: empty
// 1: Player 1 Pawn (Cyan)
// 2: Player 1 King (Cyan King)
// -1: Player 2 Pawn (Amber/Red)
// -2: Player 2 King (Amber/Red King)

export default function ThaiCheckersGame() {
  const { recordGameResult } = useGame();
  const [board, setBoard] = useState(() => initializeBoard());
  const [turn, setTurn] = useState(1); // 1 = Player 1 (Cyan), -1 = Player 2 (Red/AI)
  const [selectedPos, setSelectedPos] = useState(null); // [r, c]
  const [validMoves, setValidMoves] = useState([]); // Array of valid targets
  const [gameMode, setGameMode] = useState('pvp'); // 'pvp' (Local 2-Player), 'ai' (Solo vs Bot)
  const [winner, setWinner] = useState(null);
  const [capturedByP1, setCapturedByP1] = useState(0);
  const [capturedByP2, setCapturedByP2] = useState(0);

  // Local Match Status & Timer (Only ticks when gameStatus === 'in_game')
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes countdown
  const [gameStatus, setGameStatus] = useState('ready'); // 'ready' or 'in_game'

  // Countdown timer: only ticks when gameStatus === 'in_game'
  useEffect(() => {
    if (gameStatus !== 'in_game' || winner) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setWinner(turn === 1 ? -1 : 1); // Timeout loss
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [gameStatus, turn, winner]);

  const handleStartGame = () => {
    setGameStatus('in_game');
    setTimeLeft(600);
  };

  function initializeBoard() {
    const b = Array(8).fill(null).map(() => Array(8).fill(0));
    // Thai checkers: 8 pieces per side.
    // Row 0 & 1 for Top (Player -1)
    // Row 6 & 7 for Bottom (Player 1)
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
    return b;
  }

  const resetGame = () => {
    const initial = initializeBoard();
    setBoard(initial);
    setTurn(1);
    setSelectedPos(null);
    setValidMoves([]);
    setWinner(null);
    setCapturedByP1(0);
    setCapturedByP2(0);
    setGameStatus('ready');
    setTimeLeft(600);

  };

  // Get valid moves for a piece at [r, c] according to Thai Checkers rules
  const getMovesForPiece = (b, r, c, player) => {
    const piece = b[r][c];
    if (piece === 0 || Math.sign(piece) !== player) return [];

    const isKing = Math.abs(piece) === 2;
    const moves = [];

    if (!isKing) {
      // 1. เบี้ยธรรมดา: เดินหน้าได้อย่างเดียว ห้ามเดินถอยหลัง และห้ามกินถอยหลัง
      const forwardDirections = player === 1
        ? [[-1, -1], [-1, 1]] // Player 1 (ฝ่ายฟ้า) เดินขึ้นแถวบน (-1)
        : [[1, -1], [1, 1]];  // Player -1 (ฝ่ายแดง/บอท) เดินลงแถวล่าง (+1)

      // เดินปกติ 1 ช่องทแยงไปข้างหน้า
      forwardDirections.forEach(([dr, dc]) => {
        const nr = r + dr;
        const nc = c + dc;
        if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] === 0) {
          moves.push({ toR: nr, toC: nc, isJump: false });
        }
      });

      // กระโดดกินไปข้างหน้าได้อย่างเดียว
      forwardDirections.forEach(([dr, dc]) => {
        const midR = r + dr;
        const midC = c + dc;
        const landR = r + dr * 2;
        const landC = c + dc * 2;

        if (
          landR >= 0 && landR < 8 && landC >= 0 && landC < 8 &&
          b[landR][landC] === 0 &&
          b[midR][midC] !== 0 &&
          Math.sign(b[midR][midC]) !== player
        ) {
          moves.push({ toR: landR, toC: landC, isJump: true, midR, midC });
        }
      });
    } else {
      // 2. ตัวฮอส (King): เดินยาวทางไกลตามแนวทแยง (4 ทิศทาง) และกินยาวทางไกลทั้งหน้าและหลัง
      const kingDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

      kingDirections.forEach(([dr, dc]) => {
        let step = 1;
        let enemyFound = null;

        while (true) {
          const currR = r + dr * step;
          const currC = c + dc * step;

          if (currR < 0 || currR >= 8 || currC < 0 || currC >= 8) break;

          const cellPiece = b[currR][currC];

          if (!enemyFound) {
            if (cellPiece === 0) {
              moves.push({ toR: currR, toC: currC, isJump: false });
            } else if (Math.sign(cellPiece) === player) {
              break;
            } else {
              enemyFound = { r: currR, c: currC };
            }
          } else {
            if (cellPiece === 0) {
              moves.push({
                toR: currR,
                toC: currC,
                isJump: true,
                midR: enemyFound.r,
                midC: enemyFound.c
              });
            } else {
              break;
            }
          }

          step++;
        }
      });
    }

    return moves;
  };

  // Handle cell click
  const handleSquareClick = (r, c) => {
    if (gameStatus !== 'in_game' || winner) return;
    if (gameMode === 'ai' && turn === -1) return; // Wait for AI
    if (gameMode === 'realtime_2p' && turn !== myPlayerRole) return; // Wait for opponent's turn in 2-device match

    const piece = board[r][c];

    // If clicking own piece, select it
    if (piece !== 0 && Math.sign(piece) === turn) {
      setSelectedPos([r, c]);
      const moves = getMovesForPiece(board, r, c, turn);
      setValidMoves(moves);
      return;
    }

    // If a piece is already selected and clicking a valid move target
    if (selectedPos) {
      const targetMove = validMoves.find(m => m.toR === r && m.toC === c);
      if (targetMove) {
        executeMove(selectedPos[0], selectedPos[1], targetMove);
      } else {
        setSelectedPos(null);
        setValidMoves([]);
      }
    }
  };

  const executeMove = (fromR, fromC, move) => {
    const newBoard = board.map(row => [...row]);
    const piece = newBoard[fromR][fromC];
    newBoard[fromR][fromC] = 0;

    let wasJump = move.isJump;
    let nextP1Cap = capturedByP1;
    let nextP2Cap = capturedByP2;

    if (wasJump) {
      newBoard[move.midR][move.midC] = 0;
      if (turn === 1) {
        nextP1Cap = capturedByP1 + 1;
        setCapturedByP1(nextP1Cap);
      } else {
        nextP2Cap = capturedByP2 + 1;
        setCapturedByP2(nextP2Cap);
      }
    }

    // Promotion to King (Row 0 for player 1, Row 7 for player -1)
    let newPiece = piece;
    if (piece === 1 && move.toR === 0) newPiece = 2;
    if (piece === -1 && move.toR === 7) newPiece = -2;

    newBoard[move.toR][move.toC] = newPiece;
    setBoard(newBoard);
    setSelectedPos(null);
    setValidMoves([]);

    // Check winner
    const nextTurn = -turn;
    let hasEnemyPieces = false;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (newBoard[i][j] !== 0 && Math.sign(newBoard[i][j]) === nextTurn) {
          hasEnemyPieces = true;
          break;
        }
      }
    }

    const currentWinner = !hasEnemyPieces ? turn : null;
    if (currentWinner) {
      setWinner(currentWinner);
      if (currentWinner === 1) {
        confetti({ particleCount: 70, spread: 70 });
        recordGameResult('checkers', 500, { mode: gameMode, winner: 'player1' });
      }
    }

    setTurn(nextTurn);
  };

  // AI Turn Execution
  useEffect(() => {
    if (gameMode === 'ai' && turn === -1 && !winner && gameStatus === 'in_game') {
      const timer = setTimeout(() => {
        const allMoves = [];
        for (let r = 0; r < 8; r++) {
          for (let c = 0; c < 8; c++) {
            if (board[r][c] !== 0 && Math.sign(board[r][c]) === -1) {
              const moves = getMovesForPiece(board, r, c, -1);
              moves.forEach(m => allMoves.push({ fromR: r, fromC: c, move: m }));
            }
          }
        }

        if (allMoves.length === 0) {
          setWinner(1);
          confetti({ particleCount: 80, spread: 80 });
          return;
        }

        const jumpMoves = allMoves.filter(m => m.move.isJump);
        const chosen = jumpMoves.length > 0
          ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
          : allMoves[Math.floor(Math.random() * allMoves.length)];

        executeMove(chosen.fromR, chosen.fromC, chosen.move);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, board, winner, gameStatus]);

  const handleExitGame = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('game');
    window.history.pushState({}, '', url.pathname);
    window.dispatchEvent(new CustomEvent('navigate_view', { detail: { view: 'practice', game: null } }));
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
                มินิเกมที่ 3 • โรงเรียนบรรหารแจ่มใสวิทยา 3
              </span>
              <span className="text-xs text-slate-400">ระบบเล่น 2 คนบนเครื่องเดียวกัน (Local Hotseat)</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">
              หมากฮอสไทย (Thai Checkers) <span className="text-[#008DDA] glow-primary">Same Device</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              กติกาหมากฮอสไทยแท้: เบี้ยเดินหน้าอย่างเดียว / ฮอสเดินและกินยาวทางไกล ผลัดกันเดินหมากบนหน้าจอเดียวกัน
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => { setGameMode('pvp'); resetGame(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              gameMode === 'pvp' ? 'bg-[#008DDA] text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> 2 คนบนเครื่องนี้ (Local 2P)
          </button>

          <button
            onClick={() => { setGameMode('ai'); resetGame(); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              gameMode === 'ai' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" /> เล่นกับบอท (Solo vs Bot)
          </button>

          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="เริ่มกระดานใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Start Game Alert Banner (Before starting) */}
      {gameStatus === 'ready' && !winner && (
        <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0B192C] to-teal-950/80 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Play className="w-5 h-5 fill-current" />
            </span>
            <div>
              <div className="text-sm font-bold text-white">พร้อมสำหรับการประลองหมากฮอสไทย</div>
              <div className="text-xs text-slate-300">
                เวลานับถอยหลัง 10 นาทีจะยังไม่เริ่มเดิน จนกว่าผู้เล่นจะกดปุ่ม "เริ่มเกม (Start Game)"
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleStartGame}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap"
          >
            <Play className="w-4 h-4 fill-current" /> เริ่มเกม (Start Game)
          </button>
        </div>
      )}

      {/* Main Board & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* 8x8 Board Canvas */}
        <div className="lg:col-span-2 flex justify-center">
          <div className="p-3 sm:p-4 bg-[#0B192C] rounded-3xl border-4 border-[#1E3E62] shadow-2xl">
            <div className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded-xl overflow-hidden shadow-inner">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
                  const isValidTarget = validMoves.some(m => m.toR === r && m.toC === c);

                  return (
                    <button
                      key={`${r}-${c}`}
                      disabled={!isDark}
                      onClick={() => handleSquareClick(r, c)}
                      className={`w-10 h-10 sm:w-14 sm:h-14 md:w-16 md:h-16 flex items-center justify-center relative select-none transition-all ${
                        isDark
                          ? 'bg-[#1E3E62]/80 hover:bg-[#1E3E62] active:scale-95'
                          : 'bg-[#0B192C]/40 cursor-default'
                      } ${isSelected ? 'ring-4 ring-cyan-400 z-10' : ''}`}
                    >
                      {/* Highlight Valid Move Dots */}
                      {isValidTarget && (
                        <div className="w-4 h-4 rounded-full bg-emerald-400/90 ring-4 ring-emerald-300/40 animate-pulse z-20" />
                      )}

                      {/* Pieces */}
                      {cell !== 0 && (
                        <div
                          className={`w-8 h-8 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs sm:text-lg shadow-xl transition-transform ${
                            cell > 0
                              ? 'bg-gradient-to-br from-cyan-400 to-blue-600 text-white border-2 border-white shadow-cyan-500/50'
                              : 'bg-gradient-to-br from-amber-400 to-red-600 text-white border-2 border-white shadow-red-500/50'
                          } ${isSelected ? 'scale-110 shadow-2xl' : ''}`}
                        >
                          {Math.abs(cell) === 2 ? '👑' : ''}
                        </div>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Game Stats & Instructions */}
        <div className="space-y-4">
          {/* Turn Indicator */}
          <div className="bg-[#0B192C] p-5 rounded-2xl border border-white/10 shadow-xl">
            <div className="text-xs uppercase font-bold text-slate-400 tracking-wider">สถานะตาเดินสด</div>
            <div className="flex items-center gap-3 mt-2">
              <div
                className={`w-4 h-4 rounded-full ${
                  turn === 1 ? 'bg-cyan-400 shadow-lg shadow-cyan-400/50' : 'bg-red-400 shadow-lg shadow-red-400/50'
                } animate-pulse`}
              />
              <span className="text-base font-black text-white">
                {turn === 1 ? 'ฝ่ายฟ้า (Player 1)' : gameMode === 'ai' ? 'ฝ่ายแดง (บอท AI)' : 'ฝ่ายแดง (Player 2)'}
              </span>
            </div>

            <div className="mt-2.5 p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-slate-200">
              {turn === 1 ? (
                <span className="text-cyan-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  👉 ถึงตาเดินของผู้เล่นที่ 1 (ฝ่ายฟ้า)
                </span>
              ) : gameMode === 'ai' ? (
                <span className="text-amber-300 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  🤖 บอทกำลังคำนวณการเดิน...
                </span>
              ) : (
                <span className="text-red-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
                  👉 ถึงตาเดินของผู้เล่นที่ 2 (ฝ่ายแดง)
                </span>
              )}
            </div>

            {/* Countdown Timer Display (Requirement 3: Timer does not start until Start Game is pressed) */}
            <div className="mt-3 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-slate-400">⏱️ เวลาแข่งขัน (10 นาที):</span>
              <span className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded-md ${
                timeLeft < 60 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse' : 'bg-white/5 text-amber-300 border border-white/10'
              }`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </span>
            </div>

            {gameStatus !== 'in_game' && !winner && (
              <button
                type="button"
                onClick={handleStartGame}
                className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 transition-all active:scale-95"
              >
                <Play className="w-4 h-4 fill-current" /> เริ่มเกม (Start Game)
              </button>
            )}
          </div>

          {/* Winner Notification */}
          {winner && (
            <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm font-bold flex items-center gap-3 animate-bounce">
              <Trophy className="w-6 h-6 text-yellow-400" />
              <div>
                <div>ผู้ชนะ: {winner === 1 ? 'ฝ่ายฟ้า (Player 1) ชนะ!' : 'ฝ่ายแดง (Player 2) ชนะ!'}</div>
                <div className="text-xs text-emerald-300/80 font-normal">ชนะอย่างสมบูรณ์แบบตามกติกาหมากฮอสไทย</div>
              </div>
            </div>
          )}

          {/* Captured Pieces Counter */}
          <div className="grid grid-cols-2 gap-3 bg-[#0B192C] p-4 rounded-2xl border border-white/10">
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">หมากที่ฝ่ายฟ้ากินได้</div>
              <div className="text-xl font-black text-[#008DDA] mt-1">{capturedByP1} เบี้ย</div>
            </div>
            <div className="text-center">
              <div className="text-[10px] uppercase font-bold text-slate-400">หมากที่ฝ่ายแดงกินได้</div>
              <div className="text-xl font-black text-red-400 mt-1">{capturedByP2} เบี้ย</div>
            </div>
          </div>

          {/* Rules Reminder */}
          <div className="bg-[#0B192C]/50 p-4 rounded-xl border border-white/5 text-xs text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-200 flex items-center gap-1">
              <span>👑</span> กติกาหมากฮอสไทยแท้:
            </div>
            <div>• <strong className="text-cyan-300">ตัวหมากปกติ (เบี้ย):</strong> เดินหน้าได้อย่างเดียว 1 ช่อง <strong>ห้ามเดินถอยหลัง และห้ามกินถอยหลัง</strong></div>
            <div>• <strong className="text-amber-300">ตัวฮอส (King):</strong> เมื่อเข้าฮอสแล้ว สามารถ<strong>เดินยาวทางไกล</strong>ตามแนวทแยง 4 ทิศทาง และสามารถ<strong>กินยาวทางไกล</strong>ข้ามหมากฝ่ายตรงข้ามได้ทั้งหน้าและหลัง</div>
          </div>
        </div>
      </div>

      {/* Match Result Summary Modal */}
      <MatchResultModal
        isOpen={winner !== null}
        onClose={() => setWinner(null)}
        onPlayAgain={resetGame}
        result={winner === 1 ? 'win' : 'loss'}
        winnerName={winner === 1 ? 'ฝ่ายฟ้า (Player 1)' : 'ฝ่ายแดง (Player 2 / Bot)'}
        p1Name="ฝ่ายฟ้า (Player 1)"
        p2Name="ฝ่ายแดง (Player 2 / Bot)"
        p1Score={capturedByP1}
        p2Score={capturedByP2}
        gameTitle="หมากฮอสไทย (Thai Checkers)"
        elapsedTime={`${Math.floor((600 - timeLeft) / 60)}:${((600 - timeLeft) % 60).toString().padStart(2, '0')} นาที`}
        details={`ฝ่ายฟ้ากินได้ ${capturedByP1} เบี้ย | ฝ่ายแดงกินได้ ${capturedByP2} เบี้ย`}
      />
    </div>
  );
}
