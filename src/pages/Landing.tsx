import { motion } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import heroBanner from '@/assets/hero-banner.png';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';
import LandingFAQ from '@/components/LandingFAQ';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Landing = () => {
  const pillars = [
    {
      icon: '◆',
      title: 'דיוק פסיכולוגי',
      desc: 'מערכת שנבנתה על ידי מומחי פסיכולוגיה תעסוקתית – מגשרת בין "מי שאתם" ל"מה תעשו מחר"',
    },
    {
      icon: '✦',
      title: 'סריקת שוק בזמן אמת',
      desc: 'חיפוש AI חי שמוצא הזדמנויות ספציפיות: משרות, התנדבויות ותפקידים בישראל',
    },
    {
      icon: '●',
      title: 'חוכמת קהילה',
      desc: 'סגי מזהה דפוסים בהשוואה לפרופילים דומים – ומראה מה הוביל אחרים לשביעות רצון',
    },
  ];

  const features = [
    { icon: '🧠', title: 'אבחון פסיכומטרי מקיף', desc: '8 שאלונים מעולם הפסיכולוגיה התעסוקתית – חוזקות, עוגנים, נטיות ומוטיבציה' },
    { icon: '🤖', title: 'ייעוץ AI מותאם אישית', desc: 'סגי, היועץ החכם שלנו, מנתח את הפרופיל ומציע מסלולים מותאמים' },
    { icon: '🔍', title: 'חיפוש הזדמנויות חי', desc: 'סריקת שוק בזמן אמת שמוצאת משרות, התנדבויות ופרויקטים רלוונטיים' },
    { icon: '🗺️', title: 'מפת דרכים אישית', desc: 'תוכנית פעולה מותאמת עם שלבים ברורים ומשימות פרקטיות' },
    { icon: '📊', title: 'דוח תוצאות מפורט', desc: 'ניתוח מעמיק של כל הממצאים – להורדה, להדפסה ולשיתוף' },
    { icon: '🏢', title: 'ממשק ארגוני', desc: 'כלי ניהול לארגונים עם ניתוח אגרגטיבי ותובנות על כלל המשתתפים' },
  ];

  const process = [
    { step: '01', title: 'הרשמה', desc: 'מקבלים קישור אישי מהארגון או מהיועץ' },
    { step: '02', title: 'אבחון', desc: '8 שאלונים קצרים בקצב שלכם – שמירה אוטומטית' },
    { step: '03', title: 'ניתוח', desc: 'סגי מנתח את התוצאות ובונה פרופיל מקצועי מדויק' },
    { step: '04', title: 'תוצאות', desc: 'דוח מפורט, מפת דרכים אישית וחיפוש הזדמנויות חי' },
  ];

  const audiences = [
    { title: 'פורשים ומתכננים פרישה', desc: 'מחפשים תכלית ועיסוק משמעותי בפרק הבא', icon: '🌿' },
    { title: 'ארגונים ומעסיקים', desc: 'מלווים עובדים בתהליכי מעבר קריירה', icon: '🏛️' },
    { title: 'יועצי קריירה', desc: 'כלי מקצועי לליווי מטופלים עם תובנות מבוססות נתונים', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBanner} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(160_35%_18%/0.85)] via-[hsl(160_35%_18%/0.7)] to-background" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 py-20 md:py-32 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <img src={sageifyLogo} alt="Sageify Logo" className="w-24 h-24 md:w-32 md:h-32 mx-auto mb-6 drop-shadow-xl" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            Sageify
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/90 mb-3 font-light"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            לתרגם חיים שלמים של ניסיון לפרק הבא
          </motion.p>

          <motion.p
            className="text-lg md:text-xl text-white/75 max-w-2xl mx-auto mb-10"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            פלטפורמת אבחון תעסוקתי חכמה לפורשים – משלבת פסיכולוגיה, AI וסריקת שוק בזמן אמת
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden" animate="visible" variants={fadeUp} custom={4}
          >
            <a
              href="mailto:info@sageify.co.il"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl bg-white text-primary font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              צרו קשר
            </a>
            <a
              href="#features"
              className="inline-flex items-center justify-center px-8 py-4 rounded-2xl border-2 border-white/40 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
            >
              למידע נוסף ↓
            </a>
          </motion.div>
        </div>
      </section>

      {/* Pillars */}
      <section className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          שלושת העמודים
        </motion.h2>
        <motion.p
          className="text-muted-foreground text-center text-lg mb-12 max-w-2xl mx-auto"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
        >
          הגישה של Sageify נשענת על שלושה עקרונות מרכזיים
        </motion.p>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 2}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <motion.span
                className="text-4xl block mb-4 text-primary"
                whileHover={{ scale: 1.2, rotate: 10 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                {p.icon}
              </motion.span>
              <h3 className="text-xl font-bold mb-3">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-primary/[0.03] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            מה כולל השירות
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="rounded-3xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.5}
              >
                <span className="text-3xl block mb-3">{f.icon}</span>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-[16px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          איך זה עובד
        </motion.h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {process.map((s, i) => (
            <motion.div
              key={i}
              className="text-center"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
            >
              <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground text-2xl font-bold mb-4">
                {s.step}
              </span>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Audiences */}
      <section className="bg-primary/[0.03] py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-12"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            למי זה מתאים
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {audiences.map((a, i) => (
              <motion.div
                key={i}
                className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)]"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <span className="text-5xl block mb-4">{a.icon}</span>
                <h3 className="text-xl font-bold mb-3">{a.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-16 md:py-24 text-center">
        <motion.div
          className="rounded-3xl bg-primary p-10 md:p-16 shadow-[var(--shadow-elevated)]"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-primary-foreground/80 text-lg mb-8 max-w-xl mx-auto">
            צרו קשר לקבלת גישה למערכת – לארגונים, ליועצים ולפרטיים
          </p>
          <a
            href="mailto:info@sageify.co.il"
            className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-white text-primary font-semibold text-lg hover:bg-white/90 transition-colors shadow-lg"
          >
            צרו קשר
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={sageifyLogo} alt="Sageify" className="w-8 h-8" />
            <span className="font-semibold text-lg">Sageify</span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Sageify. כל הזכויות שמורות.</span>
            <Link to="/admin-panel" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-sm font-medium">
              <Settings size={15} />
              ניהול
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
