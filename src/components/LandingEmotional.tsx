import { motion } from 'framer-motion';

const messages = [
  'אחרי עשרות שנים של עשייה, ההפסקה הפתאומית יכולה להרגיש מבלבלת',
  'זה טבעי לשאול "מה עכשיו?" — רוב הפורשים מרגישים כך',
  'הניסיון שצברתם לא נעלם — הוא רק מחכה לכיוון חדש',
];

const LandingEmotional = () => (
  <section className="pt-28 pb-10 md:pt-40 md:pb-14">
    <div className="max-w-xl mx-auto px-6 md:px-8">
      {/* No label, no subtitle — just the statement */}
      <motion.h2
        className="text-2xl md:text-[2rem] font-bold mb-8 leading-[1.35] text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        פרישה היא לא סוף — היא התחלה.
        <br />
        <span className="text-muted-foreground font-normal text-lg md:text-xl">אבל בלי מצפן, קל ללכת לאיבוד.</span>
      </motion.h2>

      {/* Flowing paragraphs, not a list */}
      {messages.map((msg, i) => (
        <motion.p
          key={i}
          className="text-foreground/80 text-base leading-[1.9] mb-4 last:mb-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 + i * 0.15, duration: 0.9 }}
        >
          {msg}.
        </motion.p>
      ))}
    </div>
  </section>
);

export default LandingEmotional;
