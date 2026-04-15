import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Map } from 'lucide-react';

const steps = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'עונים על שאלות קצרות',
    desc: 'שאלונים פשוטים שנבנו על בסיס פסיכולוגיה תעסוקתית — בקצב שלכם',
    time: '~10 דקות',
  },
  {
    icon: Sparkles,
    step: '02',
    title: 'המערכת מנתחת את התשובות',
    desc: 'ניתוח מעמיק שמצליב את הניסיון, הערכים והכישורים שלכם לתמונה ברורה',
    time: 'אוטומטי',
  },
  {
    icon: Map,
    step: '03',
    title: 'מקבלים את מפת הדרכים שלכם',
    desc: 'דוח מפורט עם המלצות מעשיות, הזדמנויות רלוונטיות ומפת דרכים אישית',
    time: 'מיידי',
  },
];

const LandingHowItWorks = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-3xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-primary font-bold text-right mb-4 tracking-widest uppercase"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}
      >
        פשוט ומהיר
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.6rem] font-bold text-right mb-5 leading-tight"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1 }}
      >
        איך זה עובד? שלושה שלבים
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-right text-lg md:text-xl mb-16"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        תהליך אישי ונעים — מהשאלה הראשונה ועד לתוצאה ברורה
      </motion.p>

      {/* Vertical narrative flow — not a 3-col grid */}
      <div className="space-y-0">
        {steps.map((s, i) => {
          const Icon = s.icon;
          const isLast = i === steps.length - 1;
          return (
            <motion.div
              key={i}
              className="flex items-start gap-6 md:gap-8 relative"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + i * 0.18, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Vertical connector */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-primary/8 flex items-center justify-center">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                {!isLast && (
                  <div className="w-px h-full min-h-[3rem] bg-border mt-2" />
                )}
              </div>

              <div className={`pb-10 ${isLast ? 'pb-0' : ''}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xs font-bold text-primary/50 font-display tracking-wider">{s.step}</span>
                  <h3 className="text-lg md:text-xl font-bold font-serif">{s.title}</h3>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed mb-2">{s.desc}</p>
                <span className="inline-block text-xs font-semibold text-primary bg-primary/8 px-3 py-1 rounded-full tracking-wide">
                  {s.time}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingHowItWorks;
