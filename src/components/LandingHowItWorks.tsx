import { motion } from 'framer-motion';
import { MessageSquare, Sparkles, Map } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const steps = [
  {
    icon: MessageSquare,
    step: '01',
    title: 'עונים על שאלות קצרות',
    desc: 'שאלונים פשוטים שנבנו על בסיס פסיכולוגיה תעסוקתית — בקצב שלכם, בלי לחץ',
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
    title: 'מקבלים כיוון אישי ברור',
    desc: 'דוח מפורט עם המלצות מעשיות, הזדמנויות רלוונטיות ומפת דרכים אישית',
    time: 'מיידי',
  },
];

const LandingHowItWorks = () => (
  <section className="py-24 md:py-32 bg-muted/25 relative overflow-hidden">
    {/* Organic background shape */}
    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-accent/[0.03] blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
    
    <div className="max-w-4xl mx-auto px-6 relative z-10">
      <motion.p
        className="text-sm text-accent font-bold text-center mb-4 tracking-widest uppercase"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
      >
        פשוט ומהיר
      </motion.p>
      <motion.h2
        className="text-3xl md:text-[2.75rem] font-bold text-center mb-5 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}
      >
        איך זה עובד? שלושה שלבים בלבד
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center text-lg md:text-xl mb-16 max-w-xl mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}
      >
        תהליך אישי ונעים — מהשאלה הראשונה ועד לתוצאה ברורה
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6 md:gap-8">
        {steps.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div
              key={i}
              className="bg-card/80 backdrop-blur-sm border border-border/40 rounded-2xl p-8 text-center relative shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:translate-y-[-3px] group"
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}
            >
              {/* Step number */}
              <span className="absolute top-5 left-5 text-xs font-bold text-accent/60 font-display tracking-wider">
                {s.step}
              </span>

              <div className="w-16 h-16 rounded-2xl bg-secondary/8 flex items-center justify-center mx-auto mb-6 group-hover:bg-secondary/12 transition-colors duration-500">
                <Icon className="w-7 h-7 text-secondary" />
              </div>

              <h3 className="text-xl font-bold mb-3 font-serif">{s.title}</h3>
              <p className="text-muted-foreground text-base leading-relaxed mb-5">{s.desc}</p>
              <span className="inline-block text-xs font-semibold text-secondary bg-secondary/8 px-4 py-1.5 rounded-full tracking-wide">
                {s.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingHowItWorks;
