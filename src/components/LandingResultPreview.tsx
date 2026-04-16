import { motion } from 'framer-motion';

const sampleResults = [
  { label: 'הכיוון המומלץ', value: 'מנטורינג וליווי מקצועי לצעירים' },
  { label: 'הערכים המובילים שלך', value: 'תרומה לזולת, העברת ידע, יצירתיות' },
  { label: 'הזדמנויות רלוונטיות', value: '3 תוכניות מנטורינג פעילות באזורך' },
  { label: 'תובנה אישית', value: 'הניסיון הניהולי שלך הוא הנכס החזק ביותר — הגיע הזמן להעביר אותו הלאה' },
];

const LandingResultPreview = () => (
  <section className="py-20 md:py-32 bg-muted/10">
    <div className="max-w-2xl mx-auto px-6">
      <motion.p
        className="text-sm text-primary font-semibold text-right mb-3 tracking-wide"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        דוגמה לתוצאה
      </motion.p>
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold text-right mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        מה תקבלו בסוף התהליך?
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-right text-base mb-10"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        דוח אישי ומפורט שמתרגם את הניסיון שלכם לכיוון ברור ומעשי
      </motion.p>

      {/* Simple text list — no heavy card wrapper */}
      <motion.div
        className="border border-border/60 rounded-lg overflow-hidden"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.25 }}
      >
        <div className="border-b border-border/40 px-6 py-3.5 bg-muted/20">
          <p className="font-display font-bold text-sm">מפת הדרכים האישית שלך — דוגמה</p>
        </div>

        <div className="divide-y divide-border/30">
          {sampleResults.map((r, i) => (
            <motion.div
              key={i}
              className="px-6 py-5"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.7 }}
            >
              <p className="text-xs font-semibold text-primary mb-1 tracking-wide">{r.label}</p>
              <p className="text-foreground text-base leading-relaxed">{r.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-border/40 px-6 py-3 bg-muted/10">
          <p className="text-xs text-muted-foreground">
            * זו דוגמה בלבד — הדוח שלכם יהיה מותאם אישית לחלוטין
          </p>
        </div>
      </motion.div>

      <motion.div
        className="text-right mt-10"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.7 }}
      >
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="px-8 py-3.5 rounded-lg bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-opacity duration-300"
        >
          רוצים לקבל את הדוח שלכם? צרו קשר
        </button>
      </motion.div>
    </div>
  </section>
);

export default LandingResultPreview;
