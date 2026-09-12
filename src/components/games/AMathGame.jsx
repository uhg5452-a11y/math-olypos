import React, { useState, useEffect } from 'react';
import { 
  Trophy, Clock, RotateCcw, CheckCircle2,
  Sparkles, RefreshCw, Radio, Copy, Check, 
  ShieldAlert, Undo2, Users, Bot
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGame } from '../../context/GameContext';
import { useAuth } from '../../context/AuthContext';
import { realtimeService } from '../../services/realtimeService';
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

export default function AMathGame() {
  const { recordGameResult } = useGame();
  const { currentUser } = useAuth();

  // Mode: 'pass_play', 'realtime_2p'
  const [gameMode, setGameMode] = useState('pass_play');
  const [roomId, setRoomId] = useState('AM-202');
  const [myRole, setMyRole] = useState('p1'); // 'p1' or 'p2'
  const [copiedLink, setCopiedLink] = useState(false);

  // Board: 15x15 cells. Each cell: null or { value: string, isPermanent: boolean }
  const [board, setBoard] = useState(() => {
    const b = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    // Pre-place starter center equation on row 7 (index 7)
    b[7][5] = { value: '8', isPermanent: true };
    b[7][6] = { value: '+', isPermanent: true };
    b[7][7] = { value: '7', isPermanent: true }; // Center star
    b[7][8] = { value: '=', isPermanent: true };
    b[7][9] = { value: '15', isPermanent: true };
    return b;
  });

  // Player state
  const [tilePool, setTilePool] = useState(() => generateTilePool());
  const [rackP1, setRackP1] = useState(['9', '×', '3', '=', '27', '+', '4', '12']);
  const [rackP2, setRackP2] = useState(['16', '÷', '4', '=', '4', '6', '-', '2']);
  const [currentTurn, setCurrentTurn] = useState('p1'); // 'p1' or 'p2'
  const [scoreP1, setScoreP1] = useState(15);
  const [scoreP2, setScoreP2] = useState(0);

  // Selected tile from rack (index)
  const [selectedRackIdx, setSelectedRackIdx] = useState(null);
  const [placedThisTurn, setPlacedThisTurn] = useState([]); // Array of { r, c, value, rackIdx }

  // Status & Anti-Exploit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState('ตาของผู้เล่น 1: เลือกเบี้ยบนแท่นวางแล้วคลิกวางลงบนกระดาน 15x15');
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes per turn
  const [isPaused, setIsPaused] = useState(false);
  const [isMatchOver, setIsMatchOver] = useState(false);
  const [matchWinner, setMatchWinner] = useState(null);
  const [history, setHistory] = useState([
    { eq: '8 + 7 = 15', pts: 15, player: 'System (Starter)' }
  ]);

  // Check URL params for auto-joining room
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    const roleParam = params.get('role');
    if (roomParam) {
      setRoomId(roomParam);
      setGameMode('realtime_2p');
      if (roleParam === 'p2') setMyRole('p2');
      else setMyRole('p1');
    }
  }, []);

  // Timer per turn
  useEffect(() => {
    if (isMatchOver || isPaused) return;
    if (timeLeft <= 0) {
      handlePassTurn();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isMatchOver, isPaused, currentTurn]);

  // Real-time synchronization
  useEffect(() => {
    if (gameMode !== 'realtime_2p') return;

    realtimeService.joinRoom(roomId, myRole === 'p1' ? 'player1' : 'player2');

    const unsubTurn = realtimeService.subscribe(roomId, 'amath_turn', (payload) => {
      if (payload.board) setBoard(payload.board);
      if (payload.currentTurn) setCurrentTurn(payload.currentTurn);
      if (payload.scoreP1 !== undefined) setScoreP1(payload.scoreP1);
      if (payload.scoreP2 !== undefined) setScoreP2(payload.scoreP2);
      if (payload.history) setHistory(payload.history);
      if (payload.statusMessage) setStatusMessage(payload.statusMessage);
      setTimeLeft(120);
    });

    const unsubControl = realtimeService.subscribe(roomId, 'match_control', (payload) => {
      if (payload.action === 'pause') {
        setIsPaused(true);
        setStatusMessage('⏸️ กรรมการผู้ตัดสินสั่งพักการแข่งขันชั่วคราว');
      } else if (payload.action === 'resume') {
        setIsPaused(false);
        setStatusMessage('▶️ กรรมการสั่งเริ่มการแข่งขันต่อ');
      } else if (payload.action === 'cancel') {
        alert('กรรมการได้ทำการยกเลิกหรือรีเซ็ตห้องแข่งขันนี้');
        resetGame();
      } else if (payload.action === 'force_start') {
        setIsPaused(false);
        setTimeLeft(120);
      }
    });

    return () => {
      unsubTurn();
      unsubControl();
      realtimeService.leaveRoom(roomId);
    };
  }, [gameMode, roomId, myRole]);

  const activeRack = currentTurn === 'p1' ? rackP1 : rackP2;
  const setActiveRack = currentTurn === 'p1' ? setRackP1 : setRackP2;
  const isMyTurn = gameMode !== 'realtime_2p' || myRole === currentTurn;

  // Handle cell click on 15x15 board
  const handleCellClick = (r, c) => {
    if (isMatchOver || isPaused || !isMyTurn) return;

    const cell = board[r][c];

    // Case 1: Place selected tile from rack
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

  // Action: Recall uncommitted tiles back to rack
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
    setTimeLeft(120);
    const msg = `ผู้เล่น ${currentTurn === 'p1' ? '1' : '2'} ขอข้ามเทิร์น -> ตาของผู้เล่น ${nextTurn === 'p1' ? '1' : '2'}`;
    setStatusMessage(msg);

    if (gameMode === 'realtime_2p') {
      realtimeService.sendEvent(roomId, 'amath_turn', {
        board,
        currentTurn: nextTurn,
        scoreP1,
        scoreP2,
        history,
        statusMessage: msg
      });
    }
  };

  // Action: Exchange Tiles
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

    setActiveRack([...remaining, ...drawn]);
    setTilePool(newPool);

    handlePassTurn();
    setStatusMessage(`เปลี่ยนเบี้ย ${exchangeCount} ตัวและส่งต่อเทิร์น`);
  };

  // Action: Challenge Opponent's previous move
  const handleChallenge = () => {
    if (history.length <= 1) {
      setStatusMessage('ยังไม่มีสมการของคู่ต่อสู้ให้ประท้วง');
      return;
    }
    setStatusMessage('🚨 ส่งคำขอประท้วงสมการไปยังกรรมการ (Arbiter)');
    realtimeService.sendEvent(roomId, 'system_sync', {
      type: 'amath_dispute',
      roomId,
      challenger: currentTurn,
      history
    });
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

  // Action: Submit / Play Equation
  const handleSubmitTurn = () => {
    if (isSubmitting || !isMyTurn || placedThisTurn.length === 0) return;
    setIsSubmitting(true);

    const rows = [...new Set(placedThisTurn.map(p => p.r))];
    const cols = [...new Set(placedThisTurn.map(p => p.c))];

    if (rows.length > 1 && cols.length > 1) {
      setStatusMessage('⚠️ การวางเบี้ยต้องอยู่ในแนวเดียวกัน (แนวนอนหรือแนวตั้ง)');
      setIsSubmitting(false);
      return;
    }

    const isHorizontal = rows.length === 1;
    let mainEquation = '';
    let cellMultipliers = 1;
    let turnPoints = 0;

    if (isHorizontal) {
      const r = rows[0];
      let minC = Math.min(...cols);
      let maxC = Math.max(...cols);
      while (minC > 0 && board[r][minC - 1] !== null) minC--;
      while (maxC < BOARD_SIZE - 1 && board[r][maxC + 1] !== null) maxC++;

      const tokens = [];
      for (let c = minC; c <= maxC; c++) {
        const cell = board[r][c];
        if (!cell) break;
        const spec = SPECIAL_CELLS[`${r},${c}`];
        let tilePt = TILE_SCORES[cell.value] || 2;
        if (!cell.isPermanent) {
          if (spec === '2P') tilePt *= 2;
          if (spec === '3P') tilePt *= 3;
          if (spec === '2E' || spec === '★') cellMultipliers *= 2;
          if (spec === '3E') cellMultipliers *= 3;
        }
        turnPoints += tilePt;
        tokens.push(cell.value);
      }
      mainEquation = tokens.join('');
    } else {
      const c = cols[0];
      let minR = Math.min(...rows);
      let maxR = Math.max(...rows);
      while (minR > 0 && board[minR - 1][c] !== null) minR--;
      while (maxR < BOARD_SIZE - 1 && board[maxR + 1][c] !== null) maxR++;

      const tokens = [];
      for (let r = minR; r <= maxR; r++) {
        const cell = board[r][c];
        if (!cell) break;
        const spec = SPECIAL_CELLS[`${r},${c}`];
        let tilePt = TILE_SCORES[cell.value] || 2;
        if (!cell.isPermanent) {
          if (spec === '2P') tilePt *= 2;
          if (spec === '3P') tilePt *= 3;
          if (spec === '2E' || spec === '★') cellMultipliers *= 2;
          if (spec === '3E') cellMultipliers *= 3;
        }
        turnPoints += tilePt;
        tokens.push(cell.value);
      }
      mainEquation = tokens.join('');
    }

    turnPoints *= cellMultipliers;

    // Bingo bonus: used all 8 tiles
    if (placedThisTurn.length >= 8) {
      turnPoints += 40;
    }

    const { valid } = validateEquationString(mainEquation);

    if (!valid) {
      setStatusMessage(`❌ สมการ "${mainEquation}" ไม่ถูกต้องตามหลักคณิตศาสตร์! (ซ้าย ≠ ขวา)`);
      setIsSubmitting(false);
      return;
    }

    // Equation is Valid!
    const newBoard = board.map(row => [...row]);
    placedThisTurn.forEach(({ r, c, value }) => {
      newBoard[r][c] = { value, isPermanent: true };
    });
    setBoard(newBoard);

    const needCount = 8 - activeRack.length;
    const newPool = [...tilePool];
    const drawn = newPool.splice(0, needCount);
    setTilePool(newPool);
    setActiveRack([...activeRack, ...drawn]);

    const newP1Score = currentTurn === 'p1' ? scoreP1 + turnPoints : scoreP1;
    const newP2Score = currentTurn === 'p2' ? scoreP2 + turnPoints : scoreP2;
    if (currentTurn === 'p1') setScoreP1(newP1Score);
    else setScoreP2(newP2Score);

    const historyItem = {
      eq: mainEquation,
      pts: turnPoints,
      player: currentTurn === 'p1' ? 'Player 1' : 'Player 2'
    };
    const nextHistory = [historyItem, ...history];
    setHistory(nextHistory);

    confetti({ particleCount: 40, spread: 60, origin: { y: 0.6 } });
    recordGameResult('a-math', Math.max(newP1Score, newP2Score), { equation: mainEquation });

    const nextTurn = currentTurn === 'p1' ? 'p2' : 'p1';
    setCurrentTurn(nextTurn);
    setPlacedThisTurn([]);
    setSelectedRackIdx(null);
    setTimeLeft(120);
    const successMsg = `🎉 สมการ "${mainEquation}" ถูกต้อง! ได้รับ +${turnPoints} แต้ม -> ตาของผู้เล่น ${nextTurn === 'p1' ? '1' : '2'}`;
    setStatusMessage(successMsg);

    if (gameMode === 'realtime_2p') {
      realtimeService.sendEvent(roomId, 'amath_turn', {
        board: newBoard,
        currentTurn: nextTurn,
        scoreP1: newP1Score,
        scoreP2: newP2Score,
        history: nextHistory,
        statusMessage: successMsg
      });
    }

    setIsSubmitting(false);
  };

  const resetGame = () => {
    const b = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
    b[7][5] = { value: '8', isPermanent: true };
    b[7][6] = { value: '+', isPermanent: true };
    b[7][7] = { value: '7', isPermanent: true };
    b[7][8] = { value: '=', isPermanent: true };
    b[7][9] = { value: '15', isPermanent: true };
    setBoard(b);
    setScoreP1(15);
    setScoreP2(0);
    setTilePool(generateTilePool());
    setRackP1(['9', '×', '3', '=', '27', '+', '4', '12']);
    setRackP2(['16', '÷', '4', '=', '4', '6', '-', '2']);
    setCurrentTurn('p1');
    setPlacedThisTurn([]);
    setSelectedRackIdx(null);
    setTimeLeft(120);
    setIsMatchOver(false);
    setMatchWinner(null);
    setStatusMessage('รีเซ็ตกระดานเริ่มเกมใหม่เรียบร้อยแล้ว');
  };

  const copyDirectRoomLink = () => {
    const directLink = `${window.location.origin}${window.location.pathname}?room=${roomId}&game=a-math&role=p2`;
    navigator.clipboard.writeText(directLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
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
      <div className="bg-[#1E3E62]/60 rounded-3xl p-4 sm:p-6 border border-white/10 backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#008DDA]/20 text-[#008DDA] border border-[#008DDA]/30">
                Standard 15x15 Competition
              </span>
              <span className="text-xs text-slate-300">โรงเรียนบรรหารแจ่มใสวิทยา 3</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
              เอแมท (Standard A-Math 2-Player) 🔤
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex bg-[#0B192C] p-1 rounded-xl border border-white/10 text-xs">
              <button
                onClick={() => setGameMode('pass_play')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  gameMode === 'pass_play' ? 'bg-[#008DDA] text-white' : 'text-slate-400'
                }`}
              >
                ผลัดกันเล่น (Pass & Play)
              </button>
              <button
                onClick={() => setGameMode('realtime_2p')}
                className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 transition-all ${
                  gameMode === 'realtime_2p' ? 'bg-emerald-600 text-white' : 'text-slate-400'
                }`}
              >
                <Radio className="w-3 h-3" /> ออนไลน์ 2 เครื่อง
              </button>
            </div>

            {gameMode === 'realtime_2p' && (
              <button
                onClick={copyDirectRoomLink}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-all"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedLink ? 'คัดลอกลิงก์แล้ว!' : `แชร์ลิงก์ห้อง (${roomId})`}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4 pt-4 border-t border-white/10 items-center text-center">
          <div className={`p-3 rounded-2xl border transition-all ${
            currentTurn === 'p1' ? 'bg-[#008DDA]/20 border-[#008DDA] shadow-lg shadow-blue-500/20' : 'bg-[#0B192C]/60 border-white/5'
          }`}>
            <div className="text-xs font-bold text-slate-300">
              {gameMode === 'realtime_2p' && myRole === 'p1' ? 'คุณ (Player 1)' : 'ผู้เล่น 1 (P1)'}
            </div>
            <div className="text-2xl font-black text-cyan-400 font-mono mt-0.5">{scoreP1}</div>
            <div className="text-[10px] text-slate-400">เบี้ยบนแท่น: {rackP1.length} ตัว</div>
          </div>

          <div className="bg-[#0B192C]/80 p-3 rounded-2xl border border-white/10">
            <div className="text-[10px] text-slate-400 uppercase font-bold">เวลาประจำเทิร์น</div>
            <div className={`text-2xl font-black font-mono mt-0.5 flex items-center justify-center gap-1.5 ${
              timeLeft <= 20 ? 'text-rose-400 animate-pulse' : 'text-white'
            }`}>
              <Clock className="w-4 h-4 text-amber-400" /> {formatTimer(timeLeft)}
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">
              ตาของ: {currentTurn === 'p1' ? 'ผู้เล่น 1' : 'ผู้เล่น 2'}
            </div>
          </div>

          <div className={`p-3 rounded-2xl border transition-all ${
            currentTurn === 'p2' ? 'bg-amber-500/20 border-amber-400 shadow-lg shadow-amber-500/20' : 'bg-[#0B192C]/60 border-white/5'
          }`}>
            <div className="text-xs font-bold text-slate-300">
              {gameMode === 'realtime_2p' && myRole === 'p2' ? 'คุณ (Player 2)' : 'ผู้เล่น 2 (P2)'}
            </div>
            <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">{scoreP2}</div>
            <div className="text-[10px] text-slate-400">เบี้ยบนแท่น: {rackP2.length} ตัว</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-[#0B192C]/90 rounded-3xl p-3 sm:p-6 border border-white/10 shadow-2xl flex flex-col items-center">
          
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

          {/* 15x15 Grid with CSS Grid */}
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

          {/* Rack */}
          <div className="w-full max-w-xl mt-6 p-4 rounded-2xl bg-[#1E3E62]/70 border border-white/10 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-300">
                แท่นวางเบี้ย ({currentTurn === 'p1' ? 'P1' : 'P2'}):
              </span>
              <div className="flex items-center gap-1.5">
                {activeRack.map((tile, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedRackIdx(selectedRackIdx === idx ? null : idx)}
                    className={`w-8 h-10 sm:w-10 sm:h-12 rounded-xl flex flex-col items-center justify-center font-black transition-all shadow-md active:scale-95 select-none ${
                      selectedRackIdx === idx
                        ? 'bg-[#008DDA] text-white ring-2 ring-white -translate-y-1.5 shadow-blue-500/40'
                        : 'bg-gradient-to-b from-amber-100 to-amber-200 text-slate-950 hover:bg-amber-300'
                    }`}
                  >
                    <span className="text-xs sm:text-sm leading-none">{tile}</span>
                    <span className="text-[7px] text-slate-700 leading-none mt-0.5">
                      {TILE_SCORES[tile] || 2}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleRecall}
                disabled={placedThisTurn.length === 0}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 text-white text-xs font-bold flex items-center gap-1 transition-all"
                title="ดึงเบี้ยที่วางในตานี้กลับเข้าแท่น"
              >
                <Undo2 className="w-3.5 h-3.5" /> ดึงกลับ
              </button>
            </div>
          </div>

          <div className="w-full max-w-xl mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <button
              onClick={handleSubmitTurn}
              disabled={isSubmitting || placedThisTurn.length === 0 || !isMyTurn}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-40 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            >
              <CheckCircle2 className="w-4 h-4" /> ส่งสมการ (Play)
            </button>

            <button
              onClick={handlePassTurn}
              disabled={!isMyTurn}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> ข้ามเทิร์น (Pass)
            </button>

            <button
              onClick={handleExchange}
              disabled={!isMyTurn || placedThisTurn.length > 0}
              className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <RefreshCw className="w-4 h-4" /> เปลี่ยนเบี้ย
            </button>

            <button
              onClick={handleChallenge}
              disabled={!isMyTurn}
              className="px-4 py-3 rounded-xl bg-rose-600/80 hover:bg-rose-500 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldAlert className="w-4 h-4" /> ท้าทาย
            </button>
          </div>

        </div>

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
        result={matchWinner === myRole ? 'win' : 'loss'}
        winnerName={matchWinner === 'p1' ? 'ผู้เล่น 1 (Player 1)' : 'ผู้เล่น 2 (Player 2)'}
        p1Name="Player 1"
        p2Name="Player 2"
        p1Score={scoreP1}
        p2Score={scoreP2}
        gameTitle="เอแมท (Standard 15x15 A-Math)"
        elapsedTime="จบการแข่งขัน"
      />
    </div>
  );
}
