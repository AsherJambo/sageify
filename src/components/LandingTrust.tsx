import { motion } from 'framer-motion';

const trustPoints = [
  { title: 'מבוסס על מדע', desc: 'השאלונים מבוססים על מודלים מוכחים מפסיכולוגיה תעסוקתית — Holland, Schein, VIA ועוד' },
  { title: 'מותאם לגיל ולשלב בחיים', desc: 'בנוי על מודלי "שלבי גשר" בחיים — חוויית משתמש, שפה ותובנות שעוצבו במיוחד עבור הגיל השלישי ומעבר הפרישה' },
  { title: 'נבדק עם אנשים אמיתיים', desc: 'עשרות פורשים כבר עברו את התהליך ודיווחו על בהירות חדשה לגבי הכיוון שלהם' },
  { title: 'נבנה מתוך אכפתיות', desc: 'יצרנו את Sageify כי ראינו שאין כלי מותאם לגיל הפרישה — ורצינו לתקן את זה' },
  { title: 'פרטיות מלאה', desc: 'המידע שלכם מוגן ומאובטח. אנחנו לא משתפים נתונים עם צד שלישי — לעולם' },
];

const LandingTrust = () => (
  <section className="py-16 md:py-24">
    {/* Different width — medium, between narrow and wide */}
    <div className="max-w-2xl mx-auto px-6">
      <motion.h2
        className="text-xl md:text-2xl font-bold text-right mb-10 leading-tight"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        למה לסמוך עלינו
      </motion.h2>

      {/* Two-column on desktop to break the single-column monotony */}
      <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
        {trustPoints.map((t, i) => (
          <motion.div
            key={i}
            className={i === trustPoints.length - 1 ? 'md:col-span-2 md:max-w-sm' : ''}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 + i * 0.07, duration: 0.7 }}
          >
            <h3 className="font-bold text-sm mb-0.5 font-display">{t.title}</h3>
            <p className="text-muted-foreground text-sm leading-[1.75]">{t.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingTrust;
