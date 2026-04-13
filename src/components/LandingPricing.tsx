import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.14, duration: 0.9, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const plans = [
  {
    name: 'The Self-Navigator',
    nameHe: 'הנווט העצמאי',
    badge: 'AI בלבד',
    price: '199',
    desc: 'תהליך אבחון מלא עם מפת דרכים מותאמת אישית',
    features: [
      'אבחון פסיכולוגי תעסוקתי מקיף',
      'מפת דרכים אישית מלאה',
      'גישה מלאה לפלטפורמה',
      'דוח תוצאות מפורט',
      'התאמת הזדמנויות חכמה',
    ],
    highlighted: false,
  },
  {
    name: 'The Premium Journey',
    nameHe: 'המסלול הפרימיום',
    badge: 'AI + ייעוץ אישי',
    price: '599',
    desc: 'הכל ב-Navigator, בתוספת ליווי אישי של מומחים',
    features: [
      'כל מה שב-Navigator',
      '2 פגישות ייעוץ אישיות',
      'כיול מומחה למפת הדרכים',
      'ליווי בתהליך המעבר',
      'גישה לקהילת פורשים',
      'תמיכה מועדפת',
    ],
    highlighted: true,
  },
];

const LandingPricing = () => (
  <section className="py-24 md:py-36">
    <div className="max-w-4xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-widest uppercase text-center mb-4"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
        מסלולים
      </motion.p>
      <motion.h2 className="text-3xl md:text-[2.75rem] font-bold text-center mb-5 leading-tight"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={1}>
        בחרו את המסלול שלכם
      </motion.h2>
      <motion.p className="text-muted-foreground text-center text-lg mb-16 max-w-md mx-auto"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={2}>
        תשלום חד-פעמי. בלי מנויים. בלי הפתעות.
      </motion.p>

      <div className="grid md:grid-cols-2 gap-6">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            className={`relative rounded-2xl border p-8 md:p-10 shadow-[var(--shadow-card)] transition-all duration-500 ${
              plan.highlighted
                ? 'border-accent/40 bg-card shadow-[var(--shadow-elevated)] ring-1 ring-accent/10'
                : 'border-border bg-card'
            }`}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i + 3}
          >
            {plan.highlighted && (
              <div className="absolute -top-3.5 right-8 px-4 py-1 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center gap-1.5">
                <Sparkles size={12} />
                מומלץ
              </div>
            )}

            <div className="mb-6">
              <span className="text-xs font-semibold text-muted-foreground tracking-wide">{plan.badge}</span>
              <h3 className="text-2xl font-bold font-display mt-1">{plan.nameHe}</h3>
              <p className="text-sm text-muted-foreground mt-1">{plan.name}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl md:text-5xl font-bold">{plan.price}</span>
              <span className="text-lg text-muted-foreground">₪</span>
            </div>
            <p className="text-sm text-muted-foreground mb-8">{plan.desc}</p>

            <ul className="space-y-3.5 mb-8">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start gap-3 text-sm">
                  <Check size={16} className="text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:sageify.ai@gmail.com"
              className={`block text-center w-full py-4 rounded-xl font-bold text-base transition-all duration-500 ${
                plan.highlighted
                  ? 'bg-accent text-accent-foreground hover:opacity-90 shadow-sm'
                  : 'bg-muted text-foreground hover:bg-muted-foreground/10'
              }`}
            >
              בואו נתחיל
            </a>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center text-muted-foreground text-sm mt-10"
        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={6}
      >
        🏢 מחפשים פתרון ארגוני? <a href="mailto:sageify.ai@gmail.com" className="text-primary font-semibold hover:underline">צרו קשר לרישוי B2B</a>
      </motion.p>
    </div>
  </section>
);

export default LandingPricing;
