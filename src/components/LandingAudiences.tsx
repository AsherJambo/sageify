import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const audiences = [
  { badge: 'B2B', title: 'ארגונים ומעסיקים', desc: 'חבילת Offboarding – ליווי עובדים פורשים עם כלי אבחון מקצועי ותובנות אגרגטיביות' },
  { badge: 'B2C', title: 'פורשים ומתכננים פרישה', desc: 'פורטל אבחון אישי – מחפשים תכלית ועיסוק משמעותי בפרק הבא של החיים' },
  { badge: 'B2G', title: 'ממשל ומוסדות', desc: 'אופטימיזציה לאומית – ניצול הון אנושי מנוסה לטובת הקהילה והחברה' },
];

const LandingAudiences = () => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    <div className="max-w-5xl mx-auto px-6">
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold text-center mb-16 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        למי זה מתאים
      </motion.h2>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {audiences.map((a, i) => (
          <motion.div
            key={i}
            className="border border-border/40 bg-card/80 backdrop-blur-sm rounded-2xl p-8 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:translate-y-[-3px]"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 1}
          >
            <span className="inline-block px-4 py-1.5 rounded-full border border-secondary/25 text-secondary text-xs font-bold mb-6 tracking-widest uppercase">
              {a.badge}
            </span>
            <h3 className="text-xl font-bold mb-3 font-serif">{a.title}</h3>
            <p className="text-muted-foreground leading-relaxed text-base">{a.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingAudiences;
