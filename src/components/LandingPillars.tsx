import { motion } from 'framer-motion';

const pillars = [
  { title: 'פסיכולוגיה תעסוקתית', desc: 'אבחון מעמיק של צרכים רגשיים, חוזקות אופי, ועוגני קריירה — מבוסס על מודלים מדעיים מוכחים כמו Holland, Schein ו-VIA.' },
  { title: 'בינה מלאכותית חכמה', desc: 'מערכת AI שמתאימה מפת דרכים אישית בהתבסס על מודל ייחודי לפורשים בישראל — נתוני שוק, מגמות והזדמנויות בזמן אמת.' },
  { title: 'גיימיפיקציה מתוחכמת', desc: 'הפיכת תהליך המעבר למסע אישי עם אבני דרך, תגים מקצועיים ומשימות מותאמות — חוויה מעצימה שמניעה לפעולה.' },
];

const LandingPillars = () => (
  <section className="pt-20 pb-12 md:pt-28 md:pb-16">
    {/* Narrow, essay-like — just text, no icons, no structure */}
    <div className="max-w-lg mx-auto px-6">
      <motion.p className="text-sm text-primary/70 mb-6 tracking-wide text-right"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        המתודולוגיה
      </motion.p>

      {/* Each pillar is just a paragraph with a bold opening */}
      {pillars.map((p, i) => (
        <motion.p
          key={i}
          className="text-base leading-[1.9] mb-6 last:mb-0"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 + i * 0.12, duration: 0.9 }}
        >
          <strong className="font-display font-bold">{p.title}</strong>
          <span className="text-muted-foreground"> — {p.desc}</span>
        </motion.p>
      ))}
    </div>
  </section>
);

export default LandingPillars;
