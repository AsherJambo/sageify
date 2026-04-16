import { motion } from 'framer-motion';

const trustPoints = [
  { title: 'מבוסס על מדע', desc: 'השאלונים מבוססים על מודלים מוכחים מפסיכולוגיה תעסוקתית — Holland, Schein, VIA ועוד' },
  { title: 'מותאם לגיל ולשלב בחיים', desc: 'בנוי על מודלי "שלבי גשר" בחיים — חוויית משתמש, שפה ותובנות שעוצבו במיוחד עבור הגיל השלישי ומעבר הפרישה' },
  { title: 'נבדק עם אנשים אמיתיים', desc: 'עשרות פורשים כבר עברו את התהליך ודיווחו על בהירות חדשה לגבי הכיוון שלהם' },
  { title: 'נבנה מתוך אכפתיות', desc: 'יצרנו את Sageify כי ראינו שאין כלי מותאם לגיל הפרישה — ורצינו לתקן את זה' },
  { title: 'פרטיות מלאה', desc: 'המידע שלכם מוגן ומאובטח. אנחנו לא משתפים נתונים עם צד שלישי — לעולם' },
];

const LandingTrust = () => (
  <section className="py-24 md:py-32">
    <div className="max-w-2xl mx-auto px-6">
      <motion.p
        className="text-sm text-primary font-semibold text-right mb-3 tracking-wide"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        למה לסמוך עלינו
      </motion.p>
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold text-right mb-14 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        מערכת שנבנתה בשבילכם
      </motion.h2>

      <div className="space-y-0">
        {trustPoints.map((t, i) => {
          const isLast = i === trustPoints.length - 1;
          return (
            <motion.div
              key={i}
              className={`py-6 ${!isLast ? 'border-b border-border/40' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.08, duration: 0.7 }}
            >
              <h3 className="font-bold text-base mb-1 font-display">{t.title}</h3>
              <p className="text-muted-foreground text-[0.95rem] leading-[1.8]">{t.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingTrust;
