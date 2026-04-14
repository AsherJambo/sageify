import { motion } from 'framer-motion';
import { Shield, BookOpen, Users, Heart, Milestone } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const trustPoints = [
  { icon: BookOpen, title: 'מבוסס על מדע', desc: 'השאלונים מבוססים על מודלים מוכחים מפסיכולוגיה תעסוקתית — Holland, Schein, VIA ועוד' },
  { icon: Milestone, title: 'מותאם לגיל ולשלב בחיים', desc: 'בנוי על מודלי "שלבי גשר" בחיים — חוויית משתמש, שפה ותובנות שעוצבו במיוחד עבור הגיל השלישי ומעבר הפרישה' },
  { icon: Users, title: 'נבדק עם אנשים אמיתיים', desc: 'עשרות פורשים כבר עברו את התהליך ודיווחו על בהירות חדשה לגבי הכיוון שלהם' },
  { icon: Heart, title: 'נבנה מתוך אכפתיות', desc: 'יצרנו את Sageify כי ראינו שאין כלי מותאם לגיל הפרישה — ורצינו לתקן את זה' },
  { icon: Shield, title: 'פרטיות מלאה', desc: 'המידע שלכם מוגן ומאובטח. אנחנו לא משתפים נתונים עם צד שלישי — לעולם' },
];

const LandingTrust = () => (
  <section className="py-24 md:py-32 bg-muted/20 relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-primary font-bold text-center mb-4 tracking-widest uppercase"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        למה לסמוך עלינו
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold text-center mb-16 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        מערכת שנבנתה בשבילכם
      </motion.h2>

      <div className="grid sm:grid-cols-2 gap-5">
        {trustPoints.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={i}
              className="bg-card border border-border rounded-2xl p-8 flex items-start gap-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:translate-y-[-2px]"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 2}
            >
              <div className="w-12 h-12 rounded-2xl bg-primary/8 flex items-center justify-center shrink-0">
                <Icon className="w-5.5 h-5.5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2 font-serif">{t.title}</h3>
                <p className="text-muted-foreground text-base leading-relaxed">{t.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingTrust;
