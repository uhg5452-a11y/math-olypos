import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Calendar, Users, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import Modal from '../common/Modal';

export default function TournamentManager() {
  const { tournaments, addTournament, updateTournament, deleteTournament, toggleTournamentRegistration } = useTournament();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTourney, setEditingTourney] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'a-math',
    categoryName: 'เอแมท (A-Math)',
    roundName: 'รอบคัดเลือก (Qualifying)',
    startDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
    endDate: new Date(Date.now() + 180 * 60 * 1000).toISOString().slice(0, 16),
    maxParticipants: 32,
    description: '',
    prizes: 'เกียรติบัตรและเหรียญรางวัล',
    rulesText: '1. ห้ามใช้อุปกรณ์ช่วยคำนวณ\n2. เวลาคิดฝ่ายละ 15 นาที'
  });

  const categoryNames = {
    'a-math': 'เอแมท (A-Math)',
    'sudoku': 'ซูโดกุ (Sudoku)',
    'checkers': 'หมากฮอส (Thai Checkers)',
    'speed-math': 'คิดเลขเร็ว (Speed Math)',
    'make-24': 'เกม 24 (Make 24)',
    'flash-anzan': 'จินตคณิต (Flash Anzan)'
  };

  const handleOpenAdd = () => {
    setEditingTourney(null);
    setFormData({
      title: '',
      category: 'a-math',
      categoryName: 'เอแมท (A-Math)',
      roundName: 'รอบคัดเลือก (Qualifying)',
      startDate: new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 16),
      endDate: new Date(Date.now() + 180 * 60 * 1000).toISOString().slice(0, 16),
      maxParticipants: 32,
      description: '',
      prizes: 'เกียรติบัตรและเหรียญรางวัล',
      rulesText: '1. ห้ามใช้อุปกรณ์ช่วยคำนวณ\n2. เวลาคิดฝ่ายละ 15 นาที'
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (tourney) => {
    setEditingTourney(tourney);
    setFormData({
      title: tourney.title,
      category: tourney.category,
      categoryName: tourney.categoryName,
      roundName: tourney.roundName,
      startDate: new Date(tourney.startDate).toISOString().slice(0, 16),
      endDate: new Date(tourney.endDate).toISOString().slice(0, 16),
      maxParticipants: tourney.maxParticipants,
      description: tourney.description,
      prizes: tourney.prizes || '',
      rulesText: tourney.rules?.join('\n') || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rules = formData.rulesText.split('\n').filter(Boolean);

    if (editingTourney) {
      updateTournament({
        ...editingTourney,
        ...formData,
        categoryName: categoryNames[formData.category],
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        rules
      });
    } else {
      const newId = 'tourney-' + Date.now();
      addTournament({
        id: newId,
        ...formData,
        categoryName: categoryNames[formData.category],
        status: 'open',
        isRegistrationOpen: true,
        registeredStudents: [],
        matches: [],
        rules,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10">
        <div>
          <h3 className="text-lg font-bold text-white">จัดการรอบการแข่งขัน (Tournament Rounds)</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            สร้างรอบใหม่ กำหนดวันเวลาเริ่ม-สิ้นสุด และสลับเปิด/ปิดการรับสมัครได้ทันที
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> เพิ่มรอบแข่งขันใหม่
        </button>
      </div>

      {/* Tournaments Management Table */}
      <div className="bg-[#0B192C]/90 rounded-2xl border border-white/10 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#1E3E62]/70 text-slate-300 font-bold uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">รายการ & หมวดหมู่</th>
                <th className="py-3.5 px-4">รอบแข่งขัน</th>
                <th className="py-3.5 px-4">กำหนดการ</th>
                <th className="py-3.5 px-4 text-center">ผู้สมัคร</th>
                <th className="py-3.5 px-4 text-center">สถานะรับสมัคร</th>
                <th className="py-3.5 px-4 text-right">การกระทำ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tournaments.map((t) => (
                <tr key={t.id} className="hover:bg-white/5 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-white text-sm">{t.title}</div>
                    <div className="text-[11px] text-[#008DDA]">{t.categoryName}</div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 text-slate-200 text-[11px] font-semibold">
                      {t.roundName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{new Date(t.startDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</div>
                    <div className="text-[11px] text-slate-500">
                      {new Date(t.startDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-white">
                    {t.registeredStudents?.length || 0} / {t.maxParticipants}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => toggleTournamentRegistration(t.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                        t.isRegistrationOpen
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/30'
                      }`}
                    >
                      {t.isRegistrationOpen ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                      <span>{t.isRegistrationOpen ? 'เปิดรับสมัคร' : 'ปิดรับสมัคร'}</span>
                    </button>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`ยืนยันการลบรายการ "${t.title}" หรือไม่?`)) {
                            deleteTournament(t.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 text-rose-300"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Tournament Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingTourney ? 'แก้ไขรอบการแข่งขัน' : 'เพิ่มรอบการแข่งขันใหม่'}
        >
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">ชื่อรายการแข่งขัน:</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                placeholder="เช่น การแข่งขันเอแมทชิงแชมป์ประเทศไทย 2026"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ประเภทเกม:</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                >
                  <option value="a-math">เอแมท (A-Math)</option>
                  <option value="sudoku">ซูโดกุ (Sudoku)</option>
                  <option value="checkers">หมากฮอส (Thai Checkers)</option>
                  <option value="speed-math">คิดเลขเร็ว (Speed Math)</option>
                  <option value="make-24">เกม 24 (Make 24)</option>
                  <option value="flash-anzan">จินตคณิต (Flash Anzan)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อรอบ (Round Name):</label>
                <input
                  type="text"
                  required
                  value={formData.roundName}
                  onChange={(e) => setFormData({ ...formData, roundName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                  placeholder="เช่น รอบคัดเลือก (Qualifying)"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">วัน-เวลาเริ่มแข่ง:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">วัน-เวลาสิ้นสุด:</label>
                <input
                  type="datetime-local"
                  required
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">จำนวนรับสมัครสูงสุด (คน):</label>
                <input
                  type="number"
                  required
                  min="2"
                  max="500"
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({ ...formData, maxParticipants: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">รางวัลการแข่งขัน:</label>
                <input
                  type="text"
                  value={formData.prizes}
                  onChange={(e) => setFormData({ ...formData, prizes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                  placeholder="ถ้วยรางวัล ทุนการศึกษา"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">รายละเอียดการแข่งขัน:</label>
              <textarea
                rows="2"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                placeholder="คำอธิบายรายละเอียด..."
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">กติกาการแข่งขัน (บรรทัดละข้อ):</label>
              <textarea
                rows="3"
                value={formData.rulesText}
                onChange={(e) => setFormData({ ...formData, rulesText: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs font-mono"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-300 font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold shadow-lg"
              >
                บันทึกข้อมูล
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
