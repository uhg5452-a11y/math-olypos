import React, { useState } from 'react';
import { User, Lock, Mail, Shield, AlertCircle, ArrowRight, UserPlus, KeyRound, GraduationCap } from 'lucide-react';
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
  const [regGrade, setRegGrade] = useState('มัธยมศึกษาปีที่ 4/1');
  const [regPin, setRegPin] = useState('');
  const [regConfirmPin, setRegConfirmPin] = useState('');

  // Admin Login State
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Teacher / Moderator Login State
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');

  const {
    loginStudent,
    registerStudent,
    loginTeacher,
    loginAdmin,
    authError,
    setAuthError
  } = useAuth();

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const res = loginStudent(studentId, privatePin);
    if (res.success) {
      onClose();
      if (onLoginSuccess) onLoginSuccess('student');
    }
  };

  const handleTeacherSubmit = (e) => {
    e.preventDefault();
    const res = loginTeacher(teacherEmail, teacherPassword);
    if (res.success) {
      onClose();
      if (onLoginSuccess) onLoginSuccess('teacher');
    }
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (regPin !== regConfirmPin) {
      setAuthError('รหัสผ่านเฉพาะตัว (Private PIN) ทั้งสองช่องไม่ตรงกัน');
      return;
    }
    if (regPin.length < 4) {
      setAuthError('Private PIN ควรมีความยาวอย่างน้อย 4 ตัวอักษร/ตัวเลข');
      return;
    }

    const res = registerStudent({
      studentId: regStudentId,
      name: regName,
      school: 'โรงเรียนบรรหารแจ่มใสวิทยา 3',
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="เข้าสู่ระบบ Math Olympiad Hub" maxWidth="max-w-lg">
      {/* 4-Tab Switcher */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-[#0B192C]/80 p-1.5 rounded-xl border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => { setTab('student'); setAuthError(null); }}
          className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            tab === 'student'
              ? 'bg-[#008DDA] text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-3.5 h-3.5" /> นักเรียน
        </button>

        <button
          type="button"
          onClick={() => { setTab('register'); setAuthError(null); }}
          className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            tab === 'register'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UserPlus className="w-3.5 h-3.5" /> สมัครใหม่
        </button>

        <button
          type="button"
          onClick={() => { setTab('teacher'); setAuthError(null); }}
          className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            tab === 'teacher'
              ? 'bg-indigo-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" /> ครู/กรรมการ
        </button>

        <button
          type="button"
          onClick={() => { setTab('admin'); setAuthError(null); }}
          className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
            tab === 'admin'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-3.5 h-3.5" /> แอดมิน
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
              <span className="font-bold">ระบบยืนยันตัวตนนักเรียน โรงเรียนบรรหารแจ่มใสวิทยา 3:</span>
              <p className="text-[11px] text-cyan-300/80 mt-0.5">
                กรอกเลขประจำตัวนักเรียนและรหัสผ่านเฉพาะตัว (Private PIN) ที่ท่านตั้งไว้เพื่อเข้าใช้งาน
              </p>
            </div>
          </div>

          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                เลขประจำตัวนักเรียน (Student ID)
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008DDA]" />
                <input
                  type="text"
                  required
                  placeholder="เช่น STU-2026-001"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#008DDA] focus:ring-1 focus:ring-[#008DDA] transition-all text-sm uppercase font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                รหัสผ่านเฉพาะตัว (Private PIN / Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008DDA]" />
                <input
                  type="password"
                  required
                  placeholder="กรอกรหัสผ่านเฉพาะตัวของคุณ"
                  value={privatePin}
                  onChange={(e) => setPrivatePin(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#008DDA] focus:ring-1 focus:ring-[#008DDA] transition-all text-sm font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#008DDA] to-blue-600 text-white font-bold text-sm hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบ <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {tab === 'register' && (
        /* New Student Registration Form */
        <div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-200 text-xs mb-4 flex items-start gap-2">
            <UserPlus className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ลงทะเบียนนักเรียนใหม่ (โรงเรียนบรรหารแจ่มใสวิทยา 3):</span>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                บันทึกข้อมูลประจำตัวนักเรียนและตั้งรหัสผ่านเฉพาะตัวเพื่อเข้าใช้งานระบบ
              </p>
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">เลขประจำตัวนักเรียน:</label>
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

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ระดับชั้น / ห้อง:</label>
              <input
                type="text"
                required
                placeholder="เช่น ม.4/1"
                value={regGrade}
                onChange={(e) => setRegGrade(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#0B192C] border border-slate-700 text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">ตั้งรหัสผ่านเฉพาะตัว (PIN):</label>
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
                <label className="block text-slate-300 font-semibold mb-1">ยืนยันรหัสผ่านอีกครั้ง:</label>
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

      {tab === 'teacher' && (
        /* Teacher / Moderator Login Form */
        <div>
          <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-200 text-xs mb-4 flex items-start gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ระบบครูผู้ดูแล / กรรมการการแข่งขัน (Teacher Supervision):</span>
              <p className="text-[11px] text-indigo-300/80 mt-0.5">
                จำกัดเฉพาะครูกลุ่มสาระฯ คณิตศาสตร์ และกรรมการกลาง โรงเรียนบรรหารแจ่มใสวิทยา 3 ที่ได้รับอนุมัติใน Whitelist เท่านั้น (ห้ามบุคคลภายนอกหรือนักเรียนแอบอ้าง)
              </p>
            </div>
          </div>

          <form onSubmit={handleTeacherSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                อีเมลครูผู้ดูแล / กรรมการ (Teacher Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="email"
                  required
                  placeholder="เช่น teacher.math@banharn3.ac.th"
                  value={teacherEmail}
                  onChange={(e) => setTeacherEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={teacherPassword}
                  onChange={(e) => setTeacherPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold text-sm hover:from-indigo-500 hover:to-blue-500 shadow-lg shadow-indigo-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบครู / กรรมการ <GraduationCap className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {tab === 'admin' && (
        /* Admin Login Form with Whitelist Notice (No demo shortcuts) */
        <div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ระบบจำกัดสิทธิ์ผู้สร้างระบบ (Strict Admin RBAC):</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                จำกัดสิทธิ์เข้าใช้งานเฉพาะ 2 บัญชีผู้สร้างระบบที่กำหนดไว้ใน Whitelist เท่านั้น ระบบจะตรวจสอบสิทธิ์และปฏิเสธบัญชีอื่นทั้งหมด
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                อีเมลแอดมิน (Whitelisted Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="email"
                  required
                  placeholder="ระบุอีเมลแอดมินที่ได้รับอนุญาต"
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
        </div>
      )}
    </Modal>
  );
}
