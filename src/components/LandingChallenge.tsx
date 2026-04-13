import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const challenges = [
  {
    icon: '😰',
    title: 'משבר זהות',
    desc: '40% מהפורשים חווים ירידה במצב הנפשי ואובדן סטטוס',
  },
  {
    icon: '📉',
    title: 'כשל אבחוני',
    desc: 'כלי המדידה הקיימים עוצבו לבני 20, לא לבעלי ניסיון חיים',
  },
  {
    icon: '🧭',
    title: 'היעדר מצפן',
    desc: 'בדידות וירידה קוגניטיבית מואצת בשל היעדר ייעוד חדש',
  },
];

const LandingChallenge = () => {
  return (
    <section id="challenge" className="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <motion.div
        className="text-center mb-12"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={fadeUp}
        custom={0}
      >
        <span className="inline-block px-4 py-1.5 rounded-full bg-destructive/10 text-destructive text-sm font-semibold mb-4">
          האתגר
        </span>
        <h2 className="text-3xl md:text-4xl font-bold mb-3">ואקום המשמעות</h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          פרדוקס האריכות: 20-30 שנות חיוניות אל מול תהום של חוסר מעש
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8">
        {challenges.map((c, i) => (
          <motion.div
            key={i}
            className="rounded-3xl border border-destructive/20 bg-destructive/[0.03] p-8 text-center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={i + 1}
          >
            <span className="text-4xl block mb-4">{c.icon}</span>
            <h3 className="text-xl font-bold mb-3">{c.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{c.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default LandingChallenge;
