import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'כמה זמן לוקח למלא את כל השאלונים?', a: 'בממוצע כ-45 דקות. אפשר לעצור ולחזור בכל שלב – המערכת שומרת את ההתקדמות שלכם אוטומטית.' },
  { q: 'האם צריך ידע טכנולוגי כדי להשתמש במערכת?', a: 'לא. המערכת מעוצבת במיוחד עבור קהל מבוגר, עם כפתורים גדולים, טקסט ברור והנחיות מפורטות בכל שלב.' },
  { q: 'מה קורה עם הנתונים שלי?', a: 'הנתונים שלכם מאובטחים ומוצפנים. הם משמשים אך ורק לצורך הפקת הדוח האישי שלכם ולא מועברים לגורמים חיצוניים.' },
  { q: 'האם אפשר להשתמש ב-Sageify באופן עצמאי?', a: 'כרגע הגישה למערכת מתבצעת דרך ארגונים או יועצי קריירה. צרו קשר ונשמח לחבר אתכם לגורם המתאים.' },
  { q: 'מה כולל הדוח שמתקבל בסוף התהליך?', a: 'דוח מפורט הכולל ניתוח חוזקות, עוגנים תעסוקתיים, נטיות מקצועיות, מפת דרכים אישית והמלצות להזדמנויות רלוונטיות בשוק.' },
  { q: 'האם הכלי מתאים גם למי שלא פרש עדיין?', a: 'בהחלט. Sageify מתאים גם למתכננים פרישה, אנשים בתהליכי מעבר קריירה, ולכל מי שרוצה להכיר את החוזקות שלו טוב יותר.' },
];

const FAQItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
  const [open, setOpen] = useState(false);
  return (
    <motion.div
      className="border-b border-border/50 last:border-b-0"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-6 md:py-7 text-right hover:text-primary transition-colors duration-500"
      >
        <span className="text-base md:text-lg font-semibold leading-relaxed">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.4 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-7 text-muted-foreground text-base leading-[1.8] pr-0 md:pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LandingFAQ = () => (
  <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
    <motion.h2
      className="text-3xl md:text-[2.5rem] font-bold text-right mb-4 leading-tight"
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      שאלות נפוצות
    </motion.h2>
    <motion.p
      className="text-muted-foreground text-right text-lg mb-12"
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      כל מה שצריך לדעת לפני שמתחילים
    </motion.p>

    {/* No wrapping card — just clean dividers */}
    <div className="divide-y divide-border/50">
      {faqs.map((faq, i) => (
        <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
      ))}
    </div>
  </section>
);

export default LandingFAQ;
