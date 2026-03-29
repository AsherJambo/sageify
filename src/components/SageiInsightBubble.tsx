import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import owlLogo from '@/assets/owl-logo.png';

interface SageiInsightBubbleProps {
  progress: number;
  username?: string;
}

const INSIGHTS = [
  { threshold: 5, text: 'יוצאים לדרך! בואו נגלה מה מניע אתכם 🌿' },
  { threshold: 15, text: 'יפה מאוד, הפרופיל שלכם מתחיל להתגבש!' },
  { threshold: 30, text: 'אני מזהה דפוסים מעניינים... ✦' },
  { threshold: 45, text: 'כל שאלון שמסיימים מחדד את התמונה 🔍' },
  { threshold: 60, text: 'נהדר! יש לי כבר כיוונים מעניינים בשבילכם ◆' },
  { threshold: 75, text: 'כמעט שם! החוזקות שלכם מספרות סיפור מרתק' },
  { threshold: 85, text: 'עוד קצת ונגיע לתובנות המותאמות אישית שלכם ✨' },
];

const SageiInsightBubble = ({ progress, username }: SageiInsightBubbleProps) => {
  const [currentInsight, setCurrentInsight] = useState('');
  const [visible, setVisible] = useState(false);
  const [lastShown, setLastShown] = useState(0);
  const [scrolledAway, setScrolledAway] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout>>();

  // Show insight on progress change
  useEffect(() => {
    const insight = [...INSIGHTS].reverse().find(i => progress >= i.threshold);
    if (insight && insight.threshold !== lastShown) {
      const text = username
        ? insight.text.replace('!', `, ${username}!`)
        : insight.text;
      setCurrentInsight(text);
      setLastShown(insight.threshold);
      setVisible(true);
      setScrolledAway(false);
      clearTimeout(hideTimer.current);
      hideTimer.current = setTimeout(() => setVisible(false), 5000);
      return () => clearTimeout(hideTimer.current);
    }
  }, [progress, username, lastShown]);

  // Hide on scroll, restore when scroll stops
  useEffect(() => {
    if (!visible) return;
    let scrollTimeout: ReturnType<typeof setTimeout>;
    const onScroll = () => {
      setScrolledAway(true);
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => setScrolledAway(false), 800);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      clearTimeout(scrollTimeout);
    };
  }, [visible]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: scrolledAway ? 0 : 1, y: scrolledAway ? -10 : 0, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed bottom-20 left-4 z-50 max-w-[220px] sm:max-w-xs pointer-events-none sm:bottom-auto sm:top-6"
        >
          <div className="flex items-center gap-2.5 bg-card/80 backdrop-blur-xl border border-secondary/25 rounded-2xl px-4 py-3 shadow-[var(--shadow-elevated)]">
            <img
              src={owlLogo}
              alt=""
              className="w-8 h-8 rounded-full ring-2 ring-secondary/20 flex-shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-display font-bold text-secondary tracking-wide mb-0.5">סגי אומר:</p>
              <p className="text-xs text-foreground leading-snug">{currentInsight}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SageiInsightBubble;
