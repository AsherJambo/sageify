import { motion } from 'framer-motion';

const steps = [
  { n: '1', title: 'עונים על שאלות קצרות', desc: 'שאלונים פשוטים שנבנו על בסיס פסיכולוגיה תעסוקתית — בקצב שלכם', time: '~10 דקות' },
  { n: '2', title: 'המערכת מנתחת את התשובות', desc: 'ניתוח מעמיק שמצליב את הניסיון, הערכים והכישורים שלכם לתמונה ברורה', time: 'אוטומטי' },
  { n: '3', title: 'מקבלים את מפת הדרכים שלכם', desc: 'דוח מפורט עם המלצות מעשיות, הזדמנויות רלוונטיות ומפת דרכים אישית', time: 'מיידי' },
];

const LandingHowItWorks = () => (
  <section className="py-16 md:py-24 bg-muted/8">
    {/* Wider than pillars, different width creates rhythm */}
    <div className="max-w-3xl mx-auto px-6">
      <motion.h2
        className="text-xl md:text-2xl font-bold text-right mb-10 leading-tight"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        איך זה עובד? שלושה שלבים
      </motion.h2>

      {/* Horizontal on desktop — different from vertical lists above */}
      <div className="flex flex-col md:flex-row md:gap-10 gap-8">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="flex-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.1, duration: 0.8 }}
          >
            <span className="text-3xl font-bold text-border font-display">{s.n}</span>
            <h3 className="text-base font-bold font-display mt-2 mb-1.5">{s.title}</h3>
            <p className="text-muted-foreground text-sm leading-[1.75]">{s.desc}</p>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-muted-foreground text-sm mt-8 text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        תהליך אישי ונעים — מהשאלה הראשונה ועד לתוצאה ברורה
      </motion.p>
    </div>
  </section>
);

export default LandingHowItWorks;
