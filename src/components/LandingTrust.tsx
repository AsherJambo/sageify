import { motion } from 'framer-motion';
import { Shield, BookOpen, Users, Heart } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const trustPoints = [
  {
    icon: BookOpen,
    title: 'מבוסס על מדע',
    desc: 'השאלונים מבוססים על מודלים מוכחים מפסיכולוגיה תעסוקתית — Holland, Schein, VIA ועוד',
  },
  {
    icon: Users,
    title: 'נבדק עם אנשים אמיתיים',
    desc: 'עשרות פורשים כבר עברו את התהליך ודיווחו על בהירות חדשה לגבי הכיוון שלהם',
  },
  {
    icon: Heart,
    title: 'נבנה מתוך אכפתיות',
    desc: 'יצרנו את Sageify כי ראינו שאין כלי מותאם לגיל הפרישה — ורצינו לתקן את זה',
  },
  {
    icon: Shield,
    title: 'פרטיות מלאה',
    desc: 'המידע שלכם מוגן ומאובטח. אנחנו לא משתפים נתונים עם צד שלישי — לעולם',
  },
];

const LandingTrust = () => (
  <section className="py-20 md:py-28">
    <div className="max-w-4xl mx-auto px-6">
      <motion.p
        className="text-sm text-accent font-semibold text-center mb-3 tracking-wide"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        למה לסמוך עלינו
      </motion.p>
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-14"
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
              className="bg-card border border-border/50 rounded-lg p-7 flex items-start gap-4"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 2}
            >
              <div className="w-11 h-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-base mb-1.5 font-serif">{t.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{t.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingTrust;
