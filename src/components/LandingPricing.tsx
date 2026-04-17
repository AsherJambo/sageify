import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

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
  <section className="py-20 md:py-32">
    <div className="max-w-3xl mx-auto px-6">
      <motion.p className="text-sm font-semibold text-primary tracking-wide text-right mb-3"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8 }}>
        מסלולים
      </motion.p>
      <motion.h2 className="text-2xl md:text-[2.25rem] font-bold text-right mb-4 leading-tight"
        initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.1 }}>
        בחרו את המסלול שלכם
      </motion.h2>
      <motion.p className="text-muted-foreground text-right text-base mb-12"
        initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
        transition={{ duration: 0.9, delay: 0.2 }}>
        תשלום חד-פעמי. בלי מנויים. בלי הפתעות.
      </motion.p>

      {/* No card boxes — plans separated by a vertical line on desktop */}
      <div className="flex flex-col md:flex-row gap-10 md:gap-14 md:items-start md:divide-x md:divide-x-reverse md:divide-border/50">
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            className={`flex-1 ${i > 0 ? 'md:pr-14' : ''}`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 + i * 0.1 }}
          >
            {plan.highlighted && (
              <span className="inline-block text-[0.65rem] font-bold text-accent tracking-wide uppercase mb-3">מומלץ</span>
            )}

            <div className="mb-5">
              <span className="text-xs text-muted-foreground">{plan.badge}</span>
              <h3 className="text-xl font-bold font-display mt-0.5">{plan.nameHe}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{plan.name}</p>
            </div>

            <div className="flex items-baseline gap-1 mb-1.5">
              <span className="text-3xl font-bold">{plan.price}</span>
              <span className="text-base text-muted-foreground">₪</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{plan.desc}</p>

            <ul className="space-y-2.5 mb-7">
              {plan.features.map((f, j) => (
                <li key={j} className="flex items-start gap-2.5 text-sm">
                  <Check size={14} className="text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))}
              className={`text-sm font-bold transition-opacity duration-300 hover:opacity-70 ${
                plan.highlighted ? 'text-accent' : 'text-foreground'
              }`}
            >
              בואו נתחיל ←
            </button>
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-right text-muted-foreground text-sm mt-8"
        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        מחפשים פתרון ארגוני? <button onClick={() => document.dispatchEvent(new CustomEvent('open-contact-modal'))} className="text-primary font-semibold hover:underline">צרו קשר לרישוי B2B</button>
      </motion.p>
    </div>
  </section>
);

export default LandingPricing;
