import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useTournament } from '../../context/TournamentContext';

export default function NotificationToast() {
  const { activeToast, closeToast } = useTournament();

  if (!activeToast) return null;

  const { message, type } = activeToast;

  const getStyle = () => {
    switch (type) {
      case 'success':
        return {
          border: 'border-emerald-500/40',
          bg: 'bg-emerald-950/90',
          text: 'text-emerald-200',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
        };
      case 'warning':
        return {
          border: 'border-amber-500/50',
          bg: 'bg-[#1e1c0c]/95',
          text: 'text-amber-200',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 animate-bounce" />
        };
      case 'error':
        return {
          border: 'border-rose-500/40',
          bg: 'bg-rose-950/90',
          text: 'text-rose-200',
          icon: <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
        };
      default:
        return {
          border: 'border-blue-500/40',
          bg: 'bg-slate-900/90',
          text: 'text-blue-200',
          icon: <Bell className="w-5 h-5 text-[#008DDA] flex-shrink-0 animate-pulse" />
        };
    }
  };

  const style = getStyle();

  return (
    <aside aria-label="System Notifications" className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in-up">
      <div className={`flex items-start gap-3 p-4 rounded-xl border ${style.border} ${style.bg} backdrop-blur-xl shadow-2xl box-glow`}>
        {style.icon}
        <div className="flex-1 text-sm leading-relaxed pr-2 font-medium">
          <p className={style.text}>{message}</p>
        </div>
        <button
          onClick={closeToast}
          className="text-slate-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
