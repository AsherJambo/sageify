import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Settings, Linkedin } from 'lucide-react';
import sageifyLogo from '@/assets/owl-logo.png';
import { ContactModalProvider } from '@/contexts/ContactModalContext';
import { PREVIEW_GAMES } from '@/lib/previewGames';

const Landing = () => {
  const openContact = () =>
    document.dispatchEvent(new CustomEvent('open-contact-modal'));

  return (
    <ContactModalProvider>
      <div
        dir="rtl"
        className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/5 flex flex-col"
      >
        {/* Top nav */}
        <header className="px-6 pt-6 flex items-center justify-between max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2">
            <img src={sageifyLogo} alt="Sageify" className="w-9 h-9 rounded-lg" />
            <span className="font-display font-bold text-lg">Sageify</span>
          </div>
          <Link
            to="/preview"
            className="text-xs md:text-sm font-semibold text-secondary hover:opacity-80 transition-opacity inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-secondary/10"
          >
            🎮 כנס למרכז המשחקים
          </Link>
        </header>

        {/* Hero */}
        <section className="flex-1 px-6 pt-10 pb-6 max-w-6xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-[11px] font-bold tracking-widest text-secondary uppercase mb-4 px-3 py-1 rounded-full bg-secondary/10">
              🎮 Game Center for Life 2.0
            </span>
            <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold text-foreground leading-[1.15] tracking-tight mb-4">
              הפרק הבא בחיים —{' '}
              <span className="text-secondary">בלי שאלונים. עם משחקים.</span>
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-7">
              8 משחקים קצרים. ענן תגיות, גרירה, כרטיסים מתפצחים וצנצנות שמתמלאות.
              בסוף — פרופיל פסיכולוגי מדויק וכיוונים אמיתיים לעשייה.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={openContact}
                className="px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                רכישה — השאירו פרטים ✨
              </button>
              <Link
                to="/preview"
                className="px-6 py-3 rounded-xl bg-background border border-border text-foreground font-semibold text-sm hover:border-secondary/40 hover:bg-secondary/5 transition-all"
              >
                שחקו דמו חינם ←
              </Link>
            </div>
          </motion.div>

          {/* Games grid — same language as the hub */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            {PREVIEW_GAMES.map((p, i) => (
              <motion.div
                key={p.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.1 + i * 0.05 }}
              >
                <Link
                  to={p.path}
                  className={`group block h-full p-4 rounded-2xl bg-gradient-to-br ${p.tone} border border-border/60 hover:border-secondary/40 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="text-3xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                      {p.emoji}
                    </div>
                    <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                      #{String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <p className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase mb-0.5">
                    {p.style}
                  </p>
                  <h3 className="font-display text-base font-bold text-foreground mb-1">
                    {p.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                    {p.tagline}
                  </p>
                  <div className="mt-2 text-[11px] font-medium text-muted-foreground">
                    ⏱ {p.minutes}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* How it works — 3 chips */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-3 text-center"
          >
            {[
              { icon: '🎮', title: 'משחקים, לא שאלונים', desc: 'גרירה, כרטיסים, צנצנות וסליידרים זורמים' },
              { icon: '🧠', title: 'פסיכולוגיה מדויקת', desc: 'מאחורי כל משחק — כלי אבחון מקצועי מוכח' },
              { icon: '🎯', title: 'כיוונים אמיתיים', desc: 'פרופיל אישי + לידים חיים בישראל' },
            ].map((s, i) => (
              <div
                key={i}
                className="p-5 rounded-2xl bg-card border border-border/60 hover:border-secondary/30 transition-all"
              >
                <div className="text-3xl mb-2">{s.icon}</div>
                <p className="font-display font-bold text-base text-foreground mb-1">
                  {s.title}
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-12 text-center"
          >
            <div className="inline-flex flex-col items-center gap-3 p-7 rounded-3xl bg-gradient-to-br from-secondary/10 to-accent/10 border border-secondary/20">
              <p className="font-display text-xl md:text-2xl font-bold text-foreground">
                מוכנים להתחיל את הפרק הבא?
              </p>
              <p className="text-sm md:text-base text-muted-foreground max-w-md">
                השאירו פרטים — נחזור אליכם תוך 24 שעות עם גישה אישית.
              </p>
              <button
                onClick={openContact}
                className="mt-1 px-8 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 hover:scale-[1.02] transition-all duration-300 shadow-lg"
              >
                רכישה — השאירו פרטים ✨
              </button>
            </div>
          </motion.div>
        </section>

        <footer className="py-6 px-6 border-t border-border/20">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>© {new Date().getFullYear()} Sageify</span>
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/company/sageify"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <Linkedin size={12} /> LinkedIn
              </a>
              <Link
                to="/admin-panel"
                className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
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
