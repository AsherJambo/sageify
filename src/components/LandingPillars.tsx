import { motion } from 'framer-motion';
import { Brain, Cpu, Trophy } from 'lucide-react';

const pillars = [
  {
    icon: Brain,
    title: 'פסיכולוגיה תעסוקתית',
    desc: 'אבחון מעמיק של צרכים רגשיים, חוזקות אופי, ועוגני קריירה — מבוסס על מודלים מדעיים מוכחים כמו Holland, Schein ו-VIA.',
  },
  {
    icon: Cpu,
    title: 'בינה מלאכותית חכמה',
    desc: 'מערכת AI שמתאימה מפת דרכים אישית בהתבסס על מודל ייחודי לפורשים בישראל — נתוני שוק, מגמות והזדמנויות בזמן אמת.',
  },
  {
    icon: Trophy,
    title: 'גיימיפיקציה מתוחכמת',
    desc: 'הפיכת תהליך המעבר למסע אישי עם אבני דרך, תגים מקצועיים ומשימות מותאמות — חוויה מעצימה שמניעה לפעולה.',
  },
];

const LandingPillars = () => (
  <section className="py-20 md:py-28 bg-muted/15">
    <div className="max-w-3xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-wide text-right mb-3"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        המתודולוגיה
      </motion.p>
      <motion.h2 className="text-2xl md:text-[2.25rem] font-bold text-right mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}>
        שלושת העמודים של Sageify
      </motion.h2>
      <motion.p className="text-muted-foreground text-right text-base mb-14 max-w-md"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}>
        שילוב ייחודי של מדע, טכנולוגיה וחוויה אנושית
      </motion.p>

      {/* Simple vertical list — no cards, no grid */}
      <div className="space-y-0">
        {pillars.map((p, i) => {
          const Icon = p.icon;
          const isLast = i === pillars.length - 1;
          return (
            <motion.div
              key={i}
              className={`py-7 flex items-start gap-5 ${!isLast ? 'border-b border-border/50' : ''}`}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.8 }}
            >
              <div className="w-10 h-10 rounded-lg bg-primary/8 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-lg mb-1 font-display">{p.title}</h3>
                <p className="text-muted-foreground text-[0.95rem] leading-[1.8]">{p.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingPillars;
