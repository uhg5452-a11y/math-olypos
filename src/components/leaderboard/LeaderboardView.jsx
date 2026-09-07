import React, { useState } from 'react';
import { Trophy, Medal, Search, Flame, Award, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export default function LeaderboardView() {
  const { leaderboard } = useGame();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = leaderboard.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E3E62]/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" /> ตารางอันดับเกียรติยศ
          </div>
          <h2 className="text-2xl font-black text-white">
            ทำเนียบแชมป์ <span className="text-amber-400 glow-gold">Olympiad Leaderboard</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            คะแนนสะสม Elo Rating และสถิติชัยชนะจากการแข่งขันทุกรอบอย่างเป็นทางการ
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสนักเรียน, โรงเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B192C] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#008DDA]"
          />
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboard.slice(0, 3).map((player, idx) => {
          const medals = ['🥇 อันดับ 1 (Gold)', '🥈 อันดับ 2 (Silver)', '🥉 อันดับ 3 (Bronze)'];
          const borders = ['border-amber-400/50 box-glow-gold', 'border-slate-300/40', 'border-amber-700/40'];
          const bgs = ['from-amber-950/40 to-[#0B192C]', 'from-slate-800/40 to-[#0B192C]', 'from-amber-950/20 to-[#0B192C]'];

          return (
            <div
              key={player.studentId}
              className={`p-6 rounded-3xl border bg-gradient-to-b ${bgs[idx]} ${borders[idx]} backdrop-blur-md text-center flex flex-col items-center justify-between relative overflow-hidden`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-amber-300 mb-2">
                {medals[idx]}
              </div>

              <div className="w-16 h-16 rounded-full bg-[#1E3E62] border-2 border-white/20 flex items-center justify-center text-3xl shadow-lg my-2">
                {idx === 0 ? '👑' : idx === 1 ? '🥈' : '🥉'}
              </div>

              <div className="mb-3">
                <h3 className="text-lg font-black text-white">{player.name}</h3>
                <div className="text-xs text-slate-400">{player.school}</div>
                <div className="text-[11px] font-mono text-[#008DDA] mt-0.5">{player.studentId}</div>
              </div>

              <div className="w-full pt-3 border-t border-white/10 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">Elo Rating</div>
                  <div className="text-base font-black text-amber-400">{player.elo}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">คะแนนรวม</div>
                  <div className="text-base font-black text-white">{player.points}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 uppercase">สถิติ (W-D-L)</div>
                  <div className="text-xs font-bold text-slate-300 mt-0.5">{player.wins}-{player.draws}-{player.losses}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Leaderboard Table */}
      <div className="bg-[#1E3E62]/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B192C]/90 text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">อันดับ (Rank)</th>
                <th className="py-4 px-6">นักเรียน (Competitor)</th>
                <th className="py-4 px-6">โรงเรียน (School)</th>
                <th className="py-4 px-6 text-center">ฉายา (Badge)</th>
                <th className="py-4 px-6 text-center">Elo</th>
                <th className="py-4 px-6 text-center">ชนะ / เสมอ / แพ้</th>
                <th className="py-4 px-6 text-right">คะแนนรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.studentId} className="hover:bg-white/5 transition-colors">
                  <td className="py-4 px-6 font-mono font-bold text-sm">
                    {p.rank === 1 ? '🥇 1' : p.rank === 2 ? '🥈 2' : p.rank === 3 ? '🥉 3' : `#${p.rank}`}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{p.name}</div>
                    <div className="text-[11px] font-mono text-[#008DDA]">{p.studentId}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-medium">
                    {p.school}
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold">
                      {p.badge}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center font-mono font-bold text-amber-400">
                    {p.elo}
                  </td>
                  <td className="py-4 px-6 text-center font-mono text-slate-300">
                    <span className="text-emerald-400 font-bold">{p.wins}</span> - {p.draws} - <span className="text-rose-400">{p.losses}</span>
                  </td>
                  <td className="py-4 px-6 text-right font-mono font-black text-sm text-[#008DDA]">
                    {p.points.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
