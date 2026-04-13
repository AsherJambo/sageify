import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const audiences = [
  {
    badge: 'B2B',
    title: 'ארגונים ומעסיקים',
    desc: 'חבילת Offboarding – ליווי עובדים פורשים עם כלי אבחון מקצועי ותובנות אגרגטיביות',
  },
  {
    badge: 'B2C',
    title: 'פורשים ומתכננים פרישה',
    desc: 'פורטל אבחון אישי – מחפשים תכלית ועיסוק משמעותי בפרק הבא של החיים',
  },
  {
    badge: 'B2G',
    title: 'ממשל ומוסדות',
    desc: 'אופטימיזציה לאומית – ניצול הון אנושי מנוסה לטובת הקהילה והחברה',
  },
];

const LandingAudiences = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          למי זה מתאים
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {audiences.map((a, i) => (
            <motion.div
              key={i}
              className="border border-border/50 bg-card rounded-lg p-8 text-center shadow-[var(--shadow-card)]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
            >
              <span className="inline-block px-3 py-1 rounded border border-accent/30 text-accent text-xs font-bold mb-5 tracking-wider">
                {a.badge}
              </span>
              <h3 className="text-xl font-bold mb-3 font-serif">{a.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAudiences;
