import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'כמה זמן לוקח למלא את כל השאלונים?',
    a: 'בממוצע כ-45 דקות. אפשר לעצור ולחזור בכל שלב – המערכת שומרת את ההתקדמות שלכם אוטומטית.',
  },
  {
    q: 'האם צריך ידע טכנולוגי כדי להשתמש במערכת?',
    a: 'לא. המערכת מעוצבת במיוחד עבור קהל מבוגר, עם כפתורים גדולים, טקסט ברור והנחיות מפורטות בכל שלב.',
  },
  {
    q: 'מה קורה עם הנתונים שלי?',
    a: 'הנתונים שלכם מאובטחים ומוצפנים. הם משמשים אך ורק לצורך הפקת הדוח האישי שלכם ולא מועברים לגורמים חיצוניים.',
  },
  {
    q: 'האם אפשר להשתמש ב-Sageify באופן עצמאי?',
    a: 'כרגע הגישה למערכת מתבצעת דרך ארגונים או יועצי קריירה. צרו קשר ונשמח לחבר אתכם לגורם המתאים.',
  },
  {
    q: 'מה כולל הדוח שמתקבל בסוף התהליך?',
    a: 'דוח מפורט הכולל ניתוח חוזקות, עוגנים תעסוקתיים, נטיות מקצועיות, מפת דרכים אישית והמלצות להזדמנויות רלוונטיות בשוק.',
  },
  {
    q: 'האם הכלי מתאים גם למי שלא פרש עדיין?',
    a: 'בהחלט. Sageify מתאים גם למתכננים פרישה, אנשים בתהליכי מעבר קריירה, ולכל מי שרוצה להכיר את החוזקות שלו טוב יותר.',
  },
];

const FAQItem = ({ q, a, index }: { q: string; a: string; index: number }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      className="border-b border-border/40 last:border-b-0"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 md:py-6 text-right hover:text-accent transition-colors duration-400"
      >
        <span className="text-base md:text-[17px] font-medium leading-relaxed">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
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
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-muted-foreground text-[15px] leading-relaxed pr-0 md:pr-8">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const LandingFAQ = () => {
  return (
    <section className="max-w-2xl mx-auto px-6 py-20 md:py-28">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        שאלות נפוצות
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center text-base mb-12 max-w-md mx-auto"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        כל מה שצריך לדעת לפני שמתחילים
      </motion.p>

      <div className="border border-border/50 rounded-lg bg-card px-6 md:px-8">
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </div>
    </section>
  );
};

export default LandingFAQ;
