import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Calendar, Users, 
  CheckCircle, Clock, AlertCircle, UserX, UserCheck, Shield 
} from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';
import ConfirmModal from '../common/ConfirmModal';

export default function TournamentManager() {
  const { 
    tournaments, 
    addTournament, 
    updateTournament, 
    deleteTournament, 
    toggleTournamentRegistration,
    toggleForfeitStudent
  } = useTournament();

  const { students } = useAuth();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTourney, setEditingTourney] = useState(null);
  const [rosterTourney, setRosterTourney] = useState(null);

  // Confirm Modal state
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null,
    confirmText: 'ยืนยัน',
    type: 'danger',
    onConfirm: () => {}
  });

  const [formData, setFormData] = useState({
    title: '',
    category: 'a-math',
    categoryName: 'เอแมท (A-Math)',
    division: 'junior',
    divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
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
      division: 'junior',
      divisionName: 'สาย ม.ต้น (ม.1 - ม.3)',
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
      division: tourney.division || 'junior',
      divisionName: tourney.divisionName || (tourney.division === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)'),
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

  const handleDeleteClick = (tourney) => {
    setConfirmModal({
      isOpen: true,
      title: 'ยืนยันการลบรายการแข่งขัน',
      message: `ยืนยันการลบรายการ "${tourney.title}" ออกจากระบบหรือไม่?`,
      details: 'ข้อมูลรอบการแข่งขันและสถิติของผู้สมัครในรายการนี้จะถูกลบอย่างถาวร',
      confirmText: 'ลบรายการแข่งขัน',
      type: 'danger',
      onConfirm: () => {
        deleteTournament(tourney.id);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  const handleToggleForfeitInRoster = (tourneyId, sid, isForfeited) => {
    const studentObj = students.find(s => s.studentId === sid);
    const studentName = studentObj ? studentObj.name : `รหัส ${sid}`;

    if (isForfeited) {
      toggleForfeitStudent(tourneyId, sid);
      // Update local roster modal view
      setRosterTourney(prev => prev ? {
        ...prev,
        forfeitedStudents: (prev.forfeitedStudents || []).filter(id => id !== sid)
      } : null);
    } else {
      setConfirmModal({
        isOpen: true,
        title: 'ตัดสิทธิ์การแข่งขัน (Forfeit)',
        message: `ยืนยันตัดสิทธิ์ ${studentName} ในรายการนี้หรือไม่?`,
        details: 'นักเรียนที่ถูกตัดสิทธิ์จะไม่สามารถเข้าห้องแข่งขัน Tournament Arena ได้',
        confirmText: 'ยืนยันตัดสิทธิ์',
        type: 'danger',
        onConfirm: () => {
          toggleForfeitStudent(tourneyId, sid);
          setRosterTourney(prev => prev ? {
            ...prev,
            forfeitedStudents: [...(prev.forfeitedStudents || []), sid]
          } : null);
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rules = formData.rulesText.split('\n').filter(Boolean);

    if (editingTourney) {
      updateTournament({
        ...editingTourney,
        ...formData,
        categoryName: categoryNames[formData.category],
        divisionName: formData.division === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)',
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
        divisionName: formData.division === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)',
        status: 'open',
        isRegistrationOpen: true,
        registeredStudents: [],
        forfeitedStudents: [],
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
            สร้างรอบใหม่ กำหนดสาย ม.ต้น / ม.ปลาย ตรวจสอบรายชื่อผู้สมัคร และตัดสิทธิ์ (Forfeit)
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
                <th className="py-3.5 px-4 text-center">สายการแข่งขัน</th>
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
                  <td className="py-3.5 px-4 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      t.division === 'junior' 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                    }`}>
                      {t.division === 'junior' ? 'ม.ต้น' : 'ม.ปลาย'}
                    </span>
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
                    <button
                      onClick={() => setRosterTourney(t)}
                      className="px-2.5 py-1 rounded-lg bg-[#1E3E62] hover:bg-[#008DDA]/30 text-cyan-300 text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1 mx-auto transition-colors"
                      title="คลิกเพื่อดูรายชื่อและจัดการตัดสิทธิ์"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{t.registeredStudents?.length || 0} / {t.maxParticipants}</span>
                    </button>
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
                        onClick={() => setRosterTourney(t)}
                        className="p-1.5 rounded-lg bg-blue-950/40 hover:bg-blue-900/60 text-cyan-300"
                        title="ดูรายชื่อผู้สมัคร & ตัดสิทธิ์"
                      >
                        <Users className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(t)}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white"
                        title="แก้ไข"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(t)}
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

      {/* Roster & Attendance Modal */}
      {rosterTourney && (
        <Modal
          isOpen={!!rosterTourney}
          onClose={() => setRosterTourney(null)}
          title={`รายชื่อผู้สมัคร - ${rosterTourney.title}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between bg-[#0B192C] p-3 rounded-xl border border-white/10">
              <div>
                <span className="text-slate-400">สายการแข่งขัน: </span>
                <strong className="text-amber-300">{rosterTourney.divisionName || (rosterTourney.division === 'junior' ? 'สาย ม.ต้น' : 'สาย ม.ปลาย')}</strong>
              </div>
              <div className="font-mono text-cyan-400">
                ผู้สมัคร: {rosterTourney.registeredStudents?.length || 0} / {rosterTourney.maxParticipants} คน
              </div>
            </div>

            {(!rosterTourney.registeredStudents || rosterTourney.registeredStudents.length === 0) ? (
              <div className="py-8 text-center text-slate-400">
                ยังไม่มีนักเรียนลงทะเบียนในรายการนี้
              </div>
            ) : (
              <div className="max-h-[350px] overflow-y-auto border border-white/10 rounded-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1E3E62]/70 text-slate-400 uppercase text-[10px] font-bold border-b border-white/10 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-center">ลำดับ</th>
                      <th className="px-3 py-2">รหัส</th>
                      <th className="px-3 py-2">ชื่อ - สกุล</th>
                      <th className="px-3 py-2 text-center">สถานะ</th>
                      <th className="px-3 py-2 text-right">คำสั่ง</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {rosterTourney.registeredStudents.map((sid, idx) => {
                      const s = students.find(item => item.studentId === sid);
                      const isForfeited = (rosterTourney.forfeitedStudents || []).includes(sid);
                      return (
                        <tr key={sid} className="hover:bg-white/5">
                          <td className="px-3 py-2 text-center font-mono text-slate-400">#{idx + 1}</td>
                          <td className="px-3 py-2 font-mono font-bold text-cyan-400">{sid}</td>
                          <td className="px-3 py-2 font-bold text-white">
                            {s ? s.name : 'นักเรียน บ.จ.ว.๓'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            {isForfeited ? (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                                ตัดสิทธิ์ (Forfeit)
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                                พร้อมแข่ง (Ready)
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {isForfeited ? (
                              <button
                                onClick={() => handleToggleForfeitInRoster(rosterTourney.id, sid, true)}
                                className="px-2 py-1 rounded bg-emerald-600/80 hover:bg-emerald-500 text-white text-[10px] font-bold transition-all inline-flex items-center gap-1"
                              >
                                <UserCheck className="w-3 h-3" /> คืนสิทธิ์
                              </button>
                            ) : (
                              <button
                                onClick={() => handleToggleForfeitInRoster(rosterTourney.id, sid, false)}
                                className="px-2 py-1 rounded bg-rose-600/80 hover:bg-rose-500 text-white text-[10px] font-bold transition-all inline-flex items-center gap-1"
                              >
                                <UserX className="w-3 h-3" /> ตัดสิทธิ์
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setRosterTourney(null)}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </Modal>
      )}

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
                placeholder="เช่น การแข่งขันเอแมทชิงแชมป์สาย ม.ต้น โรงเรียนบรรหารแจ่มใสวิทยา 3"
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
                <label className="block text-slate-300 font-semibold mb-1">สายการแข่งขัน:</label>
                <select
                  value={formData.division || 'junior'}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    division: e.target.value,
                    divisionName: e.target.value === 'junior' ? 'สาย ม.ต้น (ม.1 - ม.3)' : 'สาย ม.ปลาย (ม.4 - ม.6)'
                  })}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white text-xs"
                >
                  <option value="junior">สาย ม.ต้น (ม.1 - ม.3)</option>
                  <option value="senior">สาย ม.ปลาย (ม.4 - ม.6)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
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

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        details={confirmModal.details}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />
    </div>
  );
}
