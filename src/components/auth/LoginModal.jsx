import React, { useState } from 'react';
import { User, Lock, Mail, Shield, AlertCircle, ArrowRight, CheckCircle, UserPlus, KeyRound } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('student'); // 'student', 'register', 'admin'

  // Student Login State
  const [studentId, setStudentId] = useState('');
  const [privatePin, setPrivatePin] = useState('');

  // New Student Registration State
  const [regStudentId, setRegStudentId] = useState('');
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('โรงเรียนบรรหารแจ่มใสวิทยา 3');
  const [regGrade, setRegGrade] = useState('มัธยมศึกษาปีที่ 4/1');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const {
    loginStudent,
    registerStudent,
    loginAdmin,
    switchDemoUser,
    authError,
    setAuthError,
    adminAccounts,
    students
  } = useAuth();

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const res = loginStudent(studentId, privatePin);
    if (res.success) {
      onClose();
      if (onLoginSuccess) onLoginSuccess('student');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regPin !== regConfirmPin) {
      setAuthError('รหัสเฉพาะส่วนตัว (Private PIN) ทั้งสองช่องไม่ตรงกัน');
      return;
    }
    if (regPin.length < 4) {
      setAuthError('Private PIN ควรมีความยาวอย่างน้อย 4 ตัวอักษร/ตัวเลข');
      return;
    }

    const res = registerStudent({
      studentId: regStudentId,
      name: regName,
      school: regSchool,
      grade: regGrade,
      privatePin: regPin
    });

    if (res.success) {
      onClose();
      if (onLoginSuccess) onLoginSuccess('student');
    }
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    const res = loginAdmin(adminEmail, adminPassword);
    if (res.success) {
      onClose();
      if (onLoginSuccess) onLoginSuccess('admin');
    }
  };

  const handleQuickStudentLogin = (idx) => {
    switchDemoUser('student', idx);
    onClose();
    if (onLoginSuccess) onLoginSuccess('student');
  };

  const handleQuickAdminLogin = (idx) => {
    switchDemoUser('admin', idx);
    onClose();
    if (onLoginSuccess) onLoginSuccess('admin');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="เข้าสู่ระบบ Math Olympiad Hub" maxWidth="max-w-xl">
      {/* 3-Tab Switcher */}
      <div className="grid grid-cols-3 gap-1.5 bg-[#0B192C]/80 p-1.5 rounded-xl border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => { setTab('student'); setAuthError(null); }}
          className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'student'
              ? 'bg-[#008DDA] text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" /> นักเรียน (เข้าสู่ระบบ)
        </button>

        <button
          type="button"
          onClick={() => { setTab('register'); setAuthError(null); }}
          className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'register'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> นักเรียนใหม่ (ตั้ง PIN)
        </button>

        <button
          type="button"
          onClick={() => { setTab('admin'); setAuthError(null); }}
          className={`py-2 px-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            tab === 'admin'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> แอดมิน (2 ผู้สร้าง)
        </button>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {tab === 'student' && (
        /* Student Login with Private PIN */
        <div>
          <div className="p-3 rounded-xl bg-[#008DDA]/10 border border-[#008DDA]/30 text-cyan-200 text-xs mb-4 flex items-start gap-2">
            <KeyRound className="w-4 h-4 text-[#008DDA] mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ระบบรหัสเฉพาะส่วนตัว (Private PIN):</span>
              <p className="text-[11px] text-cyan-300/80 mt-0.5">
                นักเรียนแต่ละคนในโรงเรียนจะมีรหัสเฉพาะส่วนตัว (Private PIN) ที่ไม่ซ้ำกัน เพื่อความปลอดภัยในการเข้าใช้งาน
              </p>
            </div>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                รหัสประจำตัวนักเรียน (Student ID)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008DDA]" />
                <input
                  type="text"
                  required
                  placeholder="เช่น STU-2026-001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#008DDA] focus:ring-1 focus:ring-[#008DDA] transition-all text-sm uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                รหัสเฉพาะส่วนตัว (Private PIN / Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008DDA]" />
                <input
                  type="password"
                  required
                  placeholder="กรอก Private PIN ประจำตัวของคุณ"
                  value={privatePin}
                  onChange={(e) => setPrivatePin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#008DDA] focus:ring-1 focus:ring-[#008DDA] transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#008DDA] to-blue-600 text-white font-bold text-sm hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบด้วย Private PIN <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector for Students */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#008DDA]" /> ตัวอย่างข้อมูลนักเรียนในโรงเรียน (พร้อม Private PIN ที่ไม่ซ้ำกัน):
            </p>
            <div className="grid grid-cols-2 gap-2">
              {students.slice(0, 4).map((s, idx) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleQuickStudentLogin(idx)}
                  className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#008DDA]/40 text-left transition-all"
                >
                  <div className="text-xs font-bold text-white truncate">{s.name}</div>
                  <div className="text-[11px] text-[#008DDA] font-mono">{s.studentId}</div>
                  <div className="text-[10px] text-amber-300/90 font-mono mt-0.5">Private PIN: {s.privatePin}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'register' && (
        /* New Student Registration Form */
        <div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs mb-4 flex items-start gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ลงทะเบียนนักเรียนในโรงเรียน (Student Enrollment):</span>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                รองรับการเข้าใช้งานของนักเรียนทุกคนในโรงเรียน บันทึกข้อมูลประจำตัวและตั้ง Private PIN สำหรับใช้งาน
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">รหัสประจำตัวนักเรียน (Student ID):</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น STU-2026-009"
                  value={regStudentId}
                  onChange={(e) => setRegStudentId(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ชื่อ-นามสกุลจริง:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ด.ช. กฤษณ์ วงศ์ไทย"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">โรงเรียน / สถาบัน:</label>
                <input
                  type="text"
                  required
                  value={regSchool}
                  onChange={(e) => setRegSchool(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ระดับชั้น / ห้อง:</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ม.4/2"
                  value={regGrade}
                  onChange={(e) => setRegGrade(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ตั้งรหัสเฉพาะส่วนตัว (Private PIN):</label>
                <input
                  type="password"
                  required
                  placeholder="ตั้ง PIN 4-6 หลัก"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">ยืนยัน Private PIN อีกครั้ง:</label>
                <input
                  type="password"
                  required
                  placeholder="ยืนยัน PIN เดียวกัน"
                  value={regConfirmPin}
                  onChange={(e) => setRegConfirmPin(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              บันทึกข้อมูลและเข้าใช้งานทันที <UserPlus className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {tab === 'admin' && (
        /* Admin Login Form with Whitelist Notice */
        <div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ระบบจำกัดสิทธิ์ผู้สร้าง (Admin Whitelist):</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                ระบบจำกัดสิทธิ์เข้าใช้งานเฉพาะ 2 บัญชีผู้สร้างที่ระบุไว้ใน Whitelist เท่านั้น ได้แก่: <br />
                • <code className="text-white font-mono">uhg5452@gmail.com</code> (น.ส. สุจารี สุขีวงศ์)<br />
                • <code className="text-white font-mono">pongkunkalapukdee@gmail.com</code> (นายปองคุณ กาฬภักดี)
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                อีเมลแอดมิน (Whitelisted Admin Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="email"
                  required
                  placeholder="เช่น uhg5452@gmail.com"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={adminPassword}
                  onChange={(e) => setAdminPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-sm hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบแอดมิน <Shield className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector for the 2 Creator Admins */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-slate-400 font-medium mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> ทดสอบเข้าสู่ระบบ 2 แอดมินผู้สร้าง (Whitelisted Admins):
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {adminAccounts.map((admin, idx) => (
                <button
                  key={admin.id}
                  type="button"
                  onClick={() => handleQuickAdminLogin(idx)}
                  className="p-2.5 rounded-lg bg-amber-950/30 hover:bg-amber-950/60 border border-amber-500/20 hover:border-amber-500/60 text-left transition-all"
                >
                  <div className="text-xs font-bold text-amber-200">{admin.name}</div>
                  <div className="text-[11px] text-slate-300 font-mono">{admin.email}</div>
                  <div className="text-[10px] text-amber-400/80 mt-0.5">รหัสผ่าน: {admin.password}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
