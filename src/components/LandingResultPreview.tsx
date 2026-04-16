import { motion } from 'framer-motion';

const sampleResults = [
  { label: 'הכיוון המומלץ', value: 'מנטורינג וליווי מקצועי לצעירים' },
  { label: 'הערכים המובילים שלך', value: 'תרומה לזולת, העברת ידע, יצירתיות' },
  { label: 'הזדמנויות רלוונטיות', value: '3 תוכניות מנטורינג פעילות באזורך' },
  { label: 'תובנה אישית', value: 'הניסיון הניהולי שלך הוא הנכס החזק ביותר — הגיע הזמן להעביר אותו הלאה' },
];

const LandingResultPreview = () => (
  <section className="pt-20 pb-14 md:pt-28 md:pb-20">
    {/* Back to narrow — contrasts with the wider HowItWorks */}
    <div className="max-w-xl mx-auto px-6">
      <motion.h2
        className="text-xl md:text-2xl font-bold text-right mb-3 leading-tight"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        מה תקבלו בסוף התהליך?
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-right text-sm mb-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        דוח אישי ומפורט שמתרגם את הניסיון שלכם לכיוון ברור ומעשי
      </motion.p>

      {/* No border wrapper, just indented text blocks */}
      <div className="space-y-5 pr-4 border-r border-border/30">
        {sampleResults.map((r, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.08, duration: 0.7 }}
          >
            <p className="text-[0.7rem] font-semibold text-primary/60 mb-0.5 tracking-wide uppercase">{r.label}</p>
            <p className="text-foreground text-base leading-relaxed">{r.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-xs text-muted-foreground/60 mt-6"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        * זו דוגמה בלבד — הדוח שלכם יהיה מותאם אישית לחלוטין
      </motion.p>

      <motion.div
        className="mt-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.55, duration: 0.7 }}
      >
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="px-7 py-3 rounded-lg bg-accent text-accent-foreground font-bold text-sm hover:opacity-90 transition-opacity duration-300"
        >
          רוצים לקבל את הדוח שלכם? צרו קשר
        </button>
      </motion.div>
    </div>
  </section>
);

export default LandingResultPreview;
