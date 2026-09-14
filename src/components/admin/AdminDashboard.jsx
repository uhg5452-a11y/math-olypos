import React, { useState } from 'react';
import { 
  Shield, Trophy, Users, Award, Lock, Sparkles, LogIn, Search, 
  Trash2, UserX, AlertTriangle, GraduationCap, CheckCircle 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTournament } from '../../context/TournamentContext';
import { useGame } from '../../context/GameContext';
import TournamentManager from './TournamentManager';
import MatchManager from './MatchManager';
import LeaderboardManager from './LeaderboardManager';
import ConfirmModal from '../common/ConfirmModal';

export default function AdminDashboard({ onOpenLogin }) {
  const { currentUser, isAdmin, students, deleteStudentAccount } = useAuth();
  const { tournaments } = useTournament();
  const { leaderboard } = useGame();
  const [activeTab, setActiveTab] = useState('tournaments'); // 'tournaments', 'matches', 'leaderboard', 'students'
  const [studentSearch, setStudentSearch] = useState('');

  // Confirm Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    details: null,
    confirmText: 'ยืนยัน',
    type: 'danger',
    onConfirm: () => {}
  });

  // RBAC Access Control Check
  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto py-16 px-6 text-center bg-[#1E3E62]/40 rounded-3xl border border-rose-500/30 backdrop-blur-md animate-fade-in shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-950/60 border border-rose-500/40 flex items-center justify-center mx-auto mb-4 text-rose-400">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-white mb-2">
          พื้นที่สงวนเฉพาะผู้ดูแลระบบ (Admin Access Restricted)
        </h2>
        <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
          หน้านี้ถูกจำกัดสิทธิ์ (RBAC) เข้าถึงได้เฉพาะ 2 บัญชีแอดมินที่ได้รับอนุญาตเท่านั้น 
          หากคุณเป็นคณะกรรมการจัดการแข่งขัน กรุณาเข้าสู่ระบบด้วยอีเมลแอดมิน
        </p>

        <button
          onClick={onOpenLogin}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs shadow-lg shadow-amber-500/20 inline-flex items-center gap-2 transition-all active:scale-95"
        >
          <LogIn className="w-4 h-4" /> เข้าสู่ระบบด้วยบัญชีแอดมิน
        </button>
      </div>
    );
  }

  // Calculate overview metrics
  const totalTournaments = tournaments.length;
  const openTournaments = tournaments.filter(t => t.isRegistrationOpen).length;
  const totalRegisteredAthletes = tournaments.reduce((acc, t) => acc + (t.registeredStudents?.length || 0), 0);

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    s.studentId.toLowerCase().includes(studentSearch.toLowerCase()) ||
    (s.grade && s.grade.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const handleDeleteStudent = (student) => {
    setConfirmModal({
      isOpen: true,
      title: 'ลบบัญชีนักเรียน (Delete Student Account)',
      message: `ยืนยันการลบบัญชีของ ${student.name} (รหัส ${student.studentId}) ออกจากระบบหรือไม่?`,
      details: 'การลบบัญชีจะทำให้ข้อมูลประจำตัวและประวัติการลงทะเบียนของนักเรียนรายนี้ถูกถอดออกจากระบบอย่างถาวร',
      confirmText: 'ลบบัญชีทันที',
      type: 'danger',
      onConfirm: () => {
        deleteStudentAccount(student.studentId);
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Admin Header & Welcome */}
      <div className="bg-gradient-to-r from-amber-950/50 via-[#0B192C] to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-600/20 border border-amber-500/40 flex items-center justify-center text-3xl shadow-lg">
              {currentUser.avatar || '👨‍🏫'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider border border-amber-500/40 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-amber-400" /> Authorized Admin
                </span>
                <span className="text-xs text-slate-400 font-mono">({currentUser.email})</span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">
                แผงควบคุมระบบจัดการหลังบ้าน (Admin Panel)
              </h1>
              <p className="text-xs text-amber-200/80 mt-0.5">
                ยินดีต้อนรับ {currentUser.name} • สิทธิ์การใช้งาน: {currentUser.badge}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">รอบแข่งทั้งหมด</div>
            <div className="text-xl font-black text-white mt-0.5">{totalTournaments}</div>
          </div>

          <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">เปิดรับสมัครอยู่</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{openTournaments} รอบ</div>
          </div>

          <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">นักเรียนในระบบ</div>
            <div className="text-xl font-black text-[#008DDA] mt-0.5">{students.length} คน</div>
          </div>

          <div className="bg-[#0B192C]/80 border border-white/10 rounded-2xl p-3 text-center">
            <div className="text-[10px] uppercase font-bold text-slate-400">ผู้เล่นในกระดานอันดับ</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">{leaderboard.length} คน</div>
          </div>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#0B192C]/80 p-1.5 rounded-2xl border border-white/10 max-w-3xl">
        <button
          onClick={() => setActiveTab('tournaments')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'tournaments'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Trophy className="w-4 h-4" /> รอบแข่งขัน
        </button>

        <button
          onClick={() => setActiveTab('matches')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'matches'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" /> ห้องแข่ง & บันทึกผล
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Award className="w-4 h-4" /> จัดการอันดับ
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'students'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-4 h-4" /> บัญชีนักเรียน ({students.length})
        </button>
      </div>

      {/* Tab Panels */}
      <div className="bg-[#1E3E62]/40 rounded-3xl p-6 sm:p-8 border border-white/10 backdrop-blur-md">
        {activeTab === 'tournaments' && <TournamentManager />}
        {activeTab === 'matches' && <MatchManager />}
        {activeTab === 'leaderboard' && <LeaderboardManager />}

        {/* TAB 4: STUDENT ACCOUNTS MANAGEMENT (ADMIN PRIVILEGE) */}
        {activeTab === 'students' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0B192C]/80 p-5 rounded-2xl border border-white/10">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-amber-400" /> บัญชีนักเรียนทั้งหมด (โรงเรียนบรรหารแจ่มใสวิทยา 3)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  เฉพาะแอดมินเท่านั้นที่มีสิทธิ์ตรวจสอบข้อมูลและลบบัญชีนักเรียนออกจากฐานข้อมูล
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="ค้นหาชื่อ, รหัสนักเรียน..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#0B192C] border border-white/20 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {filteredStudents.length === 0 ? (
              <div className="p-12 text-center bg-[#0B192C]/60 rounded-2xl border border-white/10 space-y-2">
                <Users className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-white font-bold text-base">ไม่พบข้อมูลบัญชีนักเรียน</div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  ระบบจะแสดงผลเฉพาะนักเรียนจริงที่มีการลงทะเบียนสมัครใช้งานเท่านั้น (ไม่มีข้อมูลตัวอย่าง)
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/10 bg-[#0B192C]/90 shadow-xl">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-[#1E3E62]/80 text-slate-400 uppercase text-[10px] font-bold border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3.5">ลำดับ</th>
                      <th className="px-4 py-3.5">รหัสนักเรียน</th>
                      <th className="px-4 py-3.5">ชื่อ - นามสกุล</th>
                      <th className="px-4 py-3.5">ระดับชั้น</th>
                      <th className="px-4 py-3.5 text-center">สายการแข่งขัน</th>
                      <th className="px-4 py-3.5 font-mono text-amber-400 text-center">Math ELO</th>
                      <th className="px-4 py-3.5 text-right">การจัดการสิทธิ์แอดมิน</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {filteredStudents.map((s, idx) => {
                      const isJunior = (s.grade || '').includes('ม.1') || (s.grade || '').includes('ม.2') || (s.grade || '').includes('ม.3');
                      return (
                        <tr key={s.id || s.studentId} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3.5 font-mono text-slate-400">#{idx + 1}</td>
                          <td className="px-4 py-3.5 font-mono font-bold text-cyan-400">{s.studentId}</td>
                          <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                            <span>{s.avatar || '🧑‍🎓'}</span> {s.name}
                          </td>
                          <td className="px-4 py-3.5 text-slate-300">{s.grade || 'มัธยมศึกษา'}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              isJunior
                                ? 'bg-blue-500/20 text-blue-300 border-blue-400/30'
                                : 'bg-purple-500/20 text-purple-300 border-purple-400/30'
                            }`}>
                              {isJunior ? 'ม.ต้น' : 'ม.ปลาย'}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono font-bold text-amber-400 text-center">
                            {s.elo || 1500}
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <button
                              onClick={() => handleDeleteStudent(s)}
                              className="px-3 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-500 text-white font-bold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-md active:scale-95"
                              title="ลบบัญชีนักเรียนออกจากระบบ"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> ลบบัญชีผู้ใช้
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

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
