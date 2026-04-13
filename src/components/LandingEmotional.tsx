import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const messages = [
  'אחרי עשרות שנים של עשייה, ההפסקה הפתאומית יכולה להרגיש מבלבלת',
  'זה טבעי לשאול "מה עכשיו?" — רוב הפורשים מרגישים כך',
  'הניסיון שצברתם לא נעלם — הוא רק מחכה לכיוון חדש',
];

const LandingEmotional = () => (
  <section className="py-20 md:py-28 bg-muted/30">
    <div className="max-w-3xl mx-auto px-6 text-center">
      <motion.p
        className="text-sm text-accent font-semibold mb-3 tracking-wide"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        אתם לא לבד
      </motion.p>
      <motion.h2
        className="text-3xl md:text-4xl font-bold mb-6"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        ההרגשה הזו מוכרת לכולם
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-lg leading-relaxed mb-12 max-w-xl mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
      >
        פרישה היא לא סוף — היא התחלה. אבל בלי מצפן, קל ללכת לאיבוד.
        <br />
        הגיע הזמן למצוא את הכיוון שמתאים בדיוק לכם.
      </motion.p>

      <div className="space-y-5">
        {messages.map((msg, i) => (
          <motion.div
            key={i}
            className="bg-card border border-border/50 rounded-lg px-8 py-5 text-right"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}
          >
            <p className="text-foreground text-[17px] leading-relaxed flex items-start gap-3">
              <span className="text-accent text-xl mt-0.5 shrink-0">✦</span>
              {msg}
            </p>
          </motion.div>
        ))}
      </div>

      <motion.a
        href="mailto:sageify.ai@gmail.com"
        className="inline-flex items-center justify-center mt-12 px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all duration-500 shadow-md"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={6}
      >
        גלו את הכיוון שלכם — בחינם
      </motion.a>
    </div>
  </section>
);

export default LandingEmotional;
