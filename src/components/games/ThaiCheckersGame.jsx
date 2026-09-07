import React, { useState, useEffect } from 'react';
import { RotateCcw, Bot, Users, Trophy, Sparkles, ChevronRight, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';

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
  const [validMoves, setValidMoves] = useState([]); // Array of [r, c]
  const [gameMode, setGameMode] = useState('ai'); // 'ai' or 'pvp'
  const [winner, setWinner] = useState(null);
  const [capturedByP1, setCapturedByP1] = useState(0);
  const [capturedByP2, setCapturedByP2] = useState(0);

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
    setBoard(initializeBoard());
    setTurn(1);
    setSelectedPos(null);
    setValidMoves([]);
    setWinner(null);
    setCapturedByP1(0);
    setCapturedByP2(0);
  };

  // Get valid moves for a piece at [r, c]
  const getMovesForPiece = (b, r, c, player) => {
    const piece = b[r][c];
    if (piece === 0 || Math.sign(piece) !== player) return [];

    const isKing = Math.abs(piece) === 2;
    const moves = [];

    // Directions
    const directions = isKing
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : player === 1
      ? [[-1, -1], [-1, 1]] // Player 1 moves UP
      : [[1, -1], [1, 1]];  // Player -1 moves DOWN

    // Check normal moves
    directions.forEach(([dr, dc]) => {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < 8 && nc >= 0 && nc < 8 && b[nr][nc] === 0) {
        moves.push({ toR: nr, toC: nc, isJump: false });
      }
    });

    // Check jump captures (Thai checkers: can jump over enemy)
    const jumpDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    jumpDirs.forEach(([dr, dc]) => {
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

    return moves;
  };

  // Handle cell click
  const handleSquareClick = (r, c) => {
    if (winner) return;
    if (gameMode === 'ai' && turn === -1) return; // Wait for AI

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
    if (wasJump) {
      newBoard[move.midR][move.midC] = 0;
      if (turn === 1) setCapturedByP1(c => c + 1);
      else setCapturedByP2(c => c + 1);
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

    if (!hasEnemyPieces) {
      setWinner(turn);
      if (turn === 1) {
        confetti({ particleCount: 70, spread: 70 });
        recordGameResult('checkers', 500, { mode: gameMode, winner: 'player1' });
      }
      return;
    }

    setTurn(nextTurn);
  };

  // AI Turn Execution
  useEffect(() => {
    if (gameMode === 'ai' && turn === -1 && !winner) {
      const timer = setTimeout(() => {
        // Collect all possible moves for AI
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

        // Prioritize jump captures
        const jumpMoves = allMoves.filter(m => m.move.isJump);
        const chosen = jumpMoves.length > 0
          ? jumpMoves[Math.floor(Math.random() * jumpMoves.length)]
          : allMoves[Math.floor(Math.random() * allMoves.length)];

        executeMove(chosen.fromR, chosen.fromC, chosen.move);
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [turn, gameMode, board, winner]);

  return (
    <div className="bg-[#1E3E62]/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/10 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
              มินิเกมที่ 3
            </span>
            <span className="text-xs text-slate-400">ฝึกตรรกะและกลยุทธ์ 24 ชม.</span>
          </div>
          <h2 className="text-2xl font-black text-white mt-1">
            หมากฮอสไทย (Thai Checkers) <span className="text-[#008DDA] glow-primary">Classic Tactics</span>
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            กติกาหมากฮอสไทยแท้ เดินทแยง กินเบี้ย และเข้าฮอสเพื่อเปิดทางเดินกว้าง
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setGameMode('ai'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              gameMode === 'ai' ? 'bg-[#008DDA] text-white shadow' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Bot className="w-4 h-4" /> สู้กับบอท (vs AI)
          </button>
          <button
            onClick={() => { setGameMode('pvp'); resetGame(); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              gameMode === 'pvp' ? 'bg-amber-500 text-slate-950 shadow' : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" /> สองคน (2 Players)
          </button>
          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="เริ่มเกมใหม่"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Board & Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* 8x8 Board Canvas */}
        <div className="lg:col-span-2 flex flex-col items-center">
          <div className="p-3 sm:p-4 bg-[#0B192C]/90 rounded-2xl border-4 border-[#1E3E62] shadow-2xl box-glow">
            <div className="grid grid-cols-8 gap-0 border-2 border-slate-700 rounded-lg overflow-hidden">
              {board.map((row, r) =>
                row.map((cell, c) => {
                  const isDark = (r + c) % 2 === 1;
                  const isSelected = selectedPos && selectedPos[0] === r && selectedPos[1] === c;
                  const isValidTarget = validMoves.some(m => m.toR === r && m.toC === c);

                  return (
                    <div
                      key={`${r}-${c}`}
                      onClick={() => handleSquareClick(r, c)}
                      className={`w-9 h-9 sm:w-14 sm:h-14 flex items-center justify-center cursor-pointer transition-all relative select-none ${
                        isDark ? 'bg-[#1E3E62]/70' : 'bg-[#0B192C]/40'
                      } ${isSelected ? 'ring-4 ring-[#008DDA] z-10' : ''}`}
                    >
                      {/* Target Indicator */}
                      {isValidTarget && (
                        <div className="w-4 h-4 rounded-full bg-emerald-400/80 animate-ping absolute" />
                      )}

                      {/* Piece */}
                      {cell !== 0 && (
                        <div
                          className={`w-7 h-7 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-black text-xs sm:text-base shadow-lg transition-transform active:scale-90 ${
                            cell > 0
                              ? 'bg-gradient-to-br from-cyan-400 to-[#008DDA] text-white border-2 border-white/70 ring-2 ring-cyan-500/50'
                              : 'bg-gradient-to-br from-amber-400 to-red-600 text-white border-2 border-white/70 ring-2 ring-red-500/50'
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

          {winner && (
            <div className="mt-4 p-3 rounded-xl bg-emerald-950/80 border border-emerald-500 text-emerald-200 text-sm font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              {winner === 1 ? '🎉 ผู้เล่น 1 (สีฟ้า) เป็นฝ่ายชนะ!' : '🤖 บอท / ผู้เล่น 2 เป็นฝ่ายชนะ!'}
            </div>
          )}
        </div>

        {/* Game Stats & Sidebar */}
        <div className="space-y-6">
          {/* Turn indicator */}
          <div className="bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10 text-center">
            <div className="text-xs uppercase font-semibold text-slate-400 mb-2">ตานี้ของฝ่าย</div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10">
              <span className={`w-3 h-3 rounded-full ${turn === 1 ? 'bg-[#008DDA]' : 'bg-red-500'} animate-pulse`} />
              <span className="font-bold text-base text-white">
                {turn === 1 ? 'ผู้เล่น 1 (ฝ่ายฟ้า)' : gameMode === 'ai' ? 'บอทคอมพิวเตอร์ (ฝ่ายแดง)' : 'ผู้เล่น 2 (ฝ่ายแดง)'}
              </span>
            </div>
          </div>

          {/* Captured Pieces Count */}
          <div className="grid grid-cols-2 gap-3 bg-[#0B192C]/80 p-4 rounded-2xl border border-white/10">
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
          <div className="bg-[#0B192C]/50 p-4 rounded-xl border border-white/5 text-xs text-slate-400 space-y-1">
            <div className="font-bold text-slate-300">กติกาหมากฮอสไทย:</div>
            <div>• เบี้ยธรรมดาเดินทแยงไปข้างหน้าทีละ 1 ช่อง</div>
            <div>• หากมีหมากฝ่ายตรงข้ามขวางและมีช่องว่างด้านหลัง ต้องกระโดดกิน</div>
            <div>• เมื่อเบี้ยเดินไปถึงแถวสุดฝั่งตรงข้าม จะกลายเป็น 👑 ฮอส (เดินทแยงหน้า-หลังได้)</div>
          </div>
        </div>
      </div>
    </div>
  );
}
