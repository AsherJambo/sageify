import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Map } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const steps = [
  {
    icon: MessageSquare,
    step: '1',
    title: 'עונים על שאלות קצרות',
    desc: 'שאלונים פשוטים שנבנו על בסיס פסיכולוגיה תעסוקתית — בקצב שלכם, בלי לחץ',
    time: '~10 דקות',
  },
  {
    icon: Sparkles,
    step: '2',
    title: 'המערכת מנתחת את התשובות',
    desc: 'ניתוח מעמיק שמצליב את הניסיון, הערכים והכישורים שלכם לתמונה ברורה',
    time: 'אוטומטי',
  },
  {
    icon: Map,
    step: '3',
    title: 'מקבלים כיוון אישי ברור',
    desc: 'דוח מפורט עם המלצות מעשיות, הזדמנויות רלוונטיות ומפת דרכים אישית',
    time: 'מיידי',
  },
];

const LandingHowItWorks = () => (
  <section className="py-20 md:py-28">
    <div className="max-w-4xl mx-auto px-6">
      <motion.p
        className="text-sm text-accent font-semibold text-center mb-3 tracking-wide"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        פשוט ומהיר
      </motion.p>
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-4"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        איך זה עובד? שלושה שלבים בלבד
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center text-lg mb-16 max-w-xl mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
      >
        תהליך קצר, אישי ונעים — מהשאלה הראשונה ועד לתוצאה ברורה
      </motion.p>

      <div className="grid md:grid-cols-3 gap-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              className="bg-card border border-border/50 rounded-lg p-8 text-center relative"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}
            >
              {/* Step number */}
              <span className="absolute top-4 left-4 text-xs font-bold text-accent bg-accent/10 rounded-full w-7 h-7 inline-flex items-center justify-center">
                {s.step}
              </span>

              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Icon className="w-7 h-7 text-primary" />
              </div>

              <h3 className="text-lg font-bold mb-3 font-serif">{s.title}</h3>
              <p className="text-muted-foreground text-[15px] leading-relaxed mb-4">{s.desc}</p>
              <span className="inline-block text-xs font-medium text-accent bg-accent/10 px-3 py-1 rounded-full">
                {s.time}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Connecting line decoration - hidden on mobile */}
      <div className="hidden md:flex justify-center mt-8">
        <motion.p
          className="text-muted-foreground text-sm"
          initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={6}
        >
          ⏱ התהליך כולו לוקח כ-10 דקות — בקצב שלכם, מכל מקום
        </motion.p>
      </div>
    </div>
  </section>
);

export default LandingHowItWorks;
