import { motion } from 'framer-motion';
import { Shield, BookOpen, Users, Heart } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const trustPoints = [
  { icon: BookOpen, title: 'מבוסס על מדע', desc: 'השאלונים מבוססים על מודלים מוכחים מפסיכולוגיה תעסוקתית — Holland, Schein, VIA ועוד' },
  { icon: Users, title: 'נבדק עם אנשים אמיתיים', desc: 'עשרות פורשים כבר עברו את התהליך ודיווחו על בהירות חדשה לגבי הכיוון שלהם' },
  { icon: Heart, title: 'נבנה מתוך אכפתיות', desc: 'יצרנו את Sageify כי ראינו שאין כלי מותאם לגיל הפרישה — ורצינו לתקן את זה' },
  { icon: Shield, title: 'פרטיות מלאה', desc: 'המידע שלכם מוגן ומאובטח. אנחנו לא משתפים נתונים עם צד שלישי — לעולם' },
];

const LandingTrust = () => (
  <section className="py-24 md:py-32 bg-muted/25 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 w-[500px] h-[500px] rounded-full bg-secondary/[0.03] blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
    
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-accent font-bold text-center mb-4 tracking-widest uppercase"
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

      <div className="grid sm:grid-cols-2 gap-6">
        {trustPoints.map((t, i) => {
          const Icon = t.icon;
          return (
            <motion.div
              key={i}
              className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-8 flex items-start gap-5 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:translate-y-[-2px]"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 2}
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/8 flex items-center justify-center shrink-0">
                <Icon className="w-5.5 h-5.5 text-secondary" />
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
