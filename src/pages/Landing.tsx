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
  ArrowLeft,
  Handshake,
  FileText,
} from 'lucide-react';
import sageifyLogo from '@/assets/owl-logo.png';
import owlVideo from '@/assets/owl-guide.mp4.asset.json';
import { ContactModalProvider } from '@/contexts/ContactModalContext';

/**
 * Landing — Premium "Cyber Dark" experiment (RDBI.ai-inspired).
 * Scope: this page only. Other pages keep the existing cream/navy identity.
 * Accessibility preserved: 18px+ body, AAA contrast (white/near-white on near-black),
 * 48px+ touch targets, no thin neon text — neon used only for borders/glows.
 */
const Landing = () => {
  const openContact = () =>
    document.dispatchEvent(new CustomEvent('open-contact-modal'));

  // Tokens (scoped — inline so we don't touch the global theme)
  const BG = '#0B0C10';
  const SURFACE = 'rgba(255,255,255,0.04)';
  const BORDER = 'rgba(255,255,255,0.08)';
  const BORDER_STRONG = 'rgba(255,255,255,0.14)';
  const TEXT = '#F5F6F7';
  const MUTED = 'rgba(245,246,247,0.68)';
  const ACCENT = '#7CF3C2'; // emerald neon
  const ACCENT_2 = '#7AB8FF'; // electric blue
  const CORAL = '#FF8A66';

  const glass: React.CSSProperties = {
    background: SURFACE,
    border: `1px solid ${BORDER}`,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
  };

  const techLabel =
    'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-[0.22em] uppercase';

  return (
    <ContactModalProvider>
      <div
        dir="rtl"
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          background: BG,
          color: TEXT,
          fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Ambient aurora glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(60% 40% at 80% 10%, rgba(124,243,194,0.10), transparent 60%), radial-gradient(50% 35% at 10% 90%, rgba(122,184,255,0.10), transparent 60%)',
          }}
        />
        {/* Subtle grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            maskImage:
              'radial-gradient(ellipse at center, rgba(0,0,0,0.6), transparent 75%)',
          }}
        />

        {/* Nav — glass */}
        <header
          className="sticky top-3 z-30 mx-3 md:mx-6 mt-3 rounded-2xl"
          style={glass}
        >
          <div className="max-w-6xl mx-auto w-full px-4 md:px-6 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center p-1.5"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
                  border: `1px solid ${BORDER_STRONG}`,
                }}
              >
                <img src={sageifyLogo} alt="" className="w-full h-full object-contain" />
              </div>
              <span
                className="text-2xl font-semibold tracking-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Sageify
              </span>
            </div>
            <span
              className={`hidden sm:inline-flex ${techLabel}`}
              style={{
                background: 'rgba(124,243,194,0.08)',
                border: `1px solid ${ACCENT}33`,
                color: ACCENT,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: ACCENT, boxShadow: `0 0 10px ${ACCENT}` }}
              />
              00 / GAME CENTER · LIFE 2.0
            </span>
          </div>
        </header>

        {/* Hero */}
        <main className="relative flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-10 md:py-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Right (RTL first): Copy */}
          <div className="text-center lg:text-right order-2 lg:order-1">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={techLabel}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${BORDER_STRONG}`,
                color: MUTED,
              }}
            >
              <Sparkles size={12} strokeWidth={1.5} style={{ color: ACCENT }} />
              פגשו את סגי' — המנטור שלכם
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl md:text-5xl lg:text-6xl font-semibold mt-5 mb-5 leading-[1.1] tracking-tight"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              הפרק הבא בחיים —{' '}
              <span
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                סגי' יראה לכם את הדרך.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl mb-9 leading-relaxed font-normal max-w-xl mx-auto lg:mx-0"
              style={{ color: MUTED }}
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
                className="group relative w-full sm:w-auto px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
                style={{
                  minHeight: 56,
                  color: '#0B0C10',
                  background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                  boxShadow: `0 10px 40px -10px ${ACCENT}80, inset 0 0 0 1px rgba(255,255,255,0.25)`,
                }}
              >
                רכישה — השאירו פרטים
              </button>
              <Link
                to="/preview"
                className="w-full sm:w-auto px-10 py-5 text-lg font-semibold rounded-2xl transition-all duration-300 hover:-translate-y-0.5"
                style={{
                  minHeight: 56,
                  color: TEXT,
                  ...glass,
                }}
              >
                שחקו דמו חינם
              </Link>
            </motion.div>

            {/* Trust strip — bento mini */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="mt-8 grid grid-cols-3 gap-2"
            >
              {[
                { icon: Gamepad2, label: 'משחקים, לא שאלונים' },
                { icon: Brain, label: 'פסיכולוגיה מקצועית' },
                { icon: Target, label: 'כיוונים אמיתיים' },
              ].map(({ icon: Icon, label }, i) => (
                <div
                  key={i}
                  className="rounded-2xl px-3 py-3 flex flex-col items-center gap-1.5 text-center"
                  style={glass}
                >
                  <Icon size={18} strokeWidth={1.5} style={{ color: ACCENT }} />
                  <span className="text-[12px] font-medium" style={{ color: MUTED }}>
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Left: Owl video — glow frame */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 120, damping: 18, delay: 0.2 }}
            className="order-1 lg:order-2 relative"
          >
            <div className="relative aspect-square max-w-md mx-auto">
              {/* Neon halo */}
              <div
                aria-hidden
                className="absolute inset-0 rounded-full blur-3xl"
                style={{
                  background: `radial-gradient(circle, ${ACCENT}33, transparent 70%)`,
                }}
              />
              {/* Glass frame */}
              <div
                className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.01))',
                  border: `1px solid ${BORDER_STRONG}`,
                  boxShadow: `0 30px 80px -20px ${ACCENT}33, inset 0 0 0 1px rgba(255,255,255,0.04)`,
                }}
              >
                <video
                  src={owlVideo.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover opacity-95"
                />
                {/* Subtle scanline overlay */}
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background:
                      'linear-gradient(180deg, transparent, rgba(0,0,0,0.35))',
                  }}
                />
              </div>

              {/* Floating chips */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-3 -right-3 rounded-2xl px-4 py-2 text-sm font-semibold flex items-center gap-2"
                style={glass}
              >
                <Sparkles size={14} strokeWidth={1.5} style={{ color: ACCENT }} />
                זה הזמן שלך
              </motion.div>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                className="absolute -bottom-3 -left-3 rounded-2xl px-4 py-2 text-sm font-semibold flex items-center gap-2"
                style={{
                  ...glass,
                  borderColor: `${CORAL}55`,
                  color: CORAL,
                }}
              >
                <Compass size={14} strokeWidth={1.5} />
                כיוון חדש
              </motion.div>
            </div>
          </motion.div>
        </main>

        {/* Bento section — holistic journey */}
        <section className="relative max-w-6xl mx-auto w-full px-4 md:px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.7 }}
            className="rounded-[2rem] p-6 md:p-10"
            style={glass}
          >
            <div className="text-center mb-8 md:mb-10">
              <span
                className={techLabel}
                style={{
                  background: 'rgba(122,184,255,0.08)',
                  border: `1px solid ${ACCENT_2}33`,
                  color: ACCENT_2,
                }}
              >
                01 / מענה הוליסטי — דיגיטלי + אנושי
              </span>
              <h2
                className="text-2xl md:text-4xl font-semibold mt-4 mb-3 leading-tight"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                מסע אחד שלם — מהמשחק{' '}
                <span
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  עד תוכנית הפעולה
                </span>
              </h2>
              <p
                className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto"
                style={{ color: MUTED }}
              >
                שני חלקים, חוויה אחת. סגי' מגלה איתכם את החוזקות והכיוונים, ואז{' '}
                <span className="font-semibold" style={{ color: TEXT }}>יועצ.ת תעסוקתי.ת</span> מומחה.ית{' '}
                <span className="font-semibold" style={{ color: TEXT }}>לתעסוקה אקטיבית אחרי פרישה</span>{' '}
                מתרגם.ת את התובנות לתוכנית פעולה מנטלית ופרקטית מותאמת לכם.
              </p>
            </div>

            {/* Bento — asymmetric grid */}
            <div className="grid md:grid-cols-[1.1fr,auto,1fr] items-stretch gap-5 md:gap-4">
              {/* STEP 1 */}
              <BentoStep
                index="02"
                label="הגילוי הדיגיטלי"
                title="משחקים והתכתבות עם סגי'"
                icon={<Gamepad2 size={22} strokeWidth={1.5} />}
                accent={ACCENT}
                tokens={{ TEXT, MUTED, BORDER_STRONG }}
                glass={glass}
              >
                8 משחקים קצרים ושיחה חכמה חושפים את החוזקות, המניעים והכיוונים שלכם —
                ויוצרים את <span className="font-semibold" style={{ color: TEXT }}>דוח האינטייק</span> האישי.
              </BentoStep>

              {/* Connector */}
              <div className="flex md:flex-col items-center justify-center gap-2 py-2">
                <span
                  className="hidden md:block w-px h-10"
                  style={{ background: BORDER_STRONG }}
                />
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background: `linear-gradient(135deg, ${ACCENT}, ${ACCENT_2})`,
                    boxShadow: `0 0 20px ${ACCENT}66`,
                    color: '#0B0C10',
                  }}
                >
                  <ArrowLeft size={18} strokeWidth={2} />
                </div>
                <span
                  className="hidden md:block w-px h-10"
                  style={{ background: BORDER_STRONG }}
                />
              </div>

              {/* STEP 2 */}
              <BentoStep
                index="03"
                label="המענה האנושי"
                title="ייעוץ תעסוקתי — מומחים לעבודה אחרי פרישה"
                icon={<Handshake size={22} strokeWidth={1.5} />}
                accent={CORAL}
                tokens={{ TEXT, MUTED, BORDER_STRONG }}
                glass={glass}
              >
                יועצ.ת תעסוקתי.ת מומחה.ית{' '}
                <span className="font-semibold" style={{ color: TEXT }}>לתעסוקה אקטיבית אחרי פרישה</span> מקבל.ת את
                דוח האינטייק מראש, ומלווה אתכם בתרגום התובנות ל
                <span className="font-semibold" style={{ color: TEXT }}> תוכנית פעולה מנטלית ופרקטית</span> מותאמת אישית.
              </BentoStep>
            </div>

            {/* Outcome strip */}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm font-medium" style={{ color: MUTED }}>
              {[
                { icon: Gamepad2, label: 'גילוי' },
                { icon: FileText, label: 'דוח אינטייק' },
                { icon: Handshake, label: 'פגישה' },
              ].map(({ icon: Icon, label }, i, arr) => (
                <span key={i} className="flex items-center gap-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <Icon size={14} strokeWidth={1.5} style={{ color: ACCENT }} />
                    {label}
                  </span>
                  {i < arr.length && (
                    <ArrowLeft size={14} style={{ color: ACCENT_2 }} />
                  )}
                </span>
              ))}
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-semibold"
                style={{
                  background: `linear-gradient(135deg, ${ACCENT}22, ${ACCENT_2}22)`,
                  border: `1px solid ${ACCENT}55`,
                  color: ACCENT,
                }}
              >
                <Target size={14} strokeWidth={1.8} />
                תוכנית פעולה
              </span>
            </div>
          </motion.div>
        </section>

        <footer
          className="relative py-6 px-6"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs" style={{ color: MUTED }}>
            <span>© {new Date().getFullYear()} Sageify</span>
            <div className="flex items-center gap-5">
              <a
                href="https://www.linkedin.com/company/sageify"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Linkedin size={13} strokeWidth={1.5} /> LinkedIn
              </a>
              <Link
                to="/admin-panel"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-white"
              >
                <Settings size={13} strokeWidth={1.5} /> ניהול
              </Link>
            </div>
          </div>
        </footer>
      </div>
    </ContactModalProvider>
  );
};

const BentoStep = ({
  index,
  label,
  title,
  icon,
  accent,
  children,
  tokens,
  glass,
}: {
  index: string;
  label: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  children: React.ReactNode;
  tokens: { TEXT: string; MUTED: string; BORDER_STRONG: string };
  glass: React.CSSProperties;
}) => (
  <div
    className="group relative rounded-[1.5rem] p-6 text-center md:text-right transition-all duration-500 hover:-translate-y-0.5"
    style={{
      ...glass,
      background:
        'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
    }}
  >
    {/* glow border on hover */}
    <div
      aria-hidden
      className="absolute inset-0 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
      style={{
        boxShadow: `0 0 0 1px ${accent}55, 0 20px 60px -20px ${accent}55`,
      }}
    />
    <div className="relative flex items-center justify-center md:justify-start gap-3 mb-4">
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{
          background: `${accent}1A`,
          border: `1px solid ${accent}55`,
          color: accent,
        }}
      >
        {icon}
      </div>
      <span
        className="inline-flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold tracking-[0.22em] uppercase"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${tokens.BORDER_STRONG}`,
          color: tokens.MUTED,
        }}
      >
        {index} / {label}
      </span>
    </div>
    <h3
      className="relative text-xl md:text-2xl font-semibold mb-2 leading-tight"
      style={{ fontFamily: "'Playfair Display', serif", color: tokens.TEXT }}
    >
      {title}
    </h3>
    <p className="relative text-base leading-relaxed" style={{ color: tokens.MUTED }}>
      {children}
    </p>
  </div>
);

export default Landing;
