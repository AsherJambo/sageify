import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, Linkedin } from 'lucide-react';
import sageifyLogo from '@/assets/owl-logo.png';
import owlVideo from '@/assets/owl-guide.mp4.asset.json';
import { ContactModalProvider } from '@/contexts/ContactModalContext';

const Landing = () => {
  const openContact = () =>
    document.dispatchEvent(new CustomEvent('open-contact-modal'));

  return (
    <ContactModalProvider>
      <div
        dir="rtl"
        className="min-h-screen bg-[#FCF9F1] text-[#2D3A33] flex flex-col"
        style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        {/* Nav */}
        <header className="max-w-6xl mx-auto w-full px-4 md:px-6 pt-5 pb-2 flex items-center justify-between gap-3">
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
          <span className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border-2 border-[#E5E5E5] border-b-4 text-[11px] font-black text-[#5C6B63] tracking-widest">
            🎮 GAME CENTER · LIFE 2.0
          </span>
        </header>

        {/* Hero — single screen with running owl video */}
        <main className="flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-10 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Right side (RTL first): Copy + CTA */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-block bg-white border-2 border-[#E5E5E5] px-4 py-1.5 rounded-full text-[11px] font-bold text-[#5C6B63] mb-5 tracking-widest"
            >
              🦉 פגשו את סגי' — המנטור שלכם
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-black mb-5 leading-[1.15] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              הפרק הבא בחיים —{' '}
              <span className="text-[#FF7F50]">סגי' יראה לכם את הדרך.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-lg md:text-xl text-[#5C6B63] mb-8 leading-relaxed font-medium max-w-xl mx-auto lg:mx-0"
            >
              סגי' הוא המדריך החכם שלכם — דרך 8 משחקים קצרים ומהנים הוא יחשוף
              איפה החוזקות שלכם, מה באמת מניע אתכם, ויכוון אתכם לכיוון התעסוקתי
              הבא בחיים.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-3"
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

            {/* Mini trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-2 text-xs font-bold text-[#5C6B63]"
            >
              <span className="px-3 py-1.5 rounded-full bg-white border-2 border-[#E5E5E5]">🎮 משחקים, לא שאלונים</span>
              <span className="px-3 py-1.5 rounded-full bg-white border-2 border-[#E5E5E5]">🧠 פסיכולוגיה מקצועית</span>
              <span className="px-3 py-1.5 rounded-full bg-white border-2 border-[#E5E5E5]">🎯 כיוונים אמיתיים</span>
            </motion.div>
          </div>

          {/* Left side: Owl video */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Glow halo */}
              <div className="absolute inset-0 rounded-full bg-[#89A38F]/25 blur-3xl scale-90" />
              {/* Video frame — chunky duo-style */}
              <div className="relative w-full h-full rounded-[2.5rem] bg-[#89A38F] border-4 border-white shadow-[0_12px_0_0_#6E8771] overflow-hidden">
                <video
                  src={owlVideo.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Floating chips */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-4 -right-4 bg-white px-4 py-2 rounded-2xl border-2 border-[#E5E5E5] border-b-4 text-sm font-black text-[#2D3A33] shadow-md"
              >
                ✨ זה הזמן שלך
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-4 -left-4 bg-[#FF7F50] px-4 py-2 rounded-2xl border-2 border-[#D65F36] border-b-4 text-sm font-black text-white shadow-md"
              >
                🎯 כיוון חדש
              </motion.div>
            </div>
          </motion.div>
        </main>

        {/* Human consultation — the next step after the game */}
        <section className="max-w-6xl mx-auto w-full px-4 md:px-6 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-[2rem] border-2 border-[#E5E5E5] border-b-[6px] p-6 md:p-10 shadow-sm"
          >
            <div className="grid md:grid-cols-[auto,1fr,auto] items-center gap-6 md:gap-8">
              {/* Step badge */}
              <div className="flex md:flex-col items-center md:items-start gap-3">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#FFF1EA] text-[#D65F36] text-[11px] font-black tracking-widest">
                  STEP 2 · המענה האנושי
                </span>
                <div className="w-16 h-16 rounded-2xl bg-[#89A38F] border-2 border-white shadow-[0_6px_0_0_#6E8771] flex items-center justify-center text-3xl">
                  🤝
                </div>
              </div>

              {/* Copy */}
              <div className="text-center md:text-right">
                <h2
                  className="text-2xl md:text-3xl font-black text-[#2D3A33] mb-3 leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  בהמשך למשחק — פגישה אישית עם יועץ.ת תעסוקתי.ת
                </h2>
                <p className="text-base md:text-lg text-[#5C6B63] leading-relaxed font-medium">
                  פגישת ייעוץ ממוקדת של <span className="font-black text-[#2D3A33]">45 דקות</span>.
                  היועץ/ת מקבל/ת את <span className="font-black text-[#2D3A33]">דוח האינטייק</span> שיצרתם עם סגי מראש,
                  ועוזר/ת לכם לתרגם את הנתונים היבשים ל<span className="font-black text-[#2D3A33]">תוכנית פעולה מנטלית ופרקטית</span> מותאמת אישית.
                </p>
                {/* Mini journey strip */}
                <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2 text-xs font-bold text-[#5C6B63]">
                  <span className="px-3 py-1.5 rounded-full bg-[#FCF9F1] border border-[#E5E5E5]">🎮 משחקים עם סגי</span>
                  <span className="text-[#89A38F]">←</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#FCF9F1] border border-[#E5E5E5]">📄 דוח אינטייק</span>
                  <span className="text-[#89A38F]">←</span>
                  <span className="px-3 py-1.5 rounded-full bg-[#FFF1EA] border border-[#FFD6C2] text-[#D65F36]">🤝 פגישת ייעוץ 45'</span>
                </div>
              </div>

              {/* CTA */}
              <div className="flex md:justify-end">
                <button
                  onClick={openContact}
                  className="w-full md:w-auto px-8 py-4 bg-[#FF7F50] text-white text-base font-extrabold rounded-2xl border-b-[6px] border-[#D65F36] hover:brightness-105 active:border-b-0 active:translate-y-1.5 transition-all whitespace-nowrap"
                >
                  קבעו פגישת ייעוץ
                </button>
              </div>
            </div>
          </motion.div>
        </section>



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
