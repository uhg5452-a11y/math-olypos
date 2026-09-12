import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, RotateCcw, CheckCircle2,
  Sparkles, RefreshCw, ShieldAlert, Undo2, Users, Play, Eye, EyeOff, Check
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import MatchResultModal from '../common/MatchResultModal';

const BOARD_SIZE = 15;

// Special multiplier mapping
// 3E = Triple Equation (Red), 2E = Double Equation (Orange/Amber)
// 3P = Triple Piece (Blue), 2P = Double Piece (Cyan)
// ★ = Center Star (Gold, 2E on first turn)
const SPECIAL_CELLS = {
  // 3E (Triple Equation)
  '0,0': '3E', '0,7': '3E', '0,14': '3E',
  '7,0': '3E', '7,14': '3E',
  '14,0': '3E', '14,7': '3E', '14,14': '3E',

  // 2E (Double Equation)
  '1,1': '2E', '2,2': '2E', '3,3': '2E', '4,4': '2E',
  '1,13': '2E', '2,12': '2E', '3,11': '2E', '4,10': '2E',
  '13,1': '2E', '12,2': '2E', '11,3': '2E', '10,4': '2E',
  '13,13': '2E', '12,12': '2E', '11,11': '2E', '10,10': '2E',

  // 3P (Triple Piece)
  '1,5': '3P', '1,9': '3P',
  '5,1': '3P', '5,5': '3P', '5,9': '3P', '5,13': '3P',
  '9,1': '3P', '9,5': '3P', '9,9': '3P', '9,13': '3P',
  '13,5': '3P', '13,9': '3P',

  // 2P (Double Piece)
  '0,3': '2P', '0,11': '2P',
  '2,6': '2P', '2,8': '2P',
  '3,0': '2P', '3,7': '2P', '3,14': '2P',
  '6,2': '2P', '6,6': '2P', '6,8': '2P', '6,12': '2P',
  '7,3': '2P', '7,11': '2P',
  '8,2': '2P', '8,6': '2P', '8,8': '2P', '8,12': '2P',
  '11,0': '2P', '11,7': '2P', '11,14': '2P',
  '12,6': '2P', '12,8': '2P',
  '14,3': '2P', '14,11': '2P',

  // Center Star
  '7,7': '★'
};

const TILE_SCORES = {
  '0': 1, '1': 1, '2': 1, '3': 1, '4': 2, '5': 2, '6': 2, '7': 2, '8': 2, '9': 2,
  '10': 3, '11': 4, '12': 3, '13': 4, '14': 4, '15': 4, '16': 4, '17': 4, '18': 4, '19': 4, '20': 4,
  '+': 2, '-': 2, '×': 2, '÷': 2, '=': 2, '±': 3, 'BLANK': 0
};

// Initial Tile Pool
function generateTilePool() {
  const pool = [];
  const add = (tile, count) => {
    for (let i = 0; i < count; i++) pool.push(tile);
  };
  // Numbers
  add('0', 5); add('1', 6); add('2', 6); add('3', 5); add('4', 5);
  add('5', 4); add('6', 4); add('7', 4); add('8', 4); add('9', 4);
  add('10', 2); add('11', 1); add('12', 2); add('15', 1); add('20', 1);
  // Operators
  add('+', 8); add('-', 8); add('×', 6); add('÷', 6); add('=', 11);
  add('±', 2); add('BLANK', 4);
  return pool.sort(() => Math.random() - 0.5);
}

function initializeStarterBoard() {
  const b = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  // Pre-place starter center equation on row 7 (index 7)
  b[7][5] = { value: '8', isPermanent: true };
  b[7][6] = { value: '+', isPermanent: true };
  b[7][7] = { value: '7', isPermanent: true }; // Center star
  b[7][8] = { value: '=', isPermanent: true };
  b[7][9] = { value: '15', isPermanent: true };
  return b;
}

export default function AMathGame() {
  const { recordGameResult } = useGame();

  // Game Status: 'ready' (waiting to press Start), 'in_game', 'finished'
  const [gameStatus, setGameStatus] = useState('ready');

  // Board State (15x15)
  const [board, setBoard] = useState(() => initializeStarterBoard());

  // Distinct Dual Racks for P1 and P2 (8 tiles each)
  const [tilePool, setTilePool] = useState(() => generateTilePool());
  const [rackP1, setRackP1] = useState(['9', '×', '3', '=', '27', '+', '4', '12']);
  const [rackP2, setRackP2] = useState(['16', '÷', '4', '=', '4', '6', '-', '2']);
  const [currentTurn, setCurrentTurn] = useState('p1'); // 'p1' or 'p2'
  const [scoreP1, setScoreP1] = useState(15);
  const [scoreP2, setScoreP2] = useState(0);

  // Privacy mode: hide inactive player's rack tiles
  const [privacyMode, setPrivacyMode] = useState(false);

  // Selected tile from active rack
  const [selectedRackIdx, setSelectedRackIdx] = useState(null);
  const [placedThisTurn, setPlacedThisTurn] = useState([]); // Array of { r, c, value, rackIdx }

  // Turn timer (120s). Only ticks when gameStatus === 'in_game'!
  const [timeLeft, setTimeLeft] = useState(120);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('พร้อมสำหรับการแข่งขัน A-Math: กดปุ่ม "เริ่มเกม (Start Game)" เพื่อเริ่มนับเวลาแข่งขัน');
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null);
  const [history, setHistory] = useState([
    { eq: '8 + 7 = 15', pts: 15, player: 'System (Starter)' }
  ]);

  // Active Rack references based on currentTurn
  const activeRack = currentTurn === 'p1' ? rackP1 : rackP2;
  const setActiveRack = currentTurn === 'p1' ? setRackP1 : setRackP2;

  // Turn timer countdown: ONLY ticks when gameStatus === 'in_game'
  useEffect(() => {
    if (gameStatus !== 'in_game' || isMatchOver) return;

    if (timeLeft <= 0) {
      handlePassTurn();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(t => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [gameStatus, timeLeft, isMatchOver, currentTurn]);

  // Handle Start Game
  const handleStartGame = () => {
    setGameStatus('in_game');
    setTimeLeft(120);
    setStatusMessage('⚡ การแข่งขันเริ่มต้นแล้ว! ตาของผู้เล่นที่ 1 (ฝ่ายฟ้า)');
  };

  // Reset Game
  const resetGame = () => {
    setBoard(initializeStarterBoard());
    setTilePool(generateTilePool());
    setRackP1(['9', '×', '3', '=', '27', '+', '4', '12']);
    setRackP2(['16', '÷', '4', '=', '4', '6', '-', '2']);
    setScoreP1(15);
    setScoreP2(0);
    setCurrentTurn('p1');
    setSelectedRackIdx(null);
    setPlacedThisTurn([]);
    setTimeLeft(120);
    setGameStatus('ready');
    setIsMatchOver(false);
    setMatchWinner(null);
    setStatusMessage('รีเซ็ตกระดานเรียบร้อยแล้ว กด "เริ่มเกม (Start Game)" เพื่อเริ่มแข่งขัน');
  };

  // Handle cell click on 15x15 board
  const handleCellClick = (r, c) => {
    if (gameStatus !== 'in_game' || isMatchOver) return;

    const cell = board[r][c];

    // Case 1: Place selected tile from active rack
    if (selectedRackIdx !== null) {
      if (cell !== null) {
        setStatusMessage('⚠️ ช่องนี้มีเบี้ยวางอยู่แล้ว');
        return;
      }
      const tileValue = activeRack[selectedRackIdx];
      const newBoard = board.map(row => [...row]);
      newBoard[r][c] = { value: tileValue, isPermanent: false };
      setBoard(newBoard);

      setPlacedThisTurn(prev => [...prev, { r, c, value: tileValue, rackIdx: selectedRackIdx }]);

      const nextRack = [...activeRack];
      nextRack.splice(selectedRackIdx, 1);
      setActiveRack(nextRack);
      setSelectedRackIdx(null);
      setStatusMessage(`วางเบี้ย "${tileValue}" ที่แถว ${r + 1} คอลัมน์ ${c + 1}`);
      return;
    }

    // Case 2: Pick up uncommitted tile placed during this turn
    if (cell && !cell.isPermanent) {
      const placedItem = placedThisTurn.find(p => p.r === r && p.c === c);
      if (placedItem) {
        const newBoard = board.map(row => [...row]);
        newBoard[r][c] = null;
        setBoard(newBoard);

        setActiveRack(prev => [...prev, placedItem.value]);
        setPlacedThisTurn(prev => prev.filter(p => !(p.r === r && p.c === c)));
        setStatusMessage(`ดึงเบี้ย "${placedItem.value}" กลับเข้าแท่นวาง`);
      }
    }
  };

  // Action: Recall uncommitted tiles back to active rack
  const handleRecall = () => {
    if (placedThisTurn.length === 0) return;
    const newBoard = board.map(row => [...row]);
    const returnTiles = [];
    placedThisTurn.forEach(({ r, c, value }) => {
      newBoard[r][c] = null;
      returnTiles.push(value);
    });
    setBoard(newBoard);
    setActiveRack(prev => [...prev, ...returnTiles]);
    setPlacedThisTurn([]);
    setSelectedRackIdx(null);
    setStatusMessage('ดึงเบี้ยที่วางในตานี้กลับเข้าแท่นวางเรียบร้อย');
  };

  // Action: Pass Turn
  const handlePassTurn = () => {
    handleRecall();
    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    setCurrentTurn(nextTurn);
    setSelectedRackIdx(null);
    setTimeLeft(120);
    const msg = `ผู้เล่น ${currentTurn === 'p1' ? '1 (ฝ่ายฟ้า)' : '2 (ฝ่ายแดง)'} ข้ามตา -> ถึงตาผู้เล่น ${nextTurn === 'p1' ? '1 (ฝ่ายฟ้า)' : '2 (ฝ่ายแดง)'}`;
    setStatusMessage(msg);
  };

  // Action: Exchange Tiles (up to 3 tiles)
  const handleExchange = () => {
    if (placedThisTurn.length > 0) {
      setStatusMessage('กรุณาดึงเบี้ยบนกระดานกลับก่อนทำการเปลี่ยนเบี้ย');
      return;
    }
    if (activeRack.length === 0) return;

    const exchangeCount = Math.min(3, activeRack.length);
    const remaining = [...activeRack];
    const exchanged = remaining.splice(0, exchangeCount);

    const newPool = [...tilePool, ...exchanged].sort(() => Math.random() - 0.5);
    const drawn = newPool.splice(0, exchangeCount);
    const newRack = [...remaining, ...drawn];

    setActiveRack(newRack);
    setTilePool(newPool);

    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    setCurrentTurn(nextTurn);
    setSelectedRackIdx(null);
    setTimeLeft(120);
    setStatusMessage(`ผู้เล่น ${currentTurn === 'p1' ? '1' : '2'} เปลี่ยนเบี้ย ${exchangeCount} ตัวและสลับตาเล่น`);
  };

  // Arithmetic Equation Checker (LHS == RHS)
  const validateEquationString = (eqStr) => {
    if (!eqStr.includes('=')) return { valid: false };
    const parts = eqStr.split('=');
    if (parts.length !== 2) return { valid: false };

    const left = parts[0].trim();
    const right = parts[1].trim();
    if (!left || !right) return { valid: false };

    try {
      const parseExpr = (str) => {
        const sanitized = str
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/±/g, '+')
          .replace(/[^0-9+\-*/.]/g, '');
        if (!sanitized) return NaN;
        // eslint-disable-next-line no-eval
        return Function(`'use strict'; return (${sanitized})`)();
      };

      const valL = parseExpr(left);
      const valR = parseExpr(right);

      if (!isNaN(valL) && !isNaN(valR) && Math.abs(valL - valR) < 1e-6) {
        return { valid: true, value: valL };
      }
    } catch {
      return { valid: false };
    }
    return { valid: false };
  };

  // Action: Challenge Opponent's previous move (ชักเค้า)
  const handleChallenge = () => {
    if (history.length <= 1) {
      setStatusMessage('ยังไม่มีสมการของคู่ต่อสู้ให้ชักเค้า (ประท้วง)');
      return;
    }

    const lastMove = history[history.length - 1];
    const validation = validateEquationString(lastMove.eq);

    if (!validation.valid) {
      // Challenged equation was WRONG!
      setStatusMessage(`🚨 ชักเค้าสำเร็จ! สมการ "${lastMove.eq}" ผิดจริง! ตัดแต้มคู่ต่อสู้ -${lastMove.pts} และผู้ประท้วงได้ +10 แต้มโบนัส`);
      confetti({ particleCount: 60, spread: 60 });

      if (currentTurn === 'p1') {
        setScoreP2(s => Math.max(0, s - lastMove.pts));
        setScoreP1(s => s + 10);
      } else {
        setScoreP1(s => Math.max(0, s - lastMove.pts));
        setScoreP2(s => s + 10);
      }
    } else {
      // Challenged equation was VALID! Challenger penalized
      setStatusMessage(`❌ ชักเค้าไม่สำเร็จ! สมการ "${lastMove.eq}" ถูกต้องตามหลักคณิตศาสตร์ (${validation.value}) ผู้ประท้วงถูกหัก 10 แต้ม`);
      if (currentTurn === 'p1') {
        setScoreP1(s => Math.max(0, s - 10));
      } else {
        setScoreP2(s => Math.max(0, s - 10));
      }
    }
  };

  // Action: Submit / Play Equation
  const handleSubmitTurn = () => {
    if (isSubmitting || placedThisTurn.length === 0 || gameStatus !== 'in_game') return;
    setIsSubmitting(true);

    // 1. Verify alignment: all placed tiles must be in the same row or column
    const rows = [...new Set(placedThisTurn.map(p => p.r))];
    const cols = [...new Set(placedThisTurn.map(p => p.c))];

    if (rows.length > 1 && cols.length > 1) {
      setStatusMessage('❌ เบี้ยที่วางต้องอยู่ในแนวเดียวกัน (แถวเดียวกัน หรือ คอลัมน์เดียวกัน)');
      setIsSubmitting(false);
      return;
    }

    const isHorizontal = rows.length === 1;
    const isVertical = cols.length === 1;

    let formedString = '';
    let startIdx = 0;
    let endIdx = 0;
    let equationLine = '';

    if (isHorizontal) {
      const r = rows[0];
      const placedCols = placedThisTurn.map(p => p.c);
      let minC = Math.min(...placedCols);
      let maxC = Math.max(...placedCols);

      while (minC > 0 && board[r][minC - 1] !== null) minC--;
      while (maxC < BOARD_SIZE - 1 && board[r][maxC + 1] !== null) maxC++;

      startIdx = minC;
      endIdx = maxC;

      for (let c = minC; c <= maxC; c++) {
        const cell = board[r][c];
        if (!cell) {
          setStatusMessage('❌ มีช่องว่างขาดตอนในแนวสมการ กรุณาวางให้ต่อเนื่องกัน');
          setIsSubmitting(false);
          return;
        }
        equationLine += cell.value;
      }
    } else if (isVertical) {
      const c = cols[0];
      const placedRows = placedThisTurn.map(p => p.r);
      let minR = Math.min(...placedRows);
      let maxR = Math.max(...placedRows);

      while (minR > 0 && board[minR - 1][c] !== null) minR--;
      while (maxR < BOARD_SIZE - 1 && board[maxR + 1][c] !== null) maxR++;

      startIdx = minR;
      endIdx = maxR;

      for (let r = minR; r <= maxR; r++) {
        const cell = board[r][c];
        if (!cell) {
          setStatusMessage('❌ มีช่องว่างขาดตอนในแนวสมการ กรุณาวางให้ต่อเนื่องกัน');
          setIsSubmitting(false);
          return;
        }
        equationLine += cell.value;
      }
    }

    formedString = equationLine;

    // Validate LHS == RHS
    const validation = validateEquationString(formedString);
    if (!validation.valid) {
      setStatusMessage(`❌ สมการ "${formedString}" ไม่ถูกต้องตามหลักคณิตศาสตร์ (ค่าซ้าย ≠ ค่าขวา หรือรูปแบบไม่ถูกต้อง)`);
      setIsSubmitting(false);
      return;
    }

    // 2. Calculate Score & Multipliers
    let turnScore = 0;
    let equationMultiplier = 1;

    if (isHorizontal) {
      const r = rows[0];
      for (let c = startIdx; c <= endIdx; c++) {
        const val = board[r][c].value;
        let tileVal = TILE_SCORES[val] || 2;
        const spec = SPECIAL_CELLS[`${r},${c}`];
        const isNewlyPlaced = placedThisTurn.some(p => p.r === r && p.c === c);

        if (isNewlyPlaced && spec) {
          if (spec === '3P') tileVal *= 3;
          if (spec === '2P') tileVal *= 2;
          if (spec === '3E') equationMultiplier *= 3;
          if (spec === '2E' || spec === '★') equationMultiplier *= 2;
        }
        turnScore += tileVal;
      }
    } else {
      const c = cols[0];
      for (let r = startIdx; r <= endIdx; r++) {
        const val = board[r][c].value;
        let tileVal = TILE_SCORES[val] || 2;
        const spec = SPECIAL_CELLS[`${r},${c}`];
        const isNewlyPlaced = placedThisTurn.some(p => p.r === r && p.c === c);

        if (isNewlyPlaced && spec) {
          if (spec === '3P') tileVal *= 3;
          if (spec === '2P') tileVal *= 2;
          if (spec === '3E') equationMultiplier *= 3;
          if (spec === '2E' || spec === '★') equationMultiplier *= 2;
        }
        turnScore += tileVal;
      }
    }

    turnScore *= equationMultiplier;

    // Bonus Bingo (+40 if using all 8 tiles from rack)
    let isBingo = false;
    if (placedThisTurn.length === 8) {
      turnScore += 40;
      isBingo = true;
    }

    // 3. Commit board tiles as permanent
    const newBoard = board.map(row =>
      row.map(cell => (cell ? { ...cell, isPermanent: true } : null))
    );
    setBoard(newBoard);

    // 4. Update Score
    const playerName = currentTurn === 'p1' ? 'ผู้เล่น 1 (ฝ่ายฟ้า)' : 'ผู้เล่น 2 (ฝ่ายแดง)';
    let nextScoreP1 = scoreP1;
    let nextScoreP2 = scoreP2;

    if (currentTurn === 'p1') {
      nextScoreP1 = scoreP1 + turnScore;
      setScoreP1(nextScoreP1);
    } else {
      nextScoreP2 = scoreP2 + turnScore;
      setScoreP2(nextScoreP2);
    }

    // 5. Replenish Tiles from pool for active player
    const needed = 8 - activeRack.length;
    let newPool = [...tilePool];
    let newDrawn = [];

    if (newPool.length > 0 && needed > 0) {
      newDrawn = newPool.splice(0, Math.min(needed, newPool.length));
      setTilePool(newPool);
    }

    const replenishedRack = [...activeRack, ...newDrawn];
    setActiveRack(replenishedRack);

    // 6. Add to history
    const newHistory = [
      ...history,
      { eq: formedString, pts: turnScore, player: playerName, bingo: isBingo }
    ];
    setHistory(newHistory);

    confetti({ particleCount: isBingo ? 100 : 50, spread: 60 });

    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    const successMsg = `🎉 ${playerName} สร้างสมการ "${formedString}" สำเร็จ! ได้ +${turnScore} แต้ม ${isBingo ? '(🎉 บิงโก +40!)' : ''} -> ถึงตา ${nextTurn === 'p1' ? 'ผู้เล่น 1' : 'ผู้เล่น 2'}`;
    setStatusMessage(successMsg);

    // 7. Check Game End: if pool empty and rack empty
    if (newPool.length === 0 && replenishedRack.length === 0) {
      setIsMatchOver(true);
      const winner = nextScoreP1 > nextScoreP2 ? 'p1' : nextScoreP1 < nextScoreP2 ? 'p2' : 'draw';
      setMatchWinner(winner);
      recordGameResult('a-math', Math.max(nextScoreP1, nextScoreP2), {
        scoreP1: nextScoreP1,
        scoreP2: nextScoreP2,
        winner
      });
    }

    // Reset Turn States
    setPlacedThisTurn([]);
    setSelectedRackIdx(null);
    setCurrentTurn(nextTurn);
    setTimeLeft(120);
    setIsSubmitting(false);
  };

  const formatTimer = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  const getCellBadge = (r, c) => {
    const spec = SPECIAL_CELLS[`${r},${c}`];
    if (!spec) return null;
    if (spec === '3E') return <span className="text-[7px] sm:text-[8px] font-black text-rose-400">3E</span>;
    if (spec === '2E') return <span className="text-[7px] sm:text-[8px] font-black text-amber-400">2E</span>;
    if (spec === '3P') return <span className="text-[7px] sm:text-[8px] font-black text-blue-400">3P</span>;
    if (spec === '2P') return <span className="text-[7px] sm:text-[8px] font-black text-cyan-400">2P</span>;
    if (spec === '★') return <span className="text-[10px] sm:text-xs font-black text-amber-300">★</span>;
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Bar */}
      <div className="bg-[#1E3E62]/60 rounded-3xl p-4 sm:p-6 border border-white/10 backdrop-blur-md shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
                Standard 15x15 Competition • โรงเรียนบรรหารแจ่มใสวิทยา 3
              </span>
              <span className="text-xs text-slate-300">เล่น 2 คนบนจอเดียวกัน (Local Hotseat)</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              เอแมท (Standard A-Math 15x15) 🔤
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              สมการอักษรไขว้มาตรฐาน 2 ผู้เล่น ผลัดกันวางสมการ คิดคะแนนตัวคูณ 3E, 2E, 3P, 2P และดาว ★
            </p>
          </div>

          {/* Privacy Toggle & Reset Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setPrivacyMode(p => !p)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
                privacyMode
                  ? 'bg-purple-600/30 border-purple-400/50 text-purple-200'
                  : 'bg-white/5 border-white/10 text-slate-300 hover:text-white'
              }`}
              title="ซ่อนเบี้ยของฝ่ายที่ไม่ได้เล่น เพื่อไม่ให้แอบมองขณะเล่นบนเครื่องเดียวกัน"
            >
              {privacyMode ? <EyeOff className="w-4 h-4 text-purple-400" /> : <Eye className="w-4 h-4 text-slate-400" />}
              <span>{privacyMode ? 'โหมดซ่อนเบี้ย: เปิดอยู่' : 'โหมดซ่อนเบี้ย: ปิด'}</span>
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

        {/* Players Scoreboard & Timer */}
        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 items-center text-center">
          {/* Player 1 Card */}
          <div className={`p-3 rounded-2xl border transition-all ${
            currentTurn === 'p1'
              ? 'bg-[#008DDA]/20 border-[#008DDA] shadow-lg shadow-blue-500/30 ring-2 ring-[#008DDA]/50'
              : 'bg-[#0B192C]/60 border-white/5 opacity-80'
          }`}>
            <div className="text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5">
              <span>🧑‍🎓 ผู้เล่น 1 (ฝ่ายฟ้า)</span>
              {currentTurn === 'p1' && <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />}
            </div>
            <div className="text-3xl font-black text-cyan-400 font-mono mt-0.5">{scoreP1}</div>
            <div className="text-[10px] text-slate-400">เบี้ยบนแท่น: {rackP1.length} ตัว</div>
          </div>

          {/* Center Timer & Start Game Controller */}
          <div className="bg-[#0B192C]/80 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase font-bold">เวลาประจำเทิร์น</div>
            
            {gameStatus === 'in_game' ? (
              <div className={`text-2xl font-black font-mono mt-0.5 flex items-center justify-center gap-1.5 ${
                timeLeft <= 20 ? 'text-rose-400 animate-pulse' : 'text-white'
              }`}>
                <Clock className="w-4 h-4 text-amber-400" /> {formatTimer(timeLeft)}
              </div>
            ) : (
              <div className="mt-1">
                <button
                  onClick={handleStartGame}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> เริ่มเกม (Start Game)
                </button>
              </div>
            )}

            <div className="text-[10px] text-emerald-400 font-bold mt-1">
              {gameStatus === 'in_game' ? `👉 ตาของ: ${currentTurn === 'p1' ? 'ผู้เล่น 1 (ฝ่ายฟ้า)' : 'ผู้เล่น 2 (ฝ่ายแดง)'}` : '⏳ รอเริ่มการแข่งขัน'}
            </div>
          </div>

          {/* Player 2 Card */}
          <div className={`p-3 rounded-2xl border transition-all ${
            currentTurn === 'p2'
              ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/50'
              : 'bg-[#0B192C]/60 border-white/5 opacity-80'
          }`}>
            <div className="text-xs font-bold text-amber-300 flex items-center justify-center gap-1.5">
              <span>🧑‍🎓 ผู้เล่น 2 (ฝ่ายแดง)</span>
              {currentTurn === 'p2' && <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />}
            </div>
            <div className="text-3xl font-black text-amber-400 font-mono mt-0.5">{scoreP2}</div>
            <div className="text-[10px] text-slate-400">เบี้ยบนแท่น: {rackP2.length} ตัว</div>
          </div>
        </div>
      </div>

      {/* Start Game Alert Banner (Before starting) */}
      {gameStatus === 'ready' && !isMatchOver && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-[#0B192C] to-teal-950/80 border border-emerald-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <span className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Play className="w-5 h-5 fill-current" />
            </span>
            <div>
              <div className="text-sm font-bold text-white">พร้อมสำหรับการแข่งขัน A-Math มาตรฐาน 15x15</div>
              <div className="text-xs text-slate-300">
                เวลานับถอยหลัง 120 วินาทีประจำเทิร์น จะยังไม่เริ่มเดินจนกว่าผู้เล่นจะกดปุ่ม "เริ่มเกม (Start Game)"
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

      {/* Main Game Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#0B192C]/90 rounded-3xl p-3 sm:p-6 border border-white/10 shadow-2xl flex flex-col items-center">
          
          {/* Status Message */}
          <div className="w-full mb-3 px-4 py-2.5 rounded-xl bg-[#1E3E62]/60 border border-white/10 text-xs font-medium text-slate-200 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              {statusMessage}
            </span>
            {placedThisTurn.length > 0 && (
              <span className="text-emerald-400 font-bold shrink-0">
                วางแล้ว {placedThisTurn.length} ตัว
              </span>
            )}
          </div>

          {/* 15x15 Grid */}
          <div 
            className="w-full max-w-[620px] aspect-square bg-[#050D18] p-1.5 sm:p-2 rounded-2xl border-2 border-[#1E3E62] shadow-inner grid gap-0.5 sm:gap-1"
            style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))', gridTemplateRows: 'repeat(15, minmax(0, 1fr))' }}
          >
            {board.map((row, r) =>
              row.map((cell, c) => {
                const spec = SPECIAL_CELLS[`${r},${c}`];
                const isPlacedNow = placedThisTurn.some(p => p.r === r && p.c === c);

                let cellBg = 'bg-[#0E1F36] hover:bg-[#1E3E62]/80';
                if (spec === '3E') cellBg = 'bg-rose-950/70 border border-rose-800/40 hover:bg-rose-900/60';
                if (spec === '2E') cellBg = 'bg-amber-950/70 border border-amber-800/40 hover:bg-amber-900/60';
                if (spec === '3P') cellBg = 'bg-blue-950/70 border border-blue-800/40 hover:bg-blue-900/60';
                if (spec === '2P') cellBg = 'bg-cyan-950/70 border border-cyan-800/40 hover:bg-cyan-900/60';
                if (spec === '★') cellBg = 'bg-amber-900/50 border border-amber-500/50 hover:bg-amber-800/60';

                return (
                  <div
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    className={`relative rounded-md flex flex-col items-center justify-center cursor-pointer transition-all select-none ${cellBg} ${
                      isPlacedNow ? 'ring-2 ring-emerald-400 ring-offset-1 ring-offset-[#0B192C]' : ''
                    }`}
                  >
                    {cell ? (
                      <div className={`w-full h-full rounded-md flex flex-col items-center justify-center shadow-md ${
                        cell.isPermanent ? 'bg-gradient-to-br from-amber-100 to-amber-200 text-slate-950 font-black' : 'bg-emerald-400 text-slate-950 font-black'
                      }`}>
                        <span className="text-[10px] sm:text-xs leading-none">{cell.value}</span>
                        <span className="text-[6px] text-slate-700 leading-none mt-0.5">
                          {TILE_SCORES[cell.value] || 2}
                        </span>
                      </div>
                    ) : (
                      getCellBadge(r, c)
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* DUAL RACKS (แท่นวางเบี้ยคู่ P1 & P2 บนหน้าจอเดียวกัน) */}
          <div className="w-full max-w-2xl mt-6 space-y-3">
            {/* Player 1 Rack (ฝ่ายฟ้า) */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              currentTurn === 'p1'
                ? 'bg-[#1E3E62] border-cyan-400 shadow-xl shadow-cyan-500/20 ring-2 ring-cyan-400/40'
                : 'bg-[#0B192C]/70 border-white/10 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <span>🧑‍🎓 แท่นเบี้ยผู้เล่นที่ 1 (ฝ่ายฟ้า):</span>
                  {currentTurn === 'p1' && (
                    <span className="px-2 py-0.5 rounded-md bg-cyan-400/20 text-cyan-300 border border-cyan-400/30 text-[10px] font-bold animate-pulse">
                      👉 ถึงตาของคุณแล้ว
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">เบี้ยคงเหลือ: {rackP1.length}/8 ตัว</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {rackP1.map((tile, idx) => {
                  const isHidden = privacyMode && currentTurn !== 'p1';
                  const isSelected = currentTurn === 'p1' && selectedRackIdx === idx;

                  return (
                    <button
                      key={idx}
                      disabled={gameStatus !== 'in_game' || currentTurn !== 'p1'}
                      onClick={() => setSelectedRackIdx(selectedRackIdx === idx ? null : idx)}
                      className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl flex flex-col items-center justify-center font-black transition-all shadow-md select-none disabled:opacity-50 ${
                        isSelected
                          ? 'bg-[#008DDA] text-white ring-2 ring-white -translate-y-2 shadow-cyan-500/40'
                          : isHidden
                          ? 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                          : 'bg-gradient-to-b from-amber-100 to-amber-200 text-slate-950 hover:bg-amber-300 active:scale-95'
                      }`}
                    >
                      {isHidden ? (
                        <span className="text-xs text-slate-500">?</span>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm leading-none">{tile}</span>
                          <span className="text-[7px] text-slate-700 leading-none mt-0.5">
                            {TILE_SCORES[tile] || 2}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Player 2 Rack (ฝ่ายแดง) */}
            <div className={`p-3.5 rounded-2xl border transition-all ${
              currentTurn === 'p2'
                ? 'bg-[#1E3E62] border-amber-400 shadow-xl shadow-amber-500/20 ring-2 ring-amber-400/40'
                : 'bg-[#0B192C]/70 border-white/10 opacity-70'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <span>🧑‍🎓 แท่นเบี้ยผู้เล่นที่ 2 (ฝ่ายแดง):</span>
                  {currentTurn === 'p2' && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/30 text-[10px] font-bold animate-pulse">
                      👉 ถึงตาของคุณแล้ว
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">เบี้ยคงเหลือ: {rackP2.length}/8 ตัว</span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {rackP2.map((tile, idx) => {
                  const isHidden = privacyMode && currentTurn !== 'p2';
                  const isSelected = currentTurn === 'p2' && selectedRackIdx === idx;

                  return (
                    <button
                      key={idx}
                      disabled={gameStatus !== 'in_game' || currentTurn !== 'p2'}
                      onClick={() => setSelectedRackIdx(selectedRackIdx === idx ? null : idx)}
                      className={`w-9 h-11 sm:w-11 sm:h-13 rounded-xl flex flex-col items-center justify-center font-black transition-all shadow-md select-none disabled:opacity-50 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 ring-2 ring-white -translate-y-2 shadow-amber-500/40'
                          : isHidden
                          ? 'bg-slate-800 text-slate-500 border border-white/10 cursor-not-allowed'
                          : 'bg-gradient-to-b from-amber-100 to-amber-200 text-slate-950 hover:bg-amber-300 active:scale-95'
                      }`}
                    >
                      {isHidden ? (
                        <span className="text-xs text-slate-500">?</span>
                      ) : (
                        <>
                          <span className="text-xs sm:text-sm leading-none">{tile}</span>
                          <span className="text-[7px] text-slate-700 leading-none mt-0.5">
                            {TILE_SCORES[tile] || 2}
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Action Toolbar on Same Screen */}
          <div className="w-full max-w-2xl mt-4 grid grid-cols-2 sm:grid-cols-5 gap-2">
            <button
              onClick={handleSubmitTurn}
              disabled={isSubmitting || placedThisTurn.length === 0 || gameStatus !== 'in_game'}
              className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" /> ส่งสมการ (Submit)
            </button>

            <button
              onClick={handleRecall}
              disabled={placedThisTurn.length === 0 || gameStatus !== 'in_game'}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1 transition-all"
              title="ดึงเบี้ยที่วางในตานี้กลับเข้าแท่น"
            >
              <Undo2 className="w-3.5 h-3.5" /> ดึงเบี้ยคืน
            </button>

            <button
              onClick={handlePassTurn}
              disabled={gameStatus !== 'in_game'}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> ข้ามตา (Pass)
            </button>

            <button
              onClick={handleExchange}
              disabled={placedThisTurn.length > 0 || gameStatus !== 'in_game'}
              className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> เปลี่ยนเบี้ย (Exchange)
            </button>

            <button
              onClick={handleChallenge}
              disabled={gameStatus !== 'in_game'}
              className="col-span-2 sm:col-span-1 px-3.5 py-2.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-rose-600/20"
              title="ชักเค้า: ประท้วงสมการก่อนหน้าของฝ่ายตรงข้าม หากผิดจริงจะถูกตัดแต้ม"
            >
              <ShieldAlert className="w-4 h-4" /> ชักเค้า (Challenge)
            </button>
          </div>

        </div>

        {/* Right column: Move History & Multipliers Legend */}
        <div className="space-y-4">
          <div className="bg-[#1E3E62]/50 border border-white/10 rounded-2xl p-4 text-xs space-y-2.5">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" /> ช่องคะแนนพิเศษ (15x15)
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-300 font-bold">
                <span className="w-5 h-5 rounded bg-rose-900 flex items-center justify-center text-[10px]">3E</span>
                คูณ 3 ทั้งสมการ
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-300 font-bold">
                <span className="w-5 h-5 rounded bg-amber-900 flex items-center justify-center text-[10px]">2E</span>
                คูณ 2 ทั้งสมการ
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 font-bold">
                <span className="w-5 h-5 rounded bg-blue-900 flex items-center justify-center text-[10px]">3P</span>
                คูณ 3 เบี้ยตัวนั้น
              </div>
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-300 font-bold">
                <span className="w-5 h-5 rounded bg-cyan-900 flex items-center justify-center text-[10px]">2P</span>
                คูณ 2 เบี้ยตัวนั้น
              </div>
            </div>
          </div>

          <div className="bg-[#1E3E62]/50 border border-white/10 rounded-2xl p-4 text-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Trophy className="w-4 h-4 text-amber-400" /> ประวัติสมการในแมตช์
              </span>
              <span className="text-[10px] text-slate-400">ในกอง: {tilePool.length} ตัว</span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
              {history.map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#0B192C]/80 border border-white/5 flex items-center justify-between">
                  <div>
                    <div className="font-mono font-bold text-amber-300 text-sm">{item.eq}</div>
                    <div className="text-[10px] text-slate-400">{item.player}</div>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 font-mono font-bold text-xs">
                      +{item.pts} แต้ม
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={resetGame}
            className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-2 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" /> รีเซ็ตกระดานใหม่
          </button>
        </div>
      </div>

      <MatchResultModal
        isOpen={isMatchOver}
        onClose={() => setIsMatchOver(false)}
        onPlayAgain={resetGame}
        result={matchWinner === 'p1' ? 'win' : matchWinner === 'p2' ? 'win' : 'draw'}
        winnerName={matchWinner === 'p1' ? 'ผู้เล่น 1 (ฝ่ายฟ้า)' : matchWinner === 'p2' ? 'ผู้เล่น 2 (ฝ่ายแดง)' : 'เสมอกัน'}
        p1Name="ผู้เล่น 1 (ฝ่ายฟ้า)"
        p2Name="ผู้เล่น 2 (ฝ่ายแดง)"
        p1Score={scoreP1}
        p2Score={scoreP2}
        gameTitle="เอแมท (Standard 15x15 A-Math)"
        elapsedTime="จบการแข่งขัน"
        details={`ผู้เล่น 1: ${scoreP1} แต้ม | ผู้เล่น 2: ${scoreP2} แต้ม`}
      />
    </div>
  );
}
