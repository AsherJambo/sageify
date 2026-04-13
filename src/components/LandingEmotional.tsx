import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.14, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const messages = [
  'אחרי עשרות שנים של עשייה, ההפסקה הפתאומית יכולה להרגיש מבלבלת',
  'זה טבעי לשאול "מה עכשיו?" — רוב הפורשים מרגישים כך',
  'הניסיון שצברתם לא נעלם — הוא רק מחכה לכיוון חדש',
];

const LandingEmotional = () => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 text-center relative z-10">
      <motion.p
        className="text-sm text-primary font-bold mb-4 tracking-widest uppercase"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        אתם לא לבד
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold mb-6 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        ההרגשה הזו מוכרת לכולם
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-lg md:text-xl leading-relaxed mb-14 max-w-xl mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
      >
        פרישה היא לא סוף — היא התחלה. אבל בלי מצפן, קל ללכת לאיבוד.
        <br />
        הגיע הזמן למצוא את הכיוון שמתאים בדיוק לכם.
      </motion.p>

      <div className="space-y-4">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border rounded-2xl px-8 py-6 text-right shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-shadow duration-500"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}
          >
            <p className="text-foreground text-lg leading-relaxed flex items-start gap-3">
              <span className="text-primary text-xl mt-0.5 shrink-0">✦</span>
              {msg}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.a
        href="mailto:sageify.ai@gmail.com"
        className="inline-flex items-center justify-center mt-14 px-10 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-lg hover:opacity-90 transition-all duration-500 shadow-[var(--shadow-elevated)] hover:translate-y-[-2px]"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={6}
      >
        גלו את הכיוון שלכם
      </motion.a>
    </div>
  </section>
);

export default LandingEmotional;
