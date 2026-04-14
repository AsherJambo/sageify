import { motion } from 'framer-motion';
import { TrendingUp, Heart, Briefcase, Lightbulb } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const sampleResults = [
  { icon: TrendingUp, label: 'הכיוון המומלץ', value: 'מנטורינג וליווי מקצועי לצעירים' },
  { icon: Heart, label: 'הערכים המובילים שלך', value: 'תרומה לזולת, העברת ידע, יצירתיות' },
  { icon: Briefcase, label: 'הזדמנויות רלוונטיות', value: '3 תוכניות מנטורינג פעילות באזורך' },
  { icon: Lightbulb, label: 'תובנה אישית', value: 'הניסיון הניהולי שלך הוא הנכס החזק ביותר — הגיע הזמן להעביר אותו הלאה' },
];

const LandingResultPreview = () => (
  <section className="py-24 md:py-32 relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-primary font-bold text-center mb-4 tracking-widest uppercase"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        דוגמה לתוצאה
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold text-center mb-5 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        מה תקבלו בסוף התהליך?
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center text-lg md:text-xl mb-14 max-w-xl mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
      >
        דוח אישי ומפורט שמתרגם את הניסיון שלכם לכיוון ברור ומעשי
      </motion.p>

      <motion.div
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)]"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
      >
        <div className="bg-muted/30 border-b border-border px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <p className="font-display font-bold text-base tracking-wide">מפת הדרכים האישית שלך — דוגמה</p>
          </div>
        </div>

        <div className="p-8 md:p-10 space-y-7">
          {sampleResults.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-5"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 4}
              >
                <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5.5 h-5.5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary mb-1.5 tracking-wide uppercase">{r.label}</p>
                  <p className="text-foreground text-lg leading-relaxed">{r.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="border-t border-border px-8 py-4 bg-muted/15">
          <p className="text-xs text-muted-foreground text-center">
            * זו דוגמה בלבד — הדוח שלכם יהיה מותאם אישית לחלוטין
          </p>
        </div>
      </motion.div>

      <motion.div
        className="text-center mt-12"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={8}
      >
        <button
          onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
          className="inline-flex items-center justify-center px-10 py-4 rounded-2xl bg-accent text-accent-foreground font-bold text-lg hover:opacity-90 transition-all duration-500 shadow-[var(--shadow-elevated)] hover:translate-y-[-2px]"
        >
          רוצים לקבל את הדוח שלכם? צרו קשר
        </button>
      </motion.div>
    </div>
  </section>
);

export default LandingResultPreview;
