import React, { useState, useEffect, useRef } from 'react';
import { Eye, Users, MessageSquare, Send, Heart, Flame, Sparkles, X, Clock, Trophy, Award, Shield } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext';

export default function LiveSpectatorModal({ isOpen, onClose, match, tournament }) {
  const { currentUser } = useAuth();
  const [spectatorCount, setSpectatorCount] = useState(38);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'ด.ช. ภานุพงศ์ (ม.3)', text: 'คู่นี้สูสีมากครับ! ตาเดินของฝ่ายน้ำเงินรอบนี้สุดยอดมาก', time: '19:40' },
    { id: 2, sender: 'พิมพ์พิชชา (ม.5)', text: 'พี่กานต์รวีสู้ๆ นะคะ ตัวแทนโรงเรียนเรา! 👏', time: '19:41' },
    { id: 3, sender: 'นายนภนต์ (ม.6)', text: 'การวางสมการตรงกลางกระดานเปิดเกมได้สวยจริงๆ 🔥', time: '19:42' },
    { id: 4, sender: 'อัครวินท์ (ม.4)', text: 'ใครจะเข้าฮอสก่อนกันเนี่ย ลุ้นระทึกมาก 👑', time: '19:43' }
  ]);
  const [newChatText, setNewChatText] = useState('');
  const [reactionCounts, setReactionCounts] = useState({ fire: 24, clap: 36, bulb: 18, trophy: 42 });
  const [liveMoves, setLiveMoves] = useState([
    'เริ่มการแข่งขัน: กรรมการปล่อยเวลา 25:00',
    'ฝ่ายที่ 1 (วรเมธ) เปิดเกมด้วยสมการ 9 + 6 = 15',
    'ฝ่ายที่ 2 (กานต์รวี) วางตัดแนวตั้ง 15 × 2 = 30 (+24 แต้ม)',
    'ฝ่ายที่ 1 คำนวณแก้ทางด้วยเบี้ยพิเศษ 2P',
    'ฝ่ายที่ 2 กำลังคิดตาเดิน...'
  ]);

  const chatEndRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Subtle spectator count fluctuations
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSpectatorCount(c => Math.max(25, c + (Math.floor(Math.random() * 5) - 2)));
    }, 4000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen || !match) return null;

  const player1 = match.player1 || { name: 'ผู้เข้าแข่งขัน 1', school: 'โรงเรียนเตรียมอุดมฯ', score: 385 };
  const player2 = match.player2 || { name: 'ผู้เข้าแข่งขัน 2', school: 'โรงเรียนมหิดลวิทย์ฯ', score: 412 };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const senderName = currentUser ? currentUser.name : 'นักเรียนผู้เข้าชม';
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newMsg = {
      id: Date.now(),
      sender: senderName,
      text: newChatText.trim(),
      time: timeStr
    };

    setChatMessages(prev => [...prev, newMsg]);
    setNewChatText('');
  };

  const handleQuickCheer = (text, reactionKey) => {
    const senderName = currentUser ? currentUser.name : 'นักเรียนผู้เข้าชม';
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: senderName,
      text: text,
      time: timeStr
    }]);

    if (reactionKey) {
      setReactionCounts(prev => ({
        ...prev,
        [reactionKey]: prev[reactionKey] + 1
      }));
    }

    confetti({
      particleCount: 25,
      spread: 50,
      origin: { y: 0.8, x: 0.8 }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />

      <div className="relative w-full max-w-5xl bg-[#0B192C]/95 border-2 border-[#008DDA]/50 rounded-3xl shadow-2xl z-10 flex flex-col max-h-[92vh] overflow-hidden box-glow text-white">
        {/* Top Broadcast Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#1E3E62]/70">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600/30 text-rose-300 border border-rose-500/50 text-xs font-black uppercase tracking-wider animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" /> LIVE BROADCAST
            </span>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                {tournament?.title || 'การแข่งขันคณิตศาสตร์โอลิมปิก'}
              </h3>
              <div className="text-xs text-[#008DDA] font-semibold">
                โต๊ะแข่งขันที่ {match.tableNo} • รหัสแมตช์: {match.matchId} ({tournament?.categoryName || 'การแข่งขันสด'})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/40 border border-white/10 text-xs font-bold text-slate-300">
              <Eye className="w-4 h-4 text-[#008DDA]" />
              <span className="text-white font-mono">{spectatorCount}</span> กำลังชม
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Competitors Versus Bar */}
        <div className="grid grid-cols-3 gap-2 px-6 py-4 bg-gradient-to-r from-blue-950/60 via-[#0B192C] to-indigo-950/60 border-b border-white/10 items-center">
          {/* Player 1 */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#008DDA] flex items-center justify-center text-2xl shadow-lg ring-2 ring-cyan-400">
              🧑‍🎓
            </div>
            <div>
              <div className="text-sm font-black text-white">{player1.name}</div>
              <div className="text-[11px] text-slate-300">{player1.school || 'เตรียมอุดมศึกษา'}</div>
              <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">คะแนน: {player1.score ?? 385}</div>
            </div>
          </div>

          {/* Center Versus & Clock */}
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-amber-300 font-mono text-xs font-bold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 14:28
            </div>
            <div className="text-xs font-bold text-slate-400 tracking-widest uppercase">
              VERSUS
            </div>
            <div className="text-[10px] text-emerald-400 font-medium">กำลังผลัดตาเดิน</div>
          </div>

          {/* Player 2 */}
          <div className="flex items-center justify-end gap-3 text-right">
            <div>
              <div className="text-sm font-black text-white">{player2.name}</div>
              <div className="text-[11px] text-slate-300">{player2.school || 'มหิดลวิทยานุสรณ์'}</div>
              <div className="text-xs font-mono font-bold text-cyan-300 mt-0.5">คะแนน: {player2.score ?? 412}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-amber-600 flex items-center justify-center text-2xl shadow-lg ring-2 ring-amber-400">
              👩‍🎓
            </div>
          </div>
        </div>

        {/* Content Body: Live Game Board Arena + Live Chat Stream */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
          {/* Main Visual Arena (Left 2 cols) */}
          <div className="lg:col-span-2 p-6 flex flex-col justify-between overflow-y-auto bg-[#0B192C]/80 border-r border-white/10">
            {/* Live Visual Simulation Screen */}
            <div className="relative rounded-2xl bg-gradient-to-b from-[#1E3E62]/80 to-[#0B192C] border border-[#008DDA]/40 p-6 shadow-2xl flex flex-col items-center justify-center min-h-[260px] text-center">
              <div className="absolute top-3 left-4 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> ถ่ายทอดภาพสดจากกระดานแข่งขัน
              </div>

              {/* Graphic Simulator Elements */}
              <div className="space-y-4 my-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xl shadow-lg animate-bounce">
                    15
                  </div>
                  <span className="text-2xl font-black text-white">×</span>
                  <div className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xl shadow-lg">
                    2
                  </div>
                  <span className="text-2xl font-black text-white">=</span>
                  <div className="px-4 py-2 rounded-xl bg-emerald-500 text-white font-black text-xl shadow-lg ring-4 ring-emerald-300">
                    30
                  </div>
                </div>

                <p className="text-xs text-slate-300 max-w-md">
                  คู่แข่งขันกำลังวางสมการบนตารางสลับตาเดินอย่างดุเดือด กรรมการควบคุมเวลาอย่างใกล้ชิด
                </p>
              </div>

              {/* Reaction counts floating bar */}
              <div className="flex items-center gap-4 bg-black/40 px-4 py-1.5 rounded-full border border-white/10 text-xs text-slate-300">
                <button
                  onClick={() => handleQuickCheer('🔥 ไฟลุกมากคู่นี้!', 'fire')}
                  className="hover:scale-125 transition-transform flex items-center gap-1 text-amber-400"
                >
                  🔥 {reactionCounts.fire}
                </button>
                <button
                  onClick={() => handleQuickCheer('👏 เล่นได้ยอดเยี่ยม!', 'clap')}
                  className="hover:scale-125 transition-transform flex items-center gap-1 text-emerald-400"
                >
                  👏 {reactionCounts.clap}
                </button>
                <button
                  onClick={() => handleQuickCheer('💡 เหลี่ยมนี้คิดได้ไง สุดยอด!', 'bulb')}
                  className="hover:scale-125 transition-transform flex items-center gap-1 text-cyan-400"
                >
                  💡 {reactionCounts.bulb}
                </button>
                <button
                  onClick={() => handleQuickCheer('🏆 เชียร์คว้าแชมป์ครับ!', 'trophy')}
                  className="hover:scale-125 transition-transform flex items-center gap-1 text-yellow-400"
                >
                  🏆 {reactionCounts.trophy}
                </button>
              </div>
            </div>

            {/* Live Commentary Log */}
            <div className="mt-4 p-4 rounded-xl bg-[#1E3E62]/40 border border-white/5 text-xs space-y-1.5">
              <div className="font-bold text-slate-300 flex items-center gap-1.5 mb-1">
                <Award className="w-3.5 h-3.5 text-[#008DDA]" /> บันทึกการเดินหมาก / ความคืบหน้าสด:
              </div>
              {liveMoves.map((m, idx) => (
                <div key={idx} className="text-slate-400 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#008DDA]"></span>
                  <span>{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live Spectator Cheer & Chat Room (Right col) */}
          <div className="flex flex-col h-full bg-[#0B192C] p-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#008DDA]" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  ห้องแชทส่งกำลังใจเชียร์สด (Live Chat)
                </span>
              </div>
              <span className="text-[10px] text-emerald-400 font-mono">Real-time</span>
            </div>

            {/* Chat message stream */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 min-h-[220px] max-h-[340px]">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-cyan-300 text-[11px]">{msg.sender}</span>
                    <span className="text-[10px] text-slate-500 font-mono">{msg.time}</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{msg.text}</p>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Cheer Chips */}
            <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickCheer('สู้ๆ นะครับตัวแทนโรงเรียน! 👏', 'clap')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#008DDA]/20 border border-white/10 hover:border-[#008DDA]/40 text-slate-300 whitespace-nowrap"
              >
                👏 สู้ๆ นะครับ!
              </button>
              <button
                type="button"
                onClick={() => handleQuickCheer('ตาเดินนี้เฉียบขาดมาก 🔥', 'fire')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/40 text-slate-300 whitespace-nowrap"
              >
                🔥 เฉียบขาดมาก!
              </button>
              <button
                type="button"
                onClick={() => handleQuickCheer('เชียร์สุดใจครับ 🏆', 'trophy')}
                className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-yellow-500/20 border border-white/10 hover:border-yellow-500/40 text-slate-300 whitespace-nowrap"
              >
                🏆 เชียร์สุดใจ!
              </button>
            </div>

            {/* Input Message Form */}
            <form onSubmit={handleSendChat} className="flex items-center gap-2 pt-2 border-t border-white/10">
              <input
                type="text"
                placeholder={currentUser ? 'พิมพ์ข้อความส่งกำลังใจเชียร์...' : 'เข้าสู่ระบบเพื่อแสดงชื่อ หรือพิมพ์เชียร์สดได้เลย'}
                value={newChatText}
                onChange={(e) => setNewChatText(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-white/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#008DDA]"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-[#008DDA] hover:bg-cyan-500 text-white transition-all active:scale-95 shadow"
                title="ส่งข้อความ"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
