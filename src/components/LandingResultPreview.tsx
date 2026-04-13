import { motion } from 'framer-motion';
import { TrendingUp, Heart, Briefcase, Lightbulb } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const sampleResults = [
  {
    icon: TrendingUp,
    label: 'הכיוון המומלץ',
    value: 'מנטורינג וליווי מקצועי לצעירים',
  },
  {
    icon: Heart,
    label: 'הערכים המובילים שלך',
    value: 'תרומה לזולת, העברת ידע, יצירתיות',
  },
  {
    icon: Briefcase,
    label: 'הזדמנויות רלוונטיות',
    value: '3 תוכניות מנטורינג פעילות באזורך',
  },
  {
    icon: Lightbulb,
    label: 'תובנה אישית',
    value: 'הניסיון הניהולי שלך הוא הנכס החזק ביותר — הגיע הזמן להעביר אותו הלאה',
  },
];

const LandingResultPreview = () => (
  <section className="py-20 md:py-28 bg-muted/30">
    <div className="max-w-4xl mx-auto px-6">
      <motion.p
        className="text-sm text-accent font-semibold text-center mb-3 tracking-wide"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        דוגמה לתוצאה
      </motion.p>
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-4"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        מה תקבלו בסוף התהליך?
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center text-lg mb-14 max-w-xl mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
      >
        דוח אישי ומפורט שמתרגם את הניסיון שלכם לכיוון ברור ומעשי
      </motion.p>

      {/* Sample result card */}
      <motion.div
        className="bg-card border border-border/50 rounded-lg overflow-hidden shadow-[0_8px_40px_-12px_hsl(210_45%_14%/0.08)]"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={3}
      >
        {/* Header */}
        <div className="bg-primary/5 border-b border-border/50 px-8 py-5">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <p className="font-semibold text-base">הדוח האישי שלך — דוגמה</p>
          </div>
        </div>

        {/* Results */}
        <div className="p-8 space-y-6">
          {sampleResults.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div
                key={i}
                className="flex items-start gap-4"
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 4}
              >
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-accent mb-1">{r.label}</p>
                  <p className="text-foreground text-[16px] leading-relaxed">{r.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="border-t border-border/50 px-8 py-4 bg-muted/20">
          <p className="text-xs text-muted-foreground text-center">
            * זו דוגמה בלבד — הדוח שלכם יהיה מותאם אישית לחלוטין
          </p>
        </div>
      </motion.div>

      <motion.div
        className="text-center mt-10"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={8}
      >
        <a
          href="mailto:sageify.ai@gmail.com"
          className="inline-flex items-center justify-center px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-all duration-500 shadow-md"
        >
          רוצים לקבל את הדוח שלכם? צרו קשר
        </a>
      </motion.div>
    </div>
  </section>
);

export default LandingResultPreview;
