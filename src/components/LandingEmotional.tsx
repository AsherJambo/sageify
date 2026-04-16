import { motion } from 'framer-motion';

const messages = [
  'אחרי עשרות שנים של עשייה, ההפסקה הפתאומית יכולה להרגיש מבלבלת',
  'זה טבעי לשאול "מה עכשיו?" — רוב הפורשים מרגישים כך',
  'הניסיון שצברתם לא נעלם — הוא רק מחכה לכיוון חדש',
];

const LandingEmotional = () => (
  <section className="pt-24 pb-16 md:pt-32 md:pb-20">
    <div className="max-w-2xl mx-auto px-6 md:px-8">
      <motion.p
        className="text-sm text-primary font-semibold mb-3 tracking-wide text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        אתם לא לבד
      </motion.p>
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold mb-4 leading-tight text-right"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        ההרגשה הזו מוכרת לכולם
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-base md:text-lg leading-[1.85] mb-12 text-right"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        פרישה היא לא סוף — היא התחלה. אבל בלי מצפן, קל ללכת לאיבוד.
        <br />
        הגיע הזמן למצוא את הכיוון שמתאים בדיוק לכם.
      </motion.p>

      <div className="space-y-6 border-r border-primary/15 pr-6 md:pr-8">
        {messages.map((msg, i) => (
          <motion.p
            key={i}
            className="text-foreground/85 text-base md:text-[1.05rem] leading-[1.85]"
            initial={{ opacity: 0, x: 8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + i * 0.12, duration: 0.8 }}
          >
            {msg}
          </motion.p>
        ))}
      </div>

      <motion.div
        className="mt-12 text-right"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.8 }}
      >
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity duration-300"
        >
          גלו את הכיוון שלכם
        </button>
      </motion.div>
    </div>
  </section>
);

export default LandingEmotional;
