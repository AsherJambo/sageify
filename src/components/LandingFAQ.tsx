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
      className="rounded-2xl border border-border/60 bg-card overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { delay: index * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
        },
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-right hover:bg-muted/30 transition-colors"
      >
        <span className="text-base md:text-lg font-semibold leading-relaxed">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.3 }}
          className="shrink-0 text-muted-foreground"
        >
          <ChevronDown size={22} />
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
            <p className="px-5 md:px-6 pb-5 md:pb-6 text-muted-foreground text-base leading-relaxed">
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
    <section className="max-w-3xl mx-auto px-6 py-16 md:py-24">
      <motion.h2
        className="text-3xl md:text-4xl font-bold text-center mb-4"
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        שאלות נפוצות
      </motion.h2>
      <motion.p
        className="text-muted-foreground text-center text-lg mb-10 max-w-xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        כל מה שצריך לדעת לפני שמתחילים
      </motion.p>

      <div className="flex flex-col gap-3">
        {faqs.map((faq, i) => (
          <FAQItem key={i} q={faq.q} a={faq.a} index={i} />
        ))}
      </div>
    </section>
  );
};

export default LandingFAQ;
