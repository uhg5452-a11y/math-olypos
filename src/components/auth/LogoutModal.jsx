import React from 'react';
import { LogOut, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';

export default function LogoutModal({ isOpen, onClose, onConfirm, userName }) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ยืนยันการออกจากระบบ" maxWidth="max-w-md">
      <div className="text-center py-4 space-y-4">
        {/* Warning Icon with Glow */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20 animate-pulse">
          <LogOut className="w-8 h-8" />
        </div>

        <div>
          <h3 className="text-lg font-black text-white">
            คุณต้องการออกจากระบบหรือไม่?
          </h3>
          {userName && (
            <p className="text-xs text-cyan-300 font-semibold mt-1">
              บัญชีผู้ใช้งาน: {userName}
            </p>
          )}
          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            เมื่อออกจากระบบแล้ว คุณจะต้องใช้ <strong className="text-white">เลขประจำตัวนักเรียน</strong> และ <strong className="text-white">รหัสผ่านเฉพาะตัว (Private PIN)</strong> เพื่อเข้าสู่ระบบในครั้งถัดไป
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-4 h-4" /> ยืนยันออกจากระบบ
          </button>
        </div>
      </div>
    </Modal>
  );
}
