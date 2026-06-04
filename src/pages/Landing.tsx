import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, Linkedin } from 'lucide-react';
import sageifyLogo from '@/assets/owl-logo.png';
import { ContactModalProvider } from '@/contexts/ContactModalContext';
import { PREVIEW_GAMES } from '@/lib/previewGames';

// Chunky color tokens per game — Duolingo-style cartridge feel
const TILE_COLORS: Record<string, { bg: string; border: string; iconBg: string; tag: string }> = {
  holland:        { bg: '#E3F2FD', border: '#90CAF9', iconBg: '#FFFFFF', tag: '#1976D2' },
  via:            { bg: '#FFF8D6', border: '#F4C430', iconBg: '#FFFFFF', tag: '#A67C00' },
  schein:         { bg: '#E8EEF1', border: '#90A4AE', iconBg: '#FFFFFF', tag: '#455A64' },
  motivation:     { bg: '#E6F4EA', border: '#81C784', iconBg: '#FFFFFF', tag: '#2E7D32' },
  thinking:       { bg: '#FCE4EC', border: '#F48FB1', iconBg: '#FFFFFF', tag: '#C2185B' },
  skills:         { bg: '#FFF1E0', border: '#FFB74D', iconBg: '#FFFFFF', tag: '#E65100' },
  considerations: { bg: '#E0F2F1', border: '#4DB6AC', iconBg: '#FFFFFF', tag: '#00695C' },
  preferences:    { bg: '#EDE7F6', border: '#9575CD', iconBg: '#FFFFFF', tag: '#5E35B1' },
};

const Landing = () => {
  const openContact = () =>
    document.dispatchEvent(new CustomEvent('open-contact-modal'));

  return (
    <ContactModalProvider>
      <div
        dir="rtl"
        className="min-h-screen bg-[#FCF9F1] text-[#2D3A33]"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {/* Nav */}
        <header className="max-w-6xl mx-auto px-4 md:px-6 pt-5 pb-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#E5E5E5] border-b-4 flex items-center justify-center p-1.5">
              <img src={sageifyLogo} alt="" className="w-full h-full object-contain" />
            </div>
            <span
              className="text-2xl font-black tracking-tight text-[#2D3A33]"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sageify
            </span>
          </div>
          <Link
            to="/preview"
            className="hidden sm:inline-flex px-5 py-2.5 rounded-2xl bg-white border-2 border-[#E5E5E5] border-b-4 font-bold text-sm text-[#5C6B63] hover:bg-[#F6F2E8] active:border-b-0 active:translate-y-1 transition-all"
          >
            כנס למרכז המשחקים
          </Link>
        </header>

        {/* Hero */}
        <main className="max-w-6xl mx-auto px-4 md:px-6 pt-8 pb-16">
          <div className="text-center relative">
            {/* Mascot */}
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 180, damping: 14, delay: 0.1 }}
              className="inline-block mb-5"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="w-24 h-24 md:w-32 md:h-32 mx-auto rounded-full bg-[#89A38F] border-4 border-white shadow-[0_8px_0_0_#6E8771] flex items-center justify-center p-3"
              >
                <img src={sageifyLogo} alt="Sageify Owl" className="w-full h-full object-contain" />
              </motion.div>
            </motion.div>

            <span className="inline-block bg-white border-2 border-[#E5E5E5] px-4 py-1.5 rounded-full text-[11px] font-bold text-[#5C6B63] mb-5 tracking-widest">
              🎮 GAME CENTER FOR LIFE 2.0
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-black mb-6 leading-[1.15] tracking-tight max-w-4xl mx-auto"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              הפרק הבא בחיים —{' '}
              <span className="text-[#FF7F50]">בלי שאלונים. עם משחקים.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg md:text-xl text-[#5C6B63] max-w-2xl mx-auto mb-9 leading-relaxed font-medium"
            >
              8 משחקים קצרים. ענן תגיות, גרירה, כרטיסים מתפצחים וצנצנות שמתמלאות.
              בסוף — פרופיל פסיכולוגי מדויק וכיוונים אמיתיים לעשייה.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
            >
              <button
                onClick={openContact}
                className="w-full sm:w-auto px-10 py-5 bg-[#FF7F50] text-white text-lg font-extrabold rounded-2xl border-b-[6px] border-[#D65F36] hover:brightness-105 active:border-b-0 active:translate-y-1.5 transition-all"
              >
                רכישה — השאירו פרטים
              </button>
              <Link
                to="/preview"
                className="w-full sm:w-auto px-10 py-5 bg-white text-[#5C6B63] text-lg font-extrabold rounded-2xl border-2 border-[#E5E5E5] border-b-[6px] hover:bg-[#F6F2E8] active:border-b-0 active:translate-y-1.5 transition-all"
              >
                שחקו דמו חינם
              </Link>
            </motion.div>
          </div>

          {/* Games grid — chunky cartridges */}
          <div className="mt-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {PREVIEW_GAMES.map((p, i) => {
              const c = TILE_COLORS[p.id] ?? TILE_COLORS.holland;
              return (
                <motion.div
                  key={p.path}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
                >
                  <Link
                    to={p.path}
                    className="group block p-5 rounded-[1.75rem] border-2 transition-all duration-200 hover:-translate-y-1 active:translate-y-0.5"
                    style={{
                      background: c.bg,
                      borderColor: c.border,
                      boxShadow: `0 6px 0 0 ${c.border}`,
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span
                        className="text-xs font-black tracking-widest"
                        style={{ color: c.tag, opacity: 0.7 }}
                      >
                        #{String(i + 1).padStart(2, '0')}
                      </span>
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300"
                        style={{ background: c.iconBg }}
                      >
                        {p.emoji}
                      </div>
                    </div>
                    <p
                      className="text-[11px] font-extrabold tracking-wider uppercase mb-1"
                      style={{ color: c.tag }}
                    >
                      {p.style}
                    </p>
                    <h3
                      className="text-2xl font-black mb-2 text-[#2D3A33]"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {p.title}
                    </h3>
                    <p className="text-sm text-[#5C6B63] leading-snug mb-4 min-h-[2.5rem]">
                      {p.tagline}
                    </p>
                    <div
                      className="flex items-center justify-between pt-3 border-t-2 border-dashed"
                      style={{ borderColor: `${c.border}80` }}
                    >
                      <span className="text-xs font-bold text-[#5C6B63]">
                        ⏱ {p.minutes}
                      </span>
                      <span
                        className="text-sm font-black opacity-70 group-hover:opacity-100 transition-opacity"
                        style={{ color: c.tag }}
                      >
                        שחק ←
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Trust chips */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🎮', title: 'משחקים, לא שאלונים', desc: 'גרירה, כרטיסים, צנצנות וסליידרים' },
              { icon: '🧠', title: 'פסיכולוגיה מקצועית', desc: 'מאחורי כל משחק — כלי אבחון מוכח' },
              { icon: '🎯', title: 'כיוונים אמיתיים', desc: 'פרופיל אישי + לידים חיים בישראל' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-white border-2 border-[#E5E5E5] border-b-4 text-center"
              >
                <div className="text-4xl mb-3">{s.icon}</div>
                <p
                  className="font-black text-lg text-[#2D3A33] mb-1"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {s.title}
                </p>
                <p className="text-sm text-[#5C6B63] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Final CTA — dark mascot card */}
          <div className="mt-16 relative overflow-hidden rounded-[2.5rem] bg-[#2D4139] border-2 border-[#1F2E29] border-b-8 p-10 md:p-14 text-center text-white">
            <div className="absolute -right-12 -bottom-12 opacity-10 pointer-events-none">
              <img src={sageifyLogo} alt="" className="w-72 h-72 object-contain" />
            </div>
            <div className="relative z-10">
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#89A38F] border-4 border-white shadow-[0_6px_0_0_#6E8771] flex items-center justify-center p-2">
                <img src={sageifyLogo} alt="" className="w-full h-full object-contain" />
              </div>
              <h2
                className="text-3xl md:text-5xl font-black mb-4 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                מוכנים לגלות את הפרק הבא?
              </h2>
              <p className="text-base md:text-lg text-white/85 max-w-xl mx-auto mb-8 leading-relaxed font-medium">
                השאירו פרטים — נחזור אליכם תוך 24 שעות עם גישה אישית למרכז המשחקים.
              </p>
              <button
                onClick={openContact}
                className="px-12 py-5 bg-[#FF7F50] text-white text-xl font-black rounded-2xl border-b-[6px] border-[#D65F36] hover:brightness-105 active:border-b-0 active:translate-y-1.5 transition-all"
              >
                רכישה — השאירו פרטים
              </button>
            </div>
          </div>
        </main>

        <footer className="py-6 px-6 border-t border-[#E5E5E5]/60">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-[#5C6B63]">
            <span>© {new Date().getFullYear()} Sageify</span>
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/company/sageify"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-[#2D3A33] transition-colors"
              >
                <Linkedin size={12} /> LinkedIn
              </a>
              <Link
                to="/admin-panel"
                className="inline-flex items-center gap-1 hover:text-[#2D3A33] transition-colors"
              >
                <Settings size={11} /> ניהול
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ContactModalProvider>
  );
};

export default Landing;
