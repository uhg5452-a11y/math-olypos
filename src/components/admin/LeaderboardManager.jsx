import React, { useState } from 'react';
import { Award, Plus, Edit2, Trash2, Download, PlusCircle, MinusCircle, ShieldCheck, Search } from 'lucide-react';
import { useGame } from '../../context/GameContext';
import Modal from '../common/Modal';

export default function LeaderboardManager() {
  const { leaderboard, updatePlayerScore, addLeaderboardEntry, removeLeaderboardEntry } = useGame();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bonusPoints, setBonusPoints] = useState(50);

  const [newEntry, setNewEntry] = useState({
    studentId: '',
    name: '',
    school: '',
    elo: 1600,
    points: 1000,
    wins: 0,
    draws: 0,
    losses: 0,
    badge: 'Contender',
    favoriteGame: 'เอแมท (A-Math)'
  });

  const filtered = leaderboard.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.studentId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addLeaderboardEntry(newEntry);
    setIsAddModalOpen(false);
    setNewEntry({
      studentId: '',
      name: '',
      school: '',
      elo: 1600,
      points: 1000,
      wins: 0,
      draws: 0,
      losses: 0,
      badge: 'Contender',
      favoriteGame: 'เอแมท (A-Math)'
    });
  };

  const handleExportCSV = () => {
    const headers = 'Rank,Student ID,Name,School,Elo,Wins,Draws,Losses,Points\n';
    const rows = leaderboard.map(p =>
      `${p.rank},"${p.studentId}","${p.name}","${p.school}",${p.elo},${p.wins},${p.draws},${p.losses},${p.points}`
    ).join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `olympiad_leaderboard_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-400" /> จัดการกระดานผู้นำ (Leaderboard Management)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            ปรับปรุงคะแนนสะสม Elo ปรับแต่งอันดับ และส่งออกข้อมูลผู้แข่งขัน
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-3 py-2 rounded-xl bg-[#008DDA] hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
          >
            <Plus className="w-4 h-4" /> เพิ่มผู้เข้าแข่งขัน
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-white/10"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="ค้นหาชื่อ หรือรหัสนักเรียน..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0B192C] border border-white/10 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-[#008DDA]"
        />
      </div>

      {/* Leaderboard Management Table */}
      <div className="bg-[#0B192C]/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E3E62]/70 text-slate-300 font-bold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">อันดับ</th>
                <th className="py-3.5 px-4">นักเรียน</th>
                <th className="py-3.5 px-4">โรงเรียน</th>
                <th className="py-3.5 px-4 text-center">Elo Rating</th>
                <th className="py-3.5 px-4 text-center">ชนะ / เสมอ / แพ้</th>
                <th className="py-3.5 px-4 text-center">คะแนนสะสม</th>
                <th className="py-3.5 px-4 text-right">ปรับคะแนนด่วน</th>
                <th className="py-3.5 px-4 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((p) => (
                <tr key={p.studentId} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-sm">
                    #{p.rank}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white">{p.name}</div>
                    <div className="text-[11px] font-mono text-[#008DDA]">{p.studentId}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    {p.school}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-amber-400">
                    {p.elo}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono">
                    <span className="text-emerald-400 font-bold">{p.wins}</span> / {p.draws} / <span className="text-rose-400">{p.losses}</span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-black text-[#008DDA] text-sm">
                    {p.points}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => updatePlayerScore(p.studentId, 50, 0, 10)}
                        className="px-2 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold"
                        title="เพิ่มโบนัส +50 คะแนน"
                      >
                        +50
                      </button>
                      <button
                        onClick={() => updatePlayerScore(p.studentId, -50, 0, -10)}
                        className="px-2 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-500/30 text-rose-300 text-[11px] font-bold"
                        title="หักคะแนน -50"
                      >
                        -50
                      </button>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        if (window.confirm(`ลบ ${p.name} (${p.studentId}) ออกจากตารางอันดับหรือไม่?`)) {
                          removeLeaderboardEntry(p.studentId);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300"
                      title="ลบ"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Competitor Modal */}
      {isAddModalOpen && (
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          title="เพิ่มผู้เข้าแข่งขันในกระดานอันดับ"
        >
          <form onSubmit={handleAddSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">รหัสนักเรียน (Student ID):</label>
                <input
                  type="text"
                  required
                  value={newEntry.studentId}
                  onChange={(e) => setNewEntry({ ...newEntry, studentId: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white font-mono"
                  placeholder="เช่น 45123"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อ-นามสกุล:</label>
                <input
                  type="text"
                  required
                  value={newEntry.name}
                  onChange={(e) => setNewEntry({ ...newEntry, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                  placeholder="เช่น กฤติน สุขสวัสดิ์"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">โรงเรียน / สังกัด:</label>
                <input
                  type="text"
                  required
                  value={newEntry.school}
                  onChange={(e) => setNewEntry({ ...newEntry, school: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                  placeholder="โรงเรียน..."
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ฉายา / ระดับ (Badge):</label>
                <input
                  type="text"
                  value={newEntry.badge}
                  onChange={(e) => setNewEntry({ ...newEntry, badge: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                  placeholder="Candidate, Expert"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">คะแนนเริ่มต้น (Points):</label>
                <input
                  type="number"
                  value={newEntry.points}
                  onChange={(e) => setNewEntry({ ...newEntry, points: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Elo Rating:</label>
                <input
                  type="number"
                  value={newEntry.elo}
                  onChange={(e) => setNewEntry({ ...newEntry, elo: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 text-slate-300"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#008DDA] text-white font-bold"
              >
                บันทึกลงกระดานผู้นำ
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
