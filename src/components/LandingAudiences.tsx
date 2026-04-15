import { motion } from 'framer-motion';

const audiences = [
  { badge: 'B2B', title: 'ארגונים ומעסיקים', desc: 'חבילת Offboarding – ליווי עובדים פורשים עם כלי אבחון מקצועי ותובנות אגרגטיביות' },
  { badge: 'B2C', title: 'פורשים ומתכננים פרישה', desc: 'פורטל אבחון אישי – מחפשים תכלית ועיסוק משמעותי בפרק הבא של החיים' },
  { badge: 'B2G', title: 'ממשל ומוסדות', desc: 'אופטימיזציה לאומית – ניצול הון אנושי מנוסה לטובת הקהילה והחברה' },
];

const LandingAudiences = () => (
  <section className="py-20 md:py-28 relative overflow-hidden">
    <div className="max-w-4xl mx-auto px-6">
      <motion.h2
        className="text-3xl md:text-[2.6rem] font-bold text-center mb-16 leading-tight"
        initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 1 }}
      >
        למי זה מתאים
      </motion.h2>

      {/* Asymmetric: first item wide, next two side by side */}
      <div className="space-y-6">
        <motion.div
          className="border border-border bg-card rounded-2xl p-8 md:p-10 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500 md:max-w-2xl md:mx-auto"
          initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.15 }}
        >
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-block px-3.5 py-1 rounded-full border border-primary/25 text-primary text-xs font-bold tracking-widest uppercase">
              {audiences[0].badge}
            </span>
            <h3 className="text-xl font-bold font-serif">{audiences[0].title}</h3>
          </div>
          <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{audiences[0].desc}</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {audiences.slice(1).map((a, i) => (
            <motion.div
              key={i}
              className="border border-border bg-card rounded-2xl p-7 md:p-8 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)] transition-all duration-500"
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
              transition={{ duration: 0.9, delay: 0.3 + i * 0.12 }}
            >
              <span className="inline-block px-3.5 py-1 rounded-full border border-primary/25 text-primary text-xs font-bold mb-4 tracking-widest uppercase">
                {a.badge}
              </span>
              <h3 className="text-lg font-bold mb-2 font-serif">{a.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-base">{a.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default LandingAudiences;
