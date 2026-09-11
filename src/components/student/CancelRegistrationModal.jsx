import React from 'react';
import { AlertCircle, Trash2, X, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';

export default function CancelRegistrationModal({ isOpen, onClose, onConfirm, tournament }) {
  if (!isOpen || !tournament) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="ยืนยันการยกเลิกการสมัคร" maxWidth="max-w-md">
      <div className="text-center py-4 space-y-4">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
          <Trash2 className="w-8 h-8 text-rose-400 animate-pulse" />
        </div>

        <div>
          <h3 className="text-base font-black text-white">
            คุณแน่ใจหรือไม่ว่าต้องการยกเลิกการสมัคร?
          </h3>
          <div className="mt-2 p-3 rounded-xl bg-[#0B192C] border border-white/10 text-left">
            <div className="text-[11px] text-[#008DDA] font-bold">{tournament.categoryName}</div>
            <div className="text-xs font-bold text-white mt-0.5">{tournament.title}</div>
            <div className="text-[10px] text-slate-400 mt-1">{tournament.roundName}</div>
          </div>
          <p className="text-xs text-rose-300/90 mt-3 leading-relaxed">
            ⚠️ หากยกเลิกแล้ว ที่นั่งของคุณจะถูกปล่อยว่างให้เพื่อนนักเรียนคนอื่นในโรงเรียน และคุณจะต้องสมัครใหม่อีกครั้งหากต้องการเข้าร่วม
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all"
          >
            คงการสมัครไว้
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm(tournament.id);
              onClose();
            }}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white text-xs font-bold shadow-lg shadow-rose-600/30 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> ยืนยันยกเลิกสมัคร
          </button>
        </div>
      </div>
    </Modal>
  );
}
