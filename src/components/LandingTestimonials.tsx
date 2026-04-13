import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const testimonials = [
  {
    quote: 'Sageify הפך את תהליך הפרישה מחוויה מלחיצה לצעד מעצים. העובדים שלנו יצאו עם תוכנית ברורה ותחושת ערך.',
    name: 'מיכל כהן',
    role: 'סמנכ"לית משאבי אנוש',
    org: 'ארגון תעשייתי מוביל',
  },
  {
    quote: 'הדוח שקיבלנו היה מדויק להפתיע. הוא חשף חוזקות שלא ידענו שקיימות ופתח דלתות להזדמנויות חדשות.',
    name: 'דוד לוי',
    role: 'מנהל תכנית פרישה',
    org: 'חברת הייטק בינלאומית',
  },
  {
    quote: 'כיועצת קריירה, Sageify נתן לי כלים שלא היו קיימים קודם. האבחון מותאם לגיל ומבוסס על מדע אמיתי.',
    name: 'ד"ר רונית שרון',
    role: 'יועצת קריירה',
    org: 'פרקטיקה פרטית',
  },
];

const LandingTestimonials = () => {
  return (
    <section className="py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6">
        <motion.h2
          className="text-3xl md:text-4xl font-bold text-center mb-14"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
        >
          מה אומרים עלינו
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="relative bg-card border border-border/50 rounded-lg p-8 flex flex-col"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i + 1}
            >
              <div className="absolute -top-4 right-8 text-5xl text-accent/30 font-serif leading-none select-none">
                &ldquo;
              </div>
              <p className="text-foreground/85 text-[15px] leading-relaxed mb-6 pt-4 flex-1">
                {t.quote}
              </p>
              <div className="border-t border-border/40 pt-4">
                <p className="font-semibold text-sm">{t.name}</p>
                <p className="text-muted-foreground text-xs">{t.role} · {t.org}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LandingTestimonials;
