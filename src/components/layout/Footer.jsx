import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0B192C]/95 py-8 text-center text-xs text-slate-400">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-[#008DDA] text-white font-bold flex items-center justify-center text-xs">
            ∑
          </div>
          <span className="font-semibold text-slate-300">
            Math Olympiad Hub © 2026
          </span>
          <span className="text-slate-600">|</span>
          <span>ระบบศูนย์รวมการแข่งขันและฝึกซ้อมคณิตศาสตร์โอลิมปิก</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] text-slate-500">
          <span>React + Tailwind CSS + Firebase/Node.js Architecture</span>
          <span>•</span>
          <span className="text-[#008DDA]">RBAC Dual-Auth Protected</span>
        </div>
      </div>
    </footer>
  );
}
