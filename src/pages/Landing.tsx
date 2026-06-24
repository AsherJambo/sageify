import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Settings,
  Linkedin,
  Gamepad2,
  Brain,
  Target,
  Sparkles,
  Compass,
  Handshake,
  FileText,
  Trophy,
  Heart,
  ArrowLeft,
  MessageCircle,
  Phone,
} from 'lucide-react';
import sageifyLogo from '@/assets/owl-logo.png';
import owlVideo from '@/assets/owl-guide.mp4.asset.json';
import { ContactModalProvider } from '@/contexts/ContactModalContext';

/**
 * Landing — "Owl Forest" identity.
 * Playful cartoon language for a wise career-guidance owl: cream canvas, deep forest ink,
 * amber XP, coral CTAs. Chunky bottom-shadow buttons, rounded blobs, friendly chips.
 * Built for ages 60-80: 18px+ text, 56px+ tap targets, AAA contrast.
 */
const Landing = () => {
  const openContact = () =>
    document.dispatchEvent(new CustomEvent('open-contact-modal'));

  return (
    <ContactModalProvider>
      <div dir="rtl" className="min-h-screen flex flex-col relative overflow-hidden bg-background text-foreground">
        {/* Cozy ambient blobs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -top-32 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/25 blur-3xl" />
          <div className="absolute top-1/3 -left-24 w-[24rem] h-[24rem] rounded-full bg-sage/25 blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-[20rem] h-[20rem] rounded-full bg-coral/15 blur-3xl" />
        </div>

        {/* Nav */}
        <header className="sticky top-0 z-30 backdrop-blur-md bg-background/70 border-b border-border/60">
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center p-1.5 bg-card border-2 border-foreground/10"
                style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.10)' }}>
                <img src={sageifyLogo} alt="" className="w-full h-full object-contain" />
              </div>
              <span className="text-3xl font-serif text-foreground leading-none">Sageify</span>
            </div>
            <span className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-sage/15 text-foreground border-2 border-sage/40">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              סגי' מחכה לך
            </span>
          </div>
        </header>

        {/* Hero */}
        <main className="relative flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-10 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Copy (right, RTL) */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-accent/20 text-foreground border-2 border-accent/50"
            >
              <Sparkles size={16} className="text-accent-foreground" />
              הפרק החדש מתחיל כאן
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-5xl md:text-6xl lg:text-7xl mt-6 mb-6 leading-[1.05]"
            >
              ינשוף חכם.
              <br />
              <span className="text-accent-foreground" style={{ color: 'hsl(var(--accent))' }}>
                כיוון אמיתי.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl mb-9 leading-relaxed max-w-xl mx-auto lg:mx-0 text-foreground/75"
            >
              סגי – הינשוף המנטור שלך – מזמין אותך ל-8 משחקים קצרים, חווייתיים ובלי ציונים,
              שיחשפו את החוזקות, המניעים והכיוון התעסוקתי הבא בחיים שלך. בלי שאלונים משעממים
              ובלי מבחנים מלחיצים. רק גילוי נטו.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4"
            >
              <button
                onClick={openContact}
                className="group relative w-full sm:w-auto px-10 py-5 text-lg font-bold rounded-2xl bg-destructive text-destructive-foreground border-2 border-foreground/15 transition-all duration-300 ease-out hover:-translate-y-1 hover:brightness-105 active:translate-y-1 active:shadow-none focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/50"
                style={{
                  minHeight: 60,
                  boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.85)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  בואו נתחיל את המסע
                  <ArrowLeft size={20} className="transition-transform duration-300 ease-out group-hover:-translate-x-1.5" />
                </span>
              </button>
              <Link
                to="/preview"
                className="w-full sm:w-auto px-10 py-5 text-lg font-bold rounded-2xl bg-card text-foreground border-2 border-foreground/15 transition-all duration-150 hover:-translate-y-0.5 active:translate-y-1 active:shadow-none text-center"
                style={{
                  minHeight: 60,
                  boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.18)',
                }}
              >
                שחקו דמו חינם
              </Link>
            </motion.div>

            {/* Trust pills — XP style */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 grid grid-cols-3 gap-3"
            >
              {[
                { icon: Gamepad2, label: 'משחקים, לא שאלונים', tone: 'bg-sky-soft border-sky/40' },
                { icon: Brain, label: 'פסיכולוגיה מקצועית', tone: 'bg-success-soft border-success/40' },
                { icon: Target, label: 'כיוונים אמיתיים', tone: 'bg-accent/20 border-accent/50' },
              ].map(({ icon: Icon, label, tone }, i) => (
                <div key={i} className={`rounded-2xl px-3 py-4 flex flex-col items-center gap-2 text-center border-2 ${tone}`}>
                  <Icon size={22} className="text-foreground" strokeWidth={2.2} />
                  <span className="text-[13px] font-semibold text-foreground/85 leading-tight">{label}</span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Owl video — friendly cartoon frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Sun halo */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full blur-2xl"
                style={{ background: 'radial-gradient(circle, hsl(36 80% 57% / 0.45), transparent 70%)' }}
              />
              {/* Friendly blob frame */}
              <div
                className="relative w-full h-full overflow-hidden border-[5px] border-foreground/90 bg-card"
                style={{
                  borderRadius: '58% 42% 55% 45% / 50% 55% 45% 50%',
                  boxShadow: '0 10px 0 0 hsl(var(--foreground) / 0.85), 0 30px 60px -20px hsl(var(--foreground) / 0.40)',
                }}
              >
                <video
                  src={owlVideo.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Floating XP coin */}
              <motion.div
                animate={{ y: [0, -10, 0], rotate: [-4, 4, -4] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-2 -right-2 rounded-full px-4 py-3 text-sm font-bold flex items-center gap-2 bg-accent text-foreground border-[3px] border-foreground/90"
                style={{ boxShadow: '0 5px 0 0 hsl(var(--foreground) / 0.85)' }}
              >
                <Trophy size={18} strokeWidth={2.4} />
                +250 XP
              </motion.div>
              {/* Floating heart */}
              <motion.div
                animate={{ y: [0, 8, 0], rotate: [3, -3, 3] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -bottom-2 -left-2 rounded-full px-4 py-3 text-sm font-bold flex items-center gap-2 bg-destructive text-destructive-foreground border-[3px] border-foreground/90"
                style={{ boxShadow: '0 5px 0 0 hsl(var(--foreground) / 0.85)' }}
              >
                <Heart size={18} strokeWidth={2.4} fill="currentColor" />
                בלי לחץ
              </motion.div>
              {/* Speech bubble */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                className="absolute top-6 -left-6 lg:-left-12 bg-card border-2 border-foreground/15 rounded-2xl rounded-bl-sm px-4 py-2 text-sm font-semibold max-w-[160px] hidden md:block"
                style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.15)' }}
              >
                שלום! אני סגי' 🦉
              </motion.div>
            </div>
          </motion.div>
        </main>

        {/* Journey — playful path */}
        <section className="relative max-w-6xl mx-auto w-full px-4 md:px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] p-6 md:p-10 bg-card border-2 border-foreground/10"
            style={{ boxShadow: '0 8px 0 0 hsl(var(--foreground) / 0.10)' }}
          >
            <div className="text-center mb-10">
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-sage/15 text-foreground border-2 border-sage/40">
                <Compass size={16} />
                המסע שלכם — צעד אחר צעד
              </span>
              <h2 className="font-serif text-4xl md:text-5xl mt-4 mb-3 leading-tight">
                גילוי דיגיטלי <span style={{ color: 'hsl(var(--accent))' }}>+</span> ייעוץ אנושי
              </h2>
              <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto text-foreground/75">
                שני חלקים, חוויה אחת. סגי' חוקר איתכם — ואז יועצ.ת תעסוקתי.ת מומחה.ית לעבודה אחרי פרישה
                מתרגמ.ת את התובנות לתוכנית פעולה אישית.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <JourneyCard
                step="01"
                title="המשחקים עם סגי'"
                icon={<Gamepad2 size={26} strokeWidth={2.2} />}
                tint="bg-accent/20 border-accent/50"
                pillTint="bg-accent text-foreground"
              >
                8 משחקים קצרים ושיחה חמה חושפים את החוזקות, המניעים והכיוונים שלכם — ויוצרים את
                <strong className="font-bold"> דוח האינטייק </strong> האישי.
              </JourneyCard>
              <JourneyCard
                step="02"
                title="הפגישה האנושית"
                icon={<Handshake size={26} strokeWidth={2.2} />}
                tint="bg-coral-soft border-coral/50"
                pillTint="bg-destructive text-destructive-foreground"
              >
                יועצ.ת מומחה.ית מקבל.ת את הדוח מראש, ומלווה אתכם לבניית
                <strong className="font-bold"> תוכנית פעולה מנטלית ופרקטית</strong> מותאמת.
              </JourneyCard>
            </div>

            {/* Outcome strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm font-semibold text-foreground/75">
              {[
                { icon: Gamepad2, label: 'גילוי' },
                { icon: FileText, label: 'דוח אינטייק' },
                { icon: Handshake, label: 'פגישה' },
              ].map(({ icon: Icon, label }, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-secondary border-2 border-foreground/10">
                    <Icon size={15} strokeWidth={2.2} />
                    {label}
                  </span>
                  <ArrowLeft size={14} className="text-foreground/40" />
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full font-bold bg-accent text-foreground border-2 border-foreground/15"
                style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.85)' }}>
                <Target size={15} strokeWidth={2.4} />
                תוכנית פעולה
              </span>
            </div>
          </motion.div>
        </section>

        <footer className="relative py-6 px-6 border-t border-border/60">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-foreground/65">
            <span>© {new Date().getFullYear()} Sageify</span>
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/company/sageify"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Linkedin size={15} /> LinkedIn
              </a>
              <Link
                to="/admin-panel"
                className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Settings size={15} /> ניהול
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ContactModalProvider>
  );
};

const JourneyCard = ({
  step,
  title,
  icon,
  children,
  tint,
  pillTint,
}: {
  step: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  tint: string;
  pillTint: string;
}) => (
  <div
    className={`group relative rounded-[1.75rem] p-6 text-right border-2 transition-all duration-200 hover:-translate-y-1 ${tint}`}
    style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.12)' }}
  >
    <div className="flex items-start gap-4 mb-3">
      <div className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center border-2 border-foreground/15 ${pillTint}`}
        style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.20)' }}>
        {icon}
      </div>
      <div className="flex-1">
        <span className="text-xs font-bold tracking-widest text-foreground/55">{step}</span>
        <h3 className="font-serif text-2xl md:text-3xl leading-tight mt-1">{title}</h3>
      </div>
    </div>
    <p className="text-base md:text-lg leading-relaxed text-foreground/80">{children}</p>
  </div>
);

export default Landing;
