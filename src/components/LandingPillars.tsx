import { motion } from 'framer-motion';

const pillars = [
  {
    title: 'פסיכולוגיה תעסוקתית מותאמת לגיל 60+',
    desc: 'מודלים מדעיים מוכחים (Holland, Schein, VIA) שכוילו מחדש לשפה ולמציאות של בעלי 40 שנות ניסיון — אבחון של חוזקות, ערכים ועוגני זהות, לא של "התחלת קריירה".',
  },
  {
    title: 'בינה מלאכותית שמתרגמת ניסיון לכיוון',
    desc: 'מנוע AI ייעודי מצליב את הפרופיל האישי עם נתוני שוק עדכניים בישראל — ויודע להמליץ על תפקידי ייעוץ, התנדבות משמעותית, דירקטוריונים, פרילאנס או למידה חדשה.',
  },
  {
    title: 'חוויית משתמש שנבנתה לגיל השלישי',
    desc: 'טיפוגרפיה גדולה, ניגודיות גבוהה, ניווט "הבא/חזור" ללא תפריטים מסובכים, וקצב שקול שמכבד את הזמן והקצב של המשתמש — נגישות WCAG AAA.',
  },
  {
    title: 'מפת דרכים אישית לפעולה',
    desc: 'התוצאה אינה דוח שנשכח במגירה — אלא מפת דרכים אינטראקטיבית עם אבני דרך מעשיות, הזדמנויות אמיתיות, וכלים נלווים (כמו GoldenCanvas לגילוי כישרון יצירתי).',
  },
];

const LandingPillars = () => (
  <section className="pt-20 pb-12 md:pt-28 md:pb-16">
    <div className="max-w-2xl mx-auto px-6">
      <motion.p
        className="text-sm text-accent font-semibold mb-3 tracking-wide text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        הפתרון
      </motion.p>

      <motion.h2
        className="text-2xl md:text-3xl font-bold text-right mb-4 leading-tight font-serif"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        כלי הפסיכולוגיה התעסוקתית הראשון
        <br />
        <span className="text-accent">שתוכנן מהיסוד לגיל 60+</span>
      </motion.h2>

      <motion.p
        className="text-muted-foreground text-base leading-[1.85] mb-10 text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.8 }}
      >
        Sageify משלב ארבעה רכיבים שעובדים יחד — מתודולוגיה מדעית, AI מותאם, חוויה נגישה,
        {' '}ומפת דרכים אקטיבית. התוצאה: לא עוד עצה כללית, אלא מסלול ברור לעשייה.
      </motion.p>

      <div className="space-y-7">
        {pillars.map((p, i) => (
          <motion.div
            key={i}
            className="border-r-2 border-accent/40 pr-5"
            initial={{ opacity: 0, x: 10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.7 }}
          >
            <h3 className="font-display font-bold text-base mb-1.5 text-right">{p.title}</h3>
            <p className="text-muted-foreground text-[15px] leading-[1.8] text-right">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingPillars;
