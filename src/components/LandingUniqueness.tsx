import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const pillars = [
  {
    icon: '🔬',
    title: 'מדע מותאם גיל',
    desc: 'שימוש ב-Geropsychology בניגוד למבחני נטיות גנריים – אבחון שנבנה במיוחד לגיל השלישי',
  },
  {
    icon: '🔄',
    title: 'מניהול זמן לניהול משמעות',
    desc: 'הפיכת חרדת פרישה לתוכנית עבודה: מנטורינג, יזמות חברתית ותרומה לקהילה',
  },
  {
    icon: '📊',
    title: 'Data-Driven Insights',
    desc: 'למידת מכונה (AI) המזקקת המלצות מותאמות אישית על בסיס קהילה צומחת של פורשים',
  },
];

const LandingUniqueness = () => {
  return (
    <section className="bg-primary/[0.03] py-16 md:py-24">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-4">
            הפתרון
          </span>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">הייחודיות של Sageify</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            מגדירים מחדש את הייעוד בגיל השלישי
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
            >
              <motion.span
                className="text-4xl block mb-4"
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
      </div>
    </section>
  );
};

export default LandingUniqueness;
