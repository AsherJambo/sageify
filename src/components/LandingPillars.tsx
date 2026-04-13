import { motion } from 'framer-motion';
import { Brain, Cpu, Trophy } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.15, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const pillars = [
  {
    icon: Brain,
    title: 'פסיכולוגיה תעסוקתית',
    desc: 'אבחון מעמיק של צרכים רגשיים, חוזקות אופי, ועוגני קריירה — מבוסס על מודלים מדעיים מוכחים כמו Holland, Schein ו-VIA.',
    color: 'bg-primary/8 text-primary',
  },
  {
    icon: Cpu,
    title: 'בינה מלאכותית חכמה',
    desc: 'מערכת AI שמתאימה מפת דרכים אישית בהתבסס על מודל ייחודי לפורשים בישראל — נתוני שוק, מגמות והזדמנויות בזמן אמת.',
    color: 'bg-secondary/8 text-secondary',
  },
  {
    icon: Trophy,
    title: 'גיימיפיקציה מתוחכמת',
    desc: 'הפיכת תהליך המעבר למסע אישי עם אבני דרך, תגים מקצועיים ומשימות מותאמות — חוויה מעצימה שמניעה לפעולה.',
    color: 'bg-accent/8 text-accent',
  },
];

const LandingPillars = () => (
  <section className="relative py-24 md:py-36 bg-muted/20 overflow-hidden">
    <div className="max-w-5xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-widest uppercase text-center mb-4"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
        המתודולוגיה
      </motion.p>
      <motion.h2 className="text-3xl md:text-[2.75rem] font-bold text-center mb-5 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
        שלושת העמודים של Sageify
      </motion.h2>
      <motion.p className="text-muted-foreground text-center text-lg mb-16 max-w-lg mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
        שילוב ייחודי של מדע, טכנולוגיה וחוויה אנושית
      </motion.p>

      <div className="grid md:grid-cols-3 gap-6">
        {pillars.map((p, i) => (
          <motion.div
            key={i}
            className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 hover:translate-y-[-3px]"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}
          >
            <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center mb-6`}>
              <p.icon size={26} />
            </div>
            <h3 className="text-xl font-bold mb-3 font-display">{p.title}</h3>
            <p className="text-muted-foreground leading-relaxed">{p.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LandingPillars;
