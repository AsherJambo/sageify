import { motion } from 'framer-motion';

const audiences = [
  { badge: 'B2B', title: 'ארגונים ומעסיקים', desc: 'חבילת Offboarding – ליווי עובדים פורשים עם כלי אבחון מקצועי ותובנות אגרגטיביות' },
  { badge: 'B2C', title: 'פורשים ומתכננים פרישה', desc: 'פורטל אבחון אישי – מחפשים תכלית ועיסוק משמעותי בפרק הבא של החיים' },
  { badge: 'B2G', title: 'ממשל ומוסדות', desc: 'אופטימיזציה לאומית – ניצול הון אנושי מנוסה לטובת הקהילה והחברה' },
];

const LandingAudiences = () => (
  <section className="pt-12 pb-20 md:pt-16 md:pb-28 bg-muted/10">
    <div className="max-w-2xl mx-auto px-6">
      <motion.h2
        className="text-2xl md:text-[2.25rem] font-bold text-right mb-10 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9 }}
      >
        למי זה מתאים
      </motion.h2>

      <div className="space-y-0">
        {audiences.map((a, i) => {
          const isLast = i === audiences.length - 1;
          return (
            <motion.div
              key={i}
              className={`py-6 ${!isLast ? 'border-b border-border/40' : ''}`}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.15 + i * 0.1 }}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[0.65rem] font-bold text-primary/60 tracking-widest uppercase">{a.badge}</span>
                <h3 className="text-base font-bold font-display">{a.title}</h3>
              </div>
              <p className="text-muted-foreground text-[0.95rem] leading-[1.8]">{a.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </div>
  </section>
);

export default LandingAudiences;
