import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const audiences = [
  {
    badge: 'B2B',
    title: 'ארגונים ומעסיקים',
    desc: 'חבילת Offboarding – ליווי עובדים פורשים עם כלי אבחון מקצועי ותובנות אגרגטיביות',
    icon: '🏛️',
  },
  {
    badge: 'B2C',
    title: 'פורשים ומתכננים פרישה',
    desc: 'פורטל אבחון אישי – מחפשים תכלית ועיסוק משמעותי בפרק הבא של החיים',
    icon: '🌿',
  },
  {
    badge: 'B2G',
    title: 'ממשל ומוסדות',
    desc: 'אופטימיזציה לאומית – ניצול הון אנושי מנוסה לטובת הקהילה והחברה',
    icon: '🏛️',
  },
];

const LandingAudiences = () => {
  return (
    <section className="bg-primary/[0.03] py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
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
              className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)]"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
            >
              <span className="text-5xl block mb-4">{a.icon}</span>
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3">
                {a.badge}
              </span>
              <h3 className="text-xl font-bold mb-3">{a.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingAudiences;
