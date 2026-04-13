import { motion } from 'framer-motion';
import sageifyLogo from '@/assets/owl-logo.png';
import heroPremium from '@/assets/hero-premium.jpg';
import { Link } from 'react-router-dom';
import { Settings } from 'lucide-react';

import LandingChallenge from '@/components/LandingChallenge';
import LandingUniqueness from '@/components/LandingUniqueness';
import LandingAudiences from '@/components/LandingAudiences';
import LandingTeam from '@/components/LandingTeam';

import LandingFAQ from '@/components/LandingFAQ';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Landing = () => {
  const features = [
    { title: 'אינטליגנציה מגובשת', desc: 'מדידת כישורי שיפוט וניסיון המשביחים עם הגיל – לא מבחנים גנריים לבני 20' },
    { title: 'שאלון גנרטיביות', desc: 'אלגוריתם הממפה את הצורך להשאיר חותם (Legacy) ולמצוא משמעות חדשה' },
    { title: 'מפת דרכים אופרטיבית', desc: 'דוח המצליב נכסי עבר עם צרכים רגשיים עכשוויים – תוכנית פעולה מעשית' },
    { title: 'Data-Driven Insights', desc: 'למידת מכונה (AI) המזקקת המלצות על בסיס קהילה צומחת של פורשים' },
    { title: 'סריקת שוק בזמן אמת', desc: 'חיפוש AI חי שמוצא הזדמנויות ספציפיות: משרות, התנדבויות ומנטורינג' },
    { title: 'דוח תוצאות מפורט', desc: 'ניתוח מעמיק של כל הממצאים – להורדה, להדפסה ולשיתוף עם יועצים' },
  ];

  const process = [
    { step: '01', title: 'הרשמה', desc: 'מקבלים קישור אישי מהארגון או מהיועץ' },
    { step: '02', title: 'אבחון', desc: '8 שאלונים מותאמי גיל בקצב שלכם – שמירה אוטומטית' },
    { step: '03', title: 'ניתוח', desc: 'סגי מנתח את התוצאות ובונה פרופיל מקצועי מדויק' },
    { step: '04', title: 'תוצאות', desc: 'דוח מפורט, מפת דרכים אישית וחיפוש הזדמנויות חי' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero */}
      <section className="relative w-full overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroPremium} alt="" className="w-full h-full object-cover" width={1920} height={960} />
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(192_32%_16%/0.82)] via-[hsl(192_32%_16%/0.65)] to-background" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-36 text-center">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} custom={0}>
            <img src={sageifyLogo} alt="Sageify Logo" className="w-20 h-20 md:w-24 md:h-24 mx-auto mb-8 drop-shadow-lg" />
          </motion.div>

          <motion.h1
            className="text-4xl md:text-[3.5rem] font-bold text-white mb-5 leading-[1.15]"
            initial="hidden" animate="visible" variants={fadeUp} custom={1}
          >
            מגדירים מחדש את
            <br />
            הייעוד בגיל השלישי
          </motion.h1>

          <motion.p
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
            initial="hidden" animate="visible" variants={fadeUp} custom={2}
          >
            מערכת אבחון חכמה המבוססת על פסיכולוגיה התפתחותית ו-AI,
            ההופכת את ניסיון העבר למפת דרכים לייעוד חדש
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial="hidden" animate="visible" variants={fadeUp} custom={3}
          >
            <a
              href="mailto:info@sageify.co.il"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg bg-white text-primary font-semibold text-base hover:bg-white/90 transition-all duration-500 shadow-md"
            >
              צרו קשר
            </a>
            <a
              href="#challenge"
              className="inline-flex items-center justify-center px-8 py-3.5 rounded-lg border border-white/30 text-white font-medium text-base hover:bg-white/10 transition-all duration-500"
            >
              למידע נוסף
            </a>
          </motion.div>
        </div>
      </section>


      {/* Challenge */}
      <LandingChallenge />

      {/* Uniqueness */}
      <LandingUniqueness />

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-5xl mx-auto px-6">
          <motion.p
            className="text-sm text-accent font-semibold text-center mb-3 tracking-wide"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            Vocation Diagnostics
          </motion.p>
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center mb-4"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
          >
            מה כולל השירות
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-center text-base mb-14 max-w-xl mx-auto"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
          >
            פלטפורמה המותאמת לשינויים הקוגניטיביים של גיל הפרישה
          </motion.p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/50 border border-border/50 rounded-lg overflow-hidden">
            {features.map((f, i) => (
              <motion.div
                key={i}
                className="bg-card p-8 hover:bg-muted/30 transition-colors duration-500"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
              >
                <div className="w-8 h-px bg-accent mb-5" />
                <h3 className="text-lg font-bold mb-2 font-serif">{f.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-primary py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-6">
          <motion.h2
            className="text-3xl md:text-4xl font-bold text-center text-primary-foreground mb-14"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
          >
            איך זה עובד
          </motion.h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {process.map((s, i) => (
              <motion.div
                key={i}
                className="text-center"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
              >
                <span className="inline-flex items-center justify-center w-14 h-14 rounded-full border-2 border-primary-foreground/30 text-primary-foreground text-lg font-bold mb-4">
                  {s.step}
                </span>
                <h3 className="text-lg font-bold mb-2 text-primary-foreground">{s.title}</h3>
                <p className="text-primary-foreground/70 leading-relaxed text-[15px]">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Audiences */}
      <LandingAudiences />


      {/* Team */}
      <LandingTeam />

      {/* FAQ */}
      <LandingFAQ />

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-6 py-20 md:py-28 text-center">
        <motion.div
          className="rounded-lg bg-primary p-12 md:p-16 shadow-[var(--shadow-elevated)]"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
            מוכנים להתחיל?
          </h2>
          <p className="text-primary-foreground/75 text-base mb-8 max-w-md mx-auto leading-relaxed">
            צרו קשר לקבלת גישה למערכת – לארגונים, ליועצים ולפרטיים
          </p>
          <a
            href="mailto:info@sageify.co.il"
            className="inline-flex items-center justify-center px-10 py-3.5 rounded-lg bg-white text-primary font-semibold text-base hover:bg-white/90 transition-all duration-500 shadow-md"
          >
            צרו קשר
          </a>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-10">
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src={sageifyLogo} alt="Sageify" className="w-7 h-7" />
            <span className="font-semibold text-base">Sageify</span>
          </div>

          <div className="flex items-center gap-6 text-muted-foreground text-sm">
            <span>© {new Date().getFullYear()} Sageify. כל הזכויות שמורות.</span>
            <Link to="/admin-panel" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-all duration-400 text-sm font-medium">
              <Settings size={14} />
              ניהול
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
