import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const team = [
  {
    name: 'ד"ר יאיר נעם',
    role: 'מייסד שותף – מדע',
    desc: 'פסיכולוג תעסוקתי, מומחה באבחון מיומנויות. לשעבר ראש ענף המיון של צה"ל.',
    icon: '🧠',
  },
  {
    name: 'אשר שטיינברגר',
    role: 'מייסד שותף – טכנולוגיה',
    desc: 'יזם ומנהל פרויקטים מערכתיים, מומחה בחיבור בין אנשים להזדמנויות.',
    icon: '🚀',
  },
];

const LandingTeam = () => {
  return (
    <section className="max-w-4xl mx-auto px-6 py-16 md:py-24">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        הצוות
      </motion.h2>

      <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
        {team.map((t, i) => (
          <motion.div
            key={i}
            className="rounded-3xl border border-border/60 bg-card p-8 text-center shadow-[var(--shadow-card)]"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 1}
          >
            <span className="text-5xl block mb-4">{t.icon}</span>
            <h3 className="text-xl font-bold mb-1">{t.name}</h3>
            <p className="text-primary text-sm font-semibold mb-3">{t.role}</p>
            <p className="text-muted-foreground leading-relaxed">{t.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingTeam;
