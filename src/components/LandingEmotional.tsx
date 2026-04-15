import { motion } from 'framer-motion';

const messages = [
  'אחרי עשרות שנים של עשייה, ההפסקה הפתאומית יכולה להרגיש מבלבלת',
  'זה טבעי לשאול "מה עכשיו?" — רוב הפורשים מרגישים כך',
  'הניסיון שצברתם לא נעלם — הוא רק מחכה לכיוון חדש',
];

const LandingEmotional = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-2xl mx-auto px-6 md:px-8 relative z-10">
      <motion.p
        className="text-sm text-primary font-bold mb-5 tracking-widest uppercase text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        אתם לא לבד
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.6rem] font-bold mb-5 leading-tight text-right"
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
      >
        ההרגשה הזו מוכרת לכולם
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-lg md:text-xl leading-[1.85] mb-16 text-right"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
      >
        פרישה היא לא סוף — היא התחלה. אבל בלי מצפן, קל ללכת לאיבוד.
        <br />
        הגיע הזמן למצוא את הכיוון שמתאים בדיוק לכם.
      </motion.p>

      {/* Flowing prose-like quotes instead of identical cards */}
      <div className="space-y-8 md:space-y-10 border-r-2 border-primary/20 pr-8 md:pr-10">
        {messages.map((msg, i) => (
          <motion.p
            key={i}
            className="text-foreground text-lg md:text-xl leading-[1.85] relative"
            initial={{ opacity: 0, x: 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="absolute -right-[calc(2rem+5px)] md:-right-[calc(2.5rem+5px)] top-2 w-2.5 h-2.5 rounded-full bg-primary/40" />
            {msg}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="mt-16 text-right"
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-lg hover:opacity-90 transition-all duration-500 shadow-[var(--shadow-elevated)] hover:translate-y-[-2px]"
        >
          גלו את הכיוון שלכם
        </button>
      </motion.div>
    </div>
  </section>
);

export default LandingEmotional;
