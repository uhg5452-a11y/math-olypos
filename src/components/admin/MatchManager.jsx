import React, { useState } from 'react';
import { Users, CheckCircle2, Shield, Settings, Sliders, Trophy, AlertCircle, PlayCircle, XCircle } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useGame } from '../../context/GameContext';
import Modal from '../common/Modal';

export default function MatchManager() {
  const { tournaments, recordMatchResult, updateTournament } = useTournament();
  const { updatePlayerScore } = useGame();

  const [selectedTourneyId, setSelectedTourneyId] = useState(tournaments[0]?.id || '');
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  // Result form
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [outcome, setOutcome] = useState('p1'); // 'p1', 'p2', 'draw'

  // Game Settings form
  const [turnTime, setTurnTime] = useState(25);
  const [difficultySetting, setDifficultySetting] = useState('standard');

  const currentTourney = tournaments.find(t => t.id === selectedTourneyId) || tournaments[0];
  const matches = currentTourney?.matches || [];

  const handleOpenRecordModal = (match) => {
    setSelectedMatch(match);
    setScore1(match.player1.score || 0);
    setScore2(match.player2.score || 0);
    setOutcome(match.winner === match.player1.id ? 'p1' : match.winner === match.player2.id ? 'p2' : 'draw');
    setIsResultModalOpen(true);
  };

  const handleSaveResult = (e) => {
    e.preventDefault();
    if (!selectedMatch) return;

    let winnerId = null;
    let p1Wins = 0, p1Elo = 0;
    let p2Wins = 0, p2Elo = 0;

    if (outcome === 'p1') {
      winnerId = selectedMatch.player1.id;
      p1Wins = 1;
      p1Elo = 25;
      p2Elo = -15;
    } else if (outcome === 'p2') {
      winnerId = selectedMatch.player2.id;
      p2Wins = 1;
      p2Elo = 25;
      p1Elo = -15;
    } else {
      winnerId = 'draw';
      p1Elo = 5;
      p2Elo = 5;
    }

    recordMatchResult(selectedTourneyId, selectedMatch.matchId, Number(score1), Number(score2), winnerId, 'closed');

    // Update Leaderboard scores
    updatePlayerScore(selectedMatch.player1.id, Number(score1), p1Wins, p1Elo);
    updatePlayerScore(selectedMatch.player2.id, Number(score2), p2Wins, p2Elo);

    setIsResultModalOpen(false);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    // Update tournament description or rules with new settings
    const updated = {
      ...currentTourney,
      rules: [
        `เวลาคิดต่อฝ่าย: ${turnTime} นาที`,
        `ระดับความยากการแข่งขัน: ${difficultySetting}`,
        ...currentTourney.rules.slice(2)
      ]
    };
    updateTournament(updated);
    setIsSettingsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Tourney Select */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-[#008DDA]" /> จัดการห้องแข่งขันและบันทึกผล (Match Room Monitor)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ตรวจสอบสถานะห้องแข่งขัน บันทึกผล ชนะ/แพ้/เสมอ และปรับแต่งการตั้งค่ากติกา
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedTourneyId}
            onChange={(e) => setSelectedTourneyId(e.target.value)}
            className="bg-[#1E3E62] border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#008DDA]"
          >
            {tournaments.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title} ({t.roundName})
              </option>
            ))}
          </select>

          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
            title="ปรับแต่งกติกาเกม"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Match Rooms Grid */}
      {matches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m) => (
            <div
              key={m.matchId}
              className="bg-[#0B192C]/90 border border-white/10 rounded-2xl p-5 shadow-xl flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/10 text-slate-300">
                    โต๊ะ {m.tableNo} • รหัส {m.matchId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    m.status === 'finished'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}>
                    {m.status === 'finished' ? 'จบการแข่งขันแล้ว' : 'กำลังดำเนินการ'}
                  </span>
                </div>

                {/* Opponents Matchup */}
                <div className="space-y-2 py-2">
                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    m.winner === m.player1.id ? 'bg-emerald-950/40 border-emerald-500/40 font-bold text-emerald-300' : 'bg-white/5 border-white/5 text-slate-200'
                  }`}>
                    <div className="text-xs">
                      <div>{m.player1.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.player1.id}</div>
                    </div>
                    <div className="text-base font-black font-mono">
                      {m.player1.score !== null ? m.player1.score : '-'}
                    </div>
                  </div>

                  <div className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    m.winner === m.player2.id ? 'bg-emerald-950/40 border-emerald-500/40 font-bold text-emerald-300' : 'bg-white/5 border-white/5 text-slate-200'
                  }`}>
                    <div className="text-xs">
                      <div>{m.player2.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{m.player2.id}</div>
                    </div>
                    <div className="text-base font-black font-mono">
                      {m.player2.score !== null ? m.player2.score : '-'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  ห้องแข่ง: <span className="font-semibold text-white">{m.roomStatus || 'ready'}</span>
                </span>

                <button
                  onClick={() => handleOpenRecordModal(m)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition-all"
                >
                  บันทึกผลการแข่ง
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-[#0B192C]/50 rounded-2xl border border-dashed border-white/10 text-slate-400 text-xs">
          ยังไม่มีห้องแข่งขันในรอบนี้ สามารถสลับเลือกรอบแข่งขันด้านบนได้
        </div>
      )}

      {/* Record Match Result Modal */}
      {isResultModalOpen && selectedMatch && (
        <Modal
          isOpen={isResultModalOpen}
          onClose={() => setIsResultModalOpen(false)}
          title={`บันทึกผลการแข่งขัน - โต๊ะ ${selectedMatch.tableNo}`}
        >
          <form onSubmit={handleSaveResult} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-[#0B192C] rounded-xl border border-white/10">
                <label className="block text-slate-300 font-bold mb-1">
                  คะแนน: {selectedMatch.player1.name}
                </label>
                <input
                  type="number"
                  required
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E3E62] border border-slate-700 text-white text-base font-bold font-mono"
                />
              </div>

              <div className="p-3 bg-[#0B192C] rounded-xl border border-white/10">
                <label className="block text-slate-300 font-bold mb-1">
                  คะแนน: {selectedMatch.player2.name}
                </label>
                <input
                  type="number"
                  required
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#1E3E62] border border-slate-700 text-white text-base font-bold font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-2">ระบุผลแพ้ / ชนะ / เสมอ:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setOutcome('p1')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    outcome === 'p1'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  {selectedMatch.player1.name} ชนะ
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('draw')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    outcome === 'draw'
                      ? 'bg-amber-600 text-white border-amber-400 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  เสมอ (Draw)
                </button>

                <button
                  type="button"
                  onClick={() => setOutcome('p2')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    outcome === 'p2'
                      ? 'bg-emerald-600 text-white border-emerald-400 font-bold'
                      : 'bg-white/5 border-white/10 text-slate-300'
                  }`}
                >
                  {selectedMatch.player2.name} ชนะ
                </button>
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsResultModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold"
              >
                ยืนยันและอัปเดตกระดานผู้นำ
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <Modal
          isOpen={isSettingsModalOpen}
          onClose={() => setIsSettingsModalOpen(false)}
          title="ปรับแต่งการตั้งค่ากติกาเกม (Game Rules)"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">เวลาคิดต่อกระดาน (นาที):</label>
              <input
                type="number"
                value={turnTime}
                onChange={(e) => setTurnTime(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ระดับความยากการประลอง:</label>
              <select
                value={difficultySetting}
                onChange={(e) => setDifficultySetting(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
              >
                <option value="standard">มาตรฐานระดับมัธยมศึกษา (Standard)</option>
                <option value="olympiad-hard">ระดับโอลิมปิกวิชาการขั้นสูง (Olympiad Hard)</option>
                <option value="championship">รอบชิงชนะเลิศมาสเตอร์ (Grand Championship)</option>
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#008DDA] text-white font-bold"
              >
                บันทึกการตั้งค่า
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
