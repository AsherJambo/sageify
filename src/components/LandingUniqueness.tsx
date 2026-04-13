import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const pillars = [
  {
    title: 'מדע מותאם גיל',
    desc: 'שימוש ב-Geropsychology בניגוד למבחני נטיות גנריים – אבחון שנבנה במיוחד לגיל השלישי',
  },
  {
    title: 'מניהול זמן לניהול משמעות',
    desc: 'הפיכת חרדת פרישה לתוכנית עבודה: מנטורינג, יזמות חברתית ותרומה לקהילה',
  },
  {
    title: 'Data-Driven Insights',
    desc: 'למידת מכונה (AI) המזקקת המלצות מותאמות אישית על בסיס קהילה צומחת של פורשים',
  },
];

const LandingUniqueness = () => {
  return (
    <section className="bg-primary/[0.03] py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          className="text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          <p className="text-sm text-accent font-semibold mb-3 tracking-wide">הפתרון</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">הייחודיות של Sageify</h2>
          <p className="text-muted-foreground text-base max-w-lg mx-auto">
            מגדירים מחדש את הייעוד בגיל השלישי
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {pillars.map((p, i) => (
            <motion.div
              key={i}
              className="border border-border/50 bg-card rounded-lg p-8 text-center shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
              whileHover={{ y: -4, transition: { duration: 0.4 } }}
            >
              <div className="w-8 h-px bg-accent mx-auto mb-6" />
              <h3 className="text-xl font-bold mb-3 font-serif">{p.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-[15px]">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingUniqueness;
