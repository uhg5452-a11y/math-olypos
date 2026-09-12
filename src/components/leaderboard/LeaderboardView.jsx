import React, { useState } from 'react';
import { Trophy, Medal, Search, Flame, Award, Sparkles, Crown, Star } from 'lucide-react';
import { useGame } from '../../context/GameContext';

export default function LeaderboardView() {
  const { leaderboard } = useGame();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = leaderboard.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.school.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const top1 = leaderboard.find(item => item.rank === 1) || leaderboard[0];
  const top2 = leaderboard.find(item => item.rank === 2) || leaderboard[1];
  const top3 = leaderboard.find(item => item.rank === 3) || leaderboard[2];

  return (
    <div className="space-y-10 animate-fade-in pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#1E3E62]/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" /> ทำเนียบแชมป์และตารางอันดับ
          </div>
          <h2 className="text-2xl font-black text-white">
            ทำเนียบเกียรติยศ <span className="text-amber-400 glow-gold">Olympiad Podium</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            คะแนนสะสม Elo Rating และสถิติการแข่งขันคณิตศาสตร์ โรงเรียนบรรหารแจ่มใสวิทยา 3
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="ค้นหาชื่อ, รหัสนักเรียน, ห้อง..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B192C] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#008DDA]"
          />
        </div>
      </div>

      {/* Empty State when no students have ranked yet */}
      {leaderboard.length === 0 ? (
        <div className="text-center py-16 bg-[#1E3E62]/30 rounded-3xl border border-dashed border-white/10 p-8 animate-fade-in">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white">ยังไม่มีรายชื่อนักเรียนบนทำเนียบอันดับ</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            ระบบเปิดสำหรับนักเรียนโรงเรียนบรรหารแจ่มใสวิทยา 3 ทุกคน ลงทะเบียนและเข้าร่วมการแข่งขันหรือฝึกซ้อมเพื่อสะสมคะแนนและขึ้นสู่แท่นเกียรติยศ
          </p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM DESIGN (Requirement 4: Rank 1 in Center) */}
          <div className="relative pt-6 pb-2">
            <div className="flex flex-col md:flex-row items-end justify-center gap-4 lg:gap-6 max-w-4xl mx-auto">
          
          {/* PODIUM 2: RANK 2 (SILVER) - LEFT */}
          {top2 && (
            <div className="w-full md:w-1/3 flex flex-col items-center order-2 md:order-1">
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-400 text-slate-900 border-2 border-slate-300 shadow-xl flex items-center justify-center text-3xl">
                  🥈
                </div>
                <span className="mt-1 px-3 py-0.5 rounded-full bg-slate-300/20 text-slate-200 text-[11px] font-black border border-slate-300/30">
                  อันดับ 2 (Silver)
                </span>
              </div>

              {/* Player Card & Podium Pillar */}
              <div className="w-full bg-gradient-to-b from-slate-800/80 to-[#0B192C] border border-slate-400/40 rounded-3xl p-5 text-center shadow-xl backdrop-blur-md h-[260px] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white truncate">{top2.name}</h3>
                  <div className="text-xs text-slate-300 truncate">{top2.school}</div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{top2.studentId}</div>
                </div>

                <div className="my-2 py-2 border-y border-white/10">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Elo Rating</div>
                  <div className="text-xl font-black text-slate-200">{top2.elo}</div>
                </div>

                <div className="flex items-center justify-around text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">ชนะ</div>
                    <div className="font-bold text-emerald-400">{top2.wins}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">คะแนน</div>
                    <div className="font-black text-white">{top2.points}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PODIUM 1: RANK 1 (GOLD CHAMPION) - CENTER (ELEVATED & SPECIAL GLOW) */}
          {top1 && (
            <div className="w-full md:w-5/12 flex flex-col items-center order-1 md:order-2 md:-mt-8 z-10">
              {/* Crown & Gold Aura Badge */}
              <div className="relative mb-3 flex flex-col items-center">
                <div className="absolute -top-6 text-amber-300 text-3xl animate-bounce">
                  👑
                </div>
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-yellow-600 text-slate-950 border-4 border-yellow-200 shadow-2xl ring-4 ring-amber-400/60 box-glow-gold flex items-center justify-center text-4xl mt-2">
                  🥇
                </div>
                <span className="mt-2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/30 flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" /> แชมป์อันดับ 1 (Gold)
                </span>
              </div>

              {/* Champion Pillar: Elevated Height & Glowing Border */}
              <div className="w-full bg-gradient-to-b from-amber-950/60 via-[#1E3E62]/80 to-[#0B192C] border-2 border-amber-400/80 rounded-3xl p-6 text-center shadow-2xl backdrop-blur-xl h-[320px] flex flex-col justify-between box-glow-gold relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-amber-500/5 to-amber-400/10 pointer-events-none" />

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber-300 mb-1">
                    CHAMPION OF BANHARN 3
                  </div>
                  <h3 className="text-xl font-black text-white drop-shadow truncate">{top1.name}</h3>
                  <div className="text-xs text-amber-200/90 truncate">{top1.school}</div>
                  <div className="text-xs font-mono text-cyan-300 font-bold mt-0.5">{top1.studentId}</div>
                </div>

                <div className="my-3 py-3 border-y border-amber-400/30 bg-amber-500/10 rounded-2xl">
                  <div className="text-[10px] uppercase text-amber-300 font-bold tracking-wider">Olympiad Elo Rating</div>
                  <div className="text-3xl font-black text-amber-400 glow-gold">{top1.elo}</div>
                </div>

                <div className="flex items-center justify-around text-xs pt-1">
                  <div>
                    <div className="text-[10px] text-slate-400">ชนะ</div>
                    <div className="font-bold text-emerald-400 text-sm">{top1.wins} แมตช์</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">คะแนนสะสม</div>
                    <div className="font-black text-amber-300 text-base">{top1.points.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PODIUM 3: RANK 3 (BRONZE) - RIGHT */}
          {top3 && (
            <div className="w-full md:w-1/3 flex flex-col items-center order-3 md:order-3">
              <div className="relative mb-3 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-700 to-yellow-900 text-amber-100 border-2 border-amber-600 shadow-xl flex items-center justify-center text-3xl">
                  🥉
                </div>
                <span className="mt-1 px-3 py-0.5 rounded-full bg-amber-800/30 text-amber-300 text-[11px] font-black border border-amber-700/40">
                  อันดับ 3 (Bronze)
                </span>
              </div>

              {/* Player Card & Podium Pillar */}
              <div className="w-full bg-gradient-to-b from-amber-950/40 to-[#0B192C] border border-amber-700/40 rounded-3xl p-5 text-center shadow-xl backdrop-blur-md h-[240px] flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-black text-white truncate">{top3.name}</h3>
                  <div className="text-xs text-slate-300 truncate">{top3.school}</div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-0.5">{top3.studentId}</div>
                </div>

                <div className="my-2 py-2 border-y border-white/10">
                  <div className="text-[10px] uppercase text-slate-400 font-semibold">Elo Rating</div>
                  <div className="text-xl font-black text-amber-500">{top3.elo}</div>
                </div>

                <div className="flex items-center justify-around text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">ชนะ</div>
                    <div className="font-bold text-emerald-400">{top3.wins}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">คะแนน</div>
                    <div className="font-black text-white">{top3.points}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Leaderboard Table (All ranks) */}
      <div className="bg-[#1E3E62]/40 rounded-3xl border border-white/10 overflow-hidden backdrop-blur-md">
        <div className="p-4 border-b border-white/10 bg-[#0B192C]/60 flex items-center justify-between">
          <div className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-[#008DDA]" /> รายชื่อตารางคะแนนรวมทั้งหมด
          </div>
          <span className="text-xs text-slate-400 font-mono">ทั้งหมด {filtered.length} คน</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0B192C]/90 text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-4 px-6">อันดับ (Rank)</th>
                <th className="py-4 px-6">นักเรียน (Competitor)</th>
                <th className="py-4 px-6">โรงเรียน / ชั้น (Class)</th>
                <th className="py-4 px-6 text-center">ฉายา (Badge)</th>
                <th className="py-4 px-6 text-center">Elo</th>
                <th className="py-4 px-6 text-center">ชนะ / เสมอ / แพ้</th>
                <th className="py-4 px-6 text-right">คะแนนรวม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr
                  key={p.studentId}
                  className={`hover:bg-white/5 transition-colors ${
                    p.rank === 1 ? 'bg-amber-500/10 font-bold' : ''
                  }`}
                >
                  <td className="py-4 px-6 font-mono font-bold text-sm">
                    {p.rank === 1 ? '🥇 1' : p.rank === 2 ? '🥈 2' : p.rank === 3 ? '🥉 3' : `#${p.rank}`}
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm flex items-center gap-1.5">
                      {p.name}
                      {p.rank === 1 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
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
        </>
      )}
    </div>
  );
}
