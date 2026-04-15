import { motion } from 'framer-motion';
import { TrendingUp, Heart, Briefcase, Lightbulb } from 'lucide-react';

const sampleResults = [
  { icon: TrendingUp, label: 'הכיוון המומלץ', value: 'מנטורינג וליווי מקצועי לצעירים' },
  { icon: Heart, label: 'הערכים המובילים שלך', value: 'תרומה לזולת, העברת ידע, יצירתיות' },
  { icon: Briefcase, label: 'הזדמנויות רלוונטיות', value: '3 תוכניות מנטורינג פעילות באזורך' },
  { icon: Lightbulb, label: 'תובנה אישית', value: 'הניסיון הניהולי שלך הוא הנכס החזק ביותר — הגיע הזמן להעביר אותו הלאה' },
];

const LandingResultPreview = () => (
  <section className="py-24 md:py-36 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-primary font-bold text-right mb-4 tracking-widest uppercase"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        דוגמה לתוצאה
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.6rem] font-bold text-right mb-5 leading-tight"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1 }}
      >
        מה תקבלו בסוף התהליך?
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-right text-lg md:text-xl mb-14"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        דוח אישי ומפורט שמתרגם את הניסיון שלכם לכיוון ברור ומעשי
      </motion.p>

      <motion.div
        className="bg-card border border-border rounded-3xl overflow-hidden shadow-[var(--shadow-elevated)]"
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.25 }}
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
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
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
        className="text-right mt-12"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
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
