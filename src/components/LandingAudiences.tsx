import { motion } from 'framer-motion';

const audiences = [
  { badge: 'B2B', title: 'ארגונים ומעסיקים', desc: 'חבילת Offboarding – ליווי עובדים פורשים עם כלי אבחון מקצועי ותובנות אגרגטיביות' },
  { badge: 'B2C', title: 'פורשים ומתכננים פרישה', desc: 'פורטל אבחון אישי – מחפשים תכלית ועיסוק משמעותי בפרק הבא של החיים' },
  { badge: 'B2G', title: 'ממשל ומוסדות', desc: 'אופטימיזציה לאומית – ניצול הון אנושי מנוסה לטובת הקהילה והחברה' },
];

const LandingAudiences = () => (
  <section className="pt-16 pb-10 md:pt-24 md:pb-14">
    {/* Very narrow — intimate feel, different from Trust's 2-col */}
    <div className="max-w-md mx-auto px-6">
      <motion.p className="text-sm text-primary/60 mb-6 text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        למי זה מתאים
      </motion.p>

      {/* Single flowing text, not a structured list */}
      {audiences.map((a, i) => (
        <motion.p
          key={i}
          className="text-base leading-[1.9] mb-5 last:mb-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.1 + i * 0.1 }}
        >
          <span className="text-[0.6rem] font-bold text-muted-foreground/50 tracking-widest uppercase ml-2">{a.badge}</span>
          <strong className="font-display font-bold">{a.title}</strong>
          <span className="text-muted-foreground"> — {a.desc}</span>
        </motion.p>
      ))}
    </div>
  </section>
);

export default LandingAudiences;
