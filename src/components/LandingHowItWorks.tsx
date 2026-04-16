import { motion } from 'framer-motion';

const steps = [
  {
    step: '01',
    title: 'עונים על שאלות קצרות',
    desc: 'שאלונים פשוטים שנבנו על בסיס פסיכולוגיה תעסוקתית — בקצב שלכם',
    time: '~10 דקות',
  },
  {
    step: '02',
    title: 'המערכת מנתחת את התשובות',
    desc: 'ניתוח מעמיק שמצליב את הניסיון, הערכים והכישורים שלכם לתמונה ברורה',
    time: 'אוטומטי',
  },
  {
    step: '03',
    title: 'מקבלים את מפת הדרכים שלכם',
    desc: 'דוח מפורט עם המלצות מעשיות, הזדמנויות רלוונטיות ומפת דרכים אישית',
    time: 'מיידי',
  },
];

const LandingHowItWorks = () => (
  <section className="pt-16 pb-20 md:pt-20 md:pb-28">
    <div className="max-w-2xl mx-auto px-6">
      <motion.p
        className="text-sm text-primary font-semibold text-right mb-3 tracking-wide"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        פשוט ומהיר
      </motion.p>
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold text-right mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}
      >
        איך זה עובד? שלושה שלבים
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-right text-base mb-12"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}
      >
        תהליך אישי ונעים — מהשאלה הראשונה ועד לתוצאה ברורה
      </motion.p>

      <div className="space-y-8">
        {steps.map((s, i) => (
          <motion.div
            key={i}
            className="flex items-start gap-4"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 + i * 0.12, duration: 0.8 }}
          >
            <span className="text-[0.7rem] font-bold text-primary/40 font-sans tracking-wider mt-1.5 shrink-0 w-6">{s.step}</span>
            <div>
              <h3 className="text-base md:text-lg font-bold font-display mb-1">{s.title}</h3>
              <p className="text-muted-foreground text-[0.95rem] leading-[1.75] mb-1.5">{s.desc}</p>
              <span className="text-xs text-primary/60 font-medium">{s.time}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingHowItWorks;
