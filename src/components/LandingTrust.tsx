import { motion } from 'framer-motion';
import { Shield, BookOpen, Users, Heart, Milestone } from 'lucide-react';

const trustPoints = [
  { icon: BookOpen, title: 'מבוסס על מדע', desc: 'השאלונים מבוססים על מודלים מוכחים מפסיכולוגיה תעסוקתית — Holland, Schein, VIA ועוד' },
  { icon: Milestone, title: 'מותאם לגיל ולשלב בחיים', desc: 'בנוי על מודלי "שלבי גשר" בחיים — חוויית משתמש, שפה ותובנות שעוצבו במיוחד עבור הגיל השלישי ומעבר הפרישה' },
  { icon: Users, title: 'נבדק עם אנשים אמיתיים', desc: 'עשרות פורשים כבר עברו את התהליך ודיווחו על בהירות חדשה לגבי הכיוון שלהם' },
  { icon: Heart, title: 'נבנה מתוך אכפתיות', desc: 'יצרנו את Sageify כי ראינו שאין כלי מותאם לגיל הפרישה — ורצינו לתקן את זה' },
  { icon: Shield, title: 'פרטיות מלאה', desc: 'המידע שלכם מוגן ומאובטח. אנחנו לא משתפים נתונים עם צד שלישי — לעולם' },
];

const LandingTrust = () => (
  <section className="py-28 md:py-36 bg-muted/20 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-primary font-bold text-center mb-4 tracking-widest uppercase"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        למה לסמוך עלינו
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold text-center mb-20 leading-tight"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1 }}
      >
        מערכת שנבנתה בשבילכם
      </motion.h2>

      {/* Simple text list with subtle dividers — no cards */}
      <div className="space-y-0">
        {trustPoints.map((t, i) => {
          const Icon = t.icon;
          const isLast = i === trustPoints.length - 1;
          return (
            <motion.div
              key={i}
              className={`py-7 md:py-8 flex items-start gap-5 md:gap-7 ${!isLast ? 'border-b border-border/60' : ''}`}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="w-10 h-10 rounded-xl bg-primary/8 flex items-center justify-center shrink-0 mt-1">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1.5 font-serif">{t.title}</h3>
                <p className="text-muted-foreground text-base leading-[1.8]">{t.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingTrust;
