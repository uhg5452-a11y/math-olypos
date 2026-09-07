import React, { useState } from 'react';
import { User, Lock, Mail, Shield, AlertCircle, ArrowRight, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Modal from '../common/Modal';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [tab, setTab] = useState('student'); // 'student' or 'admin'
  const [studentId, setStudentId] = useState('');
  const [studentPassword, setStudentPassword] = useState('');

  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const { loginStudent, loginAdmin, switchDemoUser, authError, setAuthError, adminAccounts } = useAuth();

  const handleStudentSubmit = (e) => {
    e.preventDefault();
    const res = loginStudent(studentId, studentPassword);
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
    <Modal isOpen={isOpen} onClose={onClose} title="เข้าสู่ระบบ Math Olympiad Hub" maxWidth="max-w-lg">
      {/* Tab Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-[#0B192C]/80 p-1.5 rounded-xl border border-white/10 mb-6">
        <button
          type="button"
          onClick={() => { setTab('student'); setAuthError(null); }}
          className={`py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            tab === 'student'
              ? 'bg-[#008DDA] text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <User className="w-4 h-4" /> สำหรับนักเรียน
        </button>
        <button
          type="button"
          onClick={() => { setTab('admin'); setAuthError(null); }}
          className={`py-2.5 px-4 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
            tab === 'admin'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Shield className="w-4 h-4" /> สำหรับแอดมิน (2 บัญชี)
        </button>
      </div>

      {authError && (
        <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span>{authError}</span>
        </div>
      )}

      {tab === 'student' ? (
        /* Student Login Form */
        <div>
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
                รหัสผ่าน (Password)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#008DDA]" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={studentPassword}
                  onChange={(e) => setStudentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0B192C]/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-[#008DDA] focus:ring-1 focus:ring-[#008DDA] transition-all text-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#008DDA] to-blue-600 text-white font-bold text-sm hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-blue-500/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
            >
              เข้าสู่ระบบนักเรียน <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Selector for Students */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-400 font-medium mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-[#008DDA]" /> ทดสอบเข้าสู่ระบบด่วน (Demo Students):
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStudentLogin(0)}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#008DDA]/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-white">วรเมธ ปัญญาวงศ์</div>
                <div className="text-[11px] text-[#008DDA] font-mono">STU-2026-001 (เตรียมอุดมฯ)</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickStudentLogin(1)}
                className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#008DDA]/40 text-left transition-all"
              >
                <div className="text-xs font-bold text-white">กานต์รวี เจริญศิลป์</div>
                <div className="text-[11px] text-[#008DDA] font-mono">STU-2026-002 (มหิดลวิทย์ฯ)</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Admin Login Form */
        <div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs mb-4 flex items-start gap-2">
            <Shield className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <span className="font-bold">ระบบจำกัดสิทธิ์แอดมิน (RBAC):</span>
              <p className="text-[11px] text-amber-300/80 mt-0.5">
                ระบบเปิดให้เฉพาะ 2 บัญชีที่ลงทะเบียนในโครงสร้างระบบเท่านั้น เมื่อล็อกอินจะถูกนำทางไปยัง Admin Dashboard ทันที
              </p>
            </div>
          </div>

          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                อีเมลแอดมิน (Admin Email)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
                <input
                  type="email"
                  required
                  placeholder="เช่น admin1@matholympiad.org"
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

          {/* Quick Demo Selector for the 2 Admins */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <p className="text-xs text-slate-400 font-medium mb-2.5 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-amber-400" /> ทดสอบเข้าสู่ระบบ 2 แอดมิน (Authorized Admins):
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
                  <div className="text-[10px] text-amber-400/80 mt-0.5">สิทธิ์: {admin.badge}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
