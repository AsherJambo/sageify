import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import owlLogo from '@/assets/owl-logo.png';

interface SageiInsightBubbleProps {
  progress: number;
  username?: string;
}

const INSIGHTS = [
  { threshold: 5, text: 'יוצאים לדרך! בואו נגלה מה מניע אתכם 🌿' },
  { threshold: 15, text: 'הכישורים שלכם מתחילים להצטייר... מרשים!' },
  { threshold: 30, text: 'אני מזהה דפוסים מעניינים בעוגנים התעסוקתיים שלכם ✦' },
  { threshold: 45, text: 'עברנו את האמצע! התמונה מתבהרת 🔍' },
  { threshold: 60, text: 'הנטיות התעסוקתיות שלכם חושפות כיוונים מפתיעים ◆' },
  { threshold: 75, text: 'כמעט שם! החוזקות שלכם מספרות סיפור מרתק' },
  { threshold: 85, text: 'עוד קצת ונגיע לתובנות המותאמות אישית שלכם ✨' },
];

const SageiInsightBubble = ({ progress, username }: SageiInsightBubbleProps) => {
  const [currentInsight, setCurrentInsight] = useState('');
  const [visible, setVisible] = useState(false);
  const [lastShown, setLastShown] = useState(0);

  useEffect(() => {
    const insight = [...INSIGHTS].reverse().find(i => progress >= i.threshold);
    if (insight && insight.threshold !== lastShown) {
      const text = username
        ? insight.text.replace('!', `, ${username}!`)
        : insight.text;
      setCurrentInsight(text);
      setLastShown(insight.threshold);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [progress, username, lastShown]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-40 max-w-xs"
        >
          <div className="flex items-start gap-3 bg-card/95 backdrop-blur-xl border border-secondary/25 rounded-2xl px-5 py-4 shadow-[var(--shadow-elevated)]">
            <img
              src={owlLogo}
              alt=""
              className="w-9 h-9 rounded-full ring-2 ring-secondary/20 flex-shrink-0"
            />
            <div>
              <p className="text-xs font-display font-bold text-secondary tracking-wide mb-0.5">סגי אומר:</p>
              <p className="text-sm text-foreground leading-relaxed">{currentInsight}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SageiInsightBubble;
