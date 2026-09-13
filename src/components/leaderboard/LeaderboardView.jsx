import React, { useState } from 'react';
import { 
  Trophy, Medal, Search, Flame, Award, Sparkles, Crown, Star, 
  ChevronRight, Calendar, UserCheck, Shield, ExternalLink, X, BookOpen
} from 'lucide-react';
import { useGame } from '../../context/GameContext';
import { useTournaments } from '../../context/TournamentContext';
import Modal from '../common/Modal';

export default function LeaderboardView() {
  const { leaderboard } = useGame();
  const { tournaments } = useTournaments();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('all'); // 'all', 'junior', 'senior'
  const [selectedChampion, setSelectedChampion] = useState(null);

  // Helper to determine division from student data or grade
  const getDivision = (item) => {
    if (item.division) return item.division;
    const g = (item.grade || item.school || '').toLowerCase();
    if (g.includes('ม.1') || g.includes('ม.2') || g.includes('ม.3')) return 'junior';
    if (g.includes('ม.4') || g.includes('ม.5') || g.includes('ม.6')) return 'senior';
    return null;
  };

  // Filter leaderboard
  const divisionFiltered = leaderboard.filter(item => {
    if (selectedDivision === 'all') return true;
    const div = getDivision(item);
    return div === selectedDivision;
  });

  const searchFiltered = divisionFiltered.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.school && item.school.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Recalculate ranks for display in current filtered view
  const displayLeaderboard = searchFiltered.map((item, idx) => ({
    ...item,
    currentRank: idx + 1
  }));

  const top1 = displayLeaderboard[0];
  const top2 = displayLeaderboard[1];
  const top3 = displayLeaderboard[2];

  // Hall of Fame: completed tournaments with winners
  const hallOfFameTournaments = tournaments.filter(t => t.winner);

  return (
    <div className="space-y-10 animate-fade-in pb-12">
      {/* Header & Division Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#1E3E62]/40 p-6 rounded-3xl border border-white/10 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Trophy className="w-4 h-4" /> ทำเนียบแชมป์และตารางอันดับโอลิมปิก
          </div>
          <h2 className="text-2xl font-black text-white">
            ทำเนียบเกียรติยศ <span className="text-amber-400 glow-gold">Olympiad Podium</span>
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            คะแนนสะสม Elo Rating และบันทึกประวัติศาสตร์การแข่งขัน โรงเรียนบรรหารแจ่มใสวิทยา 3
          </p>
        </div>

        {/* Division Tabs & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Division Filter */}
          <div className="flex bg-[#0B192C] p-1 rounded-2xl border border-white/10">
            <button
              onClick={() => setSelectedDivision('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDivision === 'all'
                  ? 'bg-gradient-to-r from-[#008DDA] to-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setSelectedDivision('junior')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDivision === 'junior'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สาย ม.ต้น
            </button>
            <button
              onClick={() => setSelectedDivision('senior')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                selectedDivision === 'senior'
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              สาย ม.ปลาย
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, รหัส..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-xl bg-[#0B192C] border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-[#008DDA]"
            />
          </div>
        </div>
      </div>

      {/* HALL OF FAME (หอเกียรติยศ) SECTION */}
      {hallOfFameTournaments.length > 0 && (
        <div className="bg-gradient-to-r from-amber-950/40 via-[#1E3E62]/40 to-yellow-950/40 border border-amber-500/30 rounded-3xl p-6 backdrop-blur-md relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-xl shadow-lg shadow-amber-500/20">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-white">หอเกียรติยศ (Hall of Fame)</h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/30">
                    Grand Champions
                  </span>
                </div>
                <p className="text-slate-300 text-xs mt-0.5">
                  ทำเนียบผู้ชนะเลิศการแข่งขันอย่างเป็นทางการ โรงเรียนบรรหารแจ่มใสวิทยา 3
                </p>
              </div>
            </div>
            <span className="text-xs text-amber-300/80 font-mono">
              บันทึกเกียรติยศ {hallOfFameTournaments.length} รายการ
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {hallOfFameTournaments.map(t => {
              const w = t.winner;
              const isJunior = t.division === 'junior';
              return (
                <div 
                  key={t.id}
                  onClick={() => setSelectedChampion({ tournament: t, winner: w })}
                  className="group bg-gradient-to-b from-[#0B192C]/90 to-[#1E3E62]/60 border border-amber-400/30 hover:border-amber-400 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/10 relative overflow-hidden"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 font-black flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-300/40">
                        🏆
                      </div>
                      <div>
                        <div className="text-sm font-black text-white group-hover:text-amber-300 transition-colors flex items-center gap-1.5">
                          {w.name}
                          <Crown className="w-3.5 h-3.5 text-amber-400" />
                        </div>
                        <div className="text-xs text-slate-300 font-medium">{w.school}</div>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      isJunior 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {isJunior ? 'ม.ต้น' : 'ม.ปลาย'}
                    </span>
                  </div>

                  <div className="bg-[#0B192C]/80 rounded-xl p-2.5 border border-white/5 space-y-1.5 text-xs">
                    <div className="text-slate-400 text-[11px] truncate">
                      รายการ: <span className="text-amber-200 font-semibold">{t.title}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-white/5">
                      <span className="text-slate-400 font-mono">รหัสนักเรียน: <strong className="text-cyan-400">{w.studentId}</strong></span>
                      <span className="text-emerald-400 font-bold font-mono">คะแนน {w.winningScore}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{w.date || 'ประจำฤดูกาล 2569'}</span>
                    <span className="text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      ดูประวัติ <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State when no students match filter */}
      {displayLeaderboard.length === 0 ? (
        <div className="text-center py-16 bg-[#1E3E62]/30 rounded-3xl border border-dashed border-white/10 p-8 animate-fade-in">
          <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-3 opacity-60" />
          <h3 className="text-lg font-bold text-white">ยังไม่มีรายชื่อนักเรียนบนทำเนียบอันดับในสายนี้</h3>
          <p className="text-slate-400 text-xs mt-1 max-w-md mx-auto">
            ระบบเปิดสำหรับนักเรียนโรงเรียนบรรหารแจ่มใสวิทยา 3 ทุกคน ลงทะเบียนและเข้าร่วมการแข่งขันหรือฝึกซ้อมเพื่อสะสมคะแนนและขึ้นสู่แท่นเกียรติยศ
          </p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM DESIGN (Rank 1 in Center) */}
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
                <Award className="w-4 h-4 text-[#008DDA]" /> ตารางอันดับคะแนนรวม ({selectedDivision === 'all' ? 'ทุกสายชั้น' : selectedDivision === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย'})
              </div>
              <span className="text-xs text-slate-400 font-mono">ทั้งหมด {displayLeaderboard.length} คน</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#0B192C]/90 text-slate-400 border-b border-white/10 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-4 px-6">อันดับ</th>
                    <th className="py-4 px-6">นักเรียน</th>
                    <th className="py-4 px-6">โรงเรียน / ชั้น</th>
                    <th className="py-4 px-6 text-center">ฉายา</th>
                    <th className="py-4 px-6 text-center">Elo</th>
                    <th className="py-4 px-6 text-center">ชนะ / เสมอ / แพ้</th>
                    <th className="py-4 px-6 text-right">คะแนนรวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {displayLeaderboard.map((p) => (
                    <tr
                      key={p.studentId}
                      className={`hover:bg-white/5 transition-colors ${
                        p.currentRank === 1 ? 'bg-amber-500/10 font-bold' : ''
                      }`}
                    >
                      <td className="py-4 px-6 font-mono font-bold text-sm">
                        {p.currentRank === 1 ? '🥇 1' : p.currentRank === 2 ? '🥈 2' : p.currentRank === 3 ? '🥉 3' : `#${p.currentRank}`}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-white text-sm flex items-center gap-1.5">
                          {p.name}
                          {p.currentRank === 1 && <Crown className="w-3.5 h-3.5 text-amber-400" />}
                        </div>
                        <div className="text-[11px] font-mono text-[#008DDA]">{p.studentId}</div>
                      </td>
                      <td className="py-4 px-6 text-slate-300 font-medium">
                        {p.school}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold">
                          {p.badge || 'Competitor'}
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

      {/* CHAMPION SPOTLIGHT / HALL OF FAME MODAL */}
      {selectedChampion && (
        <Modal
          isOpen={!!selectedChampion}
          onClose={() => setSelectedChampion(null)}
          title="ทำเนียบเกียรติยศผู้ชนะเลิศ (Hall of Fame Profile)"
          maxWidth="max-w-lg"
        >
          <div className="space-y-6 text-center py-2">
            {/* Trophy & Champion Crown */}
            <div className="relative mx-auto w-24 h-24 rounded-3xl bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 flex items-center justify-center text-5xl shadow-2xl border-4 border-yellow-200 ring-4 ring-amber-400/40 box-glow-gold">
              🏆
              <div className="absolute -top-3 -right-2 text-2xl animate-bounce">
                👑
              </div>
            </div>

            <div>
              <span className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-black border border-amber-400/30 uppercase tracking-wider">
                {selectedChampion.winner.badge || 'Grand Champion'}
              </span>
              <h3 className="text-2xl font-black text-white mt-2">
                {selectedChampion.winner.name}
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 font-mono">
                รหัสนักเรียน: <strong className="text-cyan-400 font-bold">{selectedChampion.winner.studentId}</strong> | {selectedChampion.winner.grade || 'นักเรียน บ.จ.ว.๓'}
              </p>
              <p className="text-xs text-amber-200/80 mt-1 font-semibold">
                {selectedChampion.winner.school || 'โรงเรียนบรรหารแจ่มใสวิทยา 3'}
              </p>
            </div>

            {/* Achievement Details */}
            <div className="bg-[#0B192C] border border-amber-400/30 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs text-slate-400">รายการแข่งขัน</span>
                <span className="text-xs font-bold text-amber-300 text-right max-w-[200px] truncate">
                  {selectedChampion.tournament.title}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs text-slate-400">สายการแข่งขัน</span>
                <span className="text-xs font-bold text-white">
                  {selectedChampion.tournament.divisionName || 'สายการแข่งขันทั่วไป'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs text-slate-400">คะแนนรอบชิงชนะเลิศ</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {selectedChampion.winner.winningScore} คะแนน
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">วันที่ได้รับการจารึกชื่อ</span>
                <span className="text-xs font-mono text-slate-300">
                  {selectedChampion.winner.date || 'ปีการศึกษา 2569'}
                </span>
              </div>
            </div>

            {/* Accolades & Recognition Box */}
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              <div className="flex items-center justify-center gap-1.5 font-bold mb-1">
                <Sparkles className="w-4 h-4 text-amber-400" /> คำประกาศเกียรติคุณ
              </div>
              "ได้รับการจารึกชื่ออย่างสมเกียรติในฐานะผู้ชนะเลิศการแข่งขันคณิตศาสตร์โอลิมปิก โรงเรียนบรรหารแจ่มใสวิทยา 3 ประจำปีการศึกษา 2569"
            </div>

            <button
              onClick={() => setSelectedChampion(null)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white font-bold text-xs transition-all shadow-md"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
