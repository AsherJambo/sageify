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
  <section className="relative py-28 md:py-40 bg-muted/20 overflow-hidden">
    <div className="max-w-5xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-widest uppercase text-center mb-4"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        המתודולוגיה
      </motion.p>
      <motion.h2 className="text-3xl md:text-[2.75rem] font-bold text-center mb-5 leading-tight"
        initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.1 }}>
        שלושת העמודים של Sageify
      </motion.h2>
      <motion.p className="text-muted-foreground text-center text-lg mb-20 max-w-lg mx-auto"
        initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.2 }}>
        שילוב ייחודי של מדע, טכנולוגיה וחוויה אנושית
      </motion.p>

      {/* Asymmetric staggered layout — NOT a 3-col grid */}
      <div className="space-y-6 md:space-y-0 md:grid md:grid-cols-12 md:gap-6 md:items-start">
        {/* First pillar — large, takes more space */}
        <motion.div
          className="md:col-span-5 rounded-2xl border border-border bg-card p-9 md:p-10 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.25 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-primary/8 text-primary flex items-center justify-center mb-6">
            <Brain size={26} />
          </div>
          <h3 className="text-xl font-bold mb-3 font-display">{pillars[0].title}</h3>
          <p className="text-muted-foreground leading-relaxed">{pillars[0].desc}</p>
        </motion.div>

        {/* Second & third — stacked on the right, slightly offset */}
        <div className="md:col-span-7 space-y-6 md:pt-10">
          <motion.div
            className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 md:mr-8"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.4 }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-secondary/8 text-secondary flex items-center justify-center shrink-0">
                <Cpu size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 font-display">{pillars[1].title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[0.95rem]">{pillars[1].desc}</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 md:ml-6"
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            transition={{ duration: 0.9, delay: 0.55 }}
          >
            <div className="flex items-start gap-5">
              <div className="w-12 h-12 rounded-xl bg-accent/8 text-accent flex items-center justify-center shrink-0">
                <Trophy size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold mb-2 font-display">{pillars[2].title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[0.95rem]">{pillars[2].desc}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  </section>
);

export default LandingPillars;
