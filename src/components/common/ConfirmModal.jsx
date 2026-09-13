import React from 'react';
import { AlertTriangle, AlertCircle, Trash2, CheckCircle2, X } from 'lucide-react';
import Modal from './Modal';

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = 'ยืนยันการทำรายการ',
  message = 'คุณแน่ใจหรือไม่ว่าต้องการดำเนินการนี้?',
  details = null,
  confirmText = 'ยืนยันดำเนินการ',
  cancelText = 'ยกเลิก',
  type = 'danger'
}) {
  if (!isOpen) return null;

  const getTheme = () => {
    switch (type) {
      case 'warning':
        return {
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />,
          iconBg: 'bg-amber-500/20 border-amber-500/40 shadow-amber-500/20',
          btnBg: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black shadow-amber-500/30'
        };
      case 'info':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-[#008DDA]" />,
          iconBg: 'bg-[#008DDA]/20 border-[#008DDA]/40 shadow-blue-500/20',
          btnBg: 'bg-gradient-to-r from-[#008DDA] to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold shadow-blue-500/30'
        };
      case 'danger':
      default:
        return {
          icon: <Trash2 className="w-8 h-8 text-rose-400" />,
          iconBg: 'bg-rose-500/20 border-rose-500/40 shadow-rose-500/20',
          btnBg: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold shadow-rose-600/30'
        };
    }
  };

  const theme = getTheme();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="text-center py-3 space-y-4">
        <div className={`w-16 h-16 rounded-3xl border-2 flex items-center justify-center mx-auto shadow-lg ${theme.iconBg}`}>
          {theme.icon}
        </div>

        <div>
          <h4 className="text-base font-black text-white">
            {message}
          </h4>

          {details && (
            <div className="mt-3 p-3 rounded-xl bg-[#0B192C] border border-white/10 text-left text-xs text-slate-300">
              {details}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-bold transition-all active:scale-95"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 py-2.5 rounded-xl text-xs transition-all shadow-lg active:scale-95 flex items-center justify-center gap-1.5 ${theme.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
