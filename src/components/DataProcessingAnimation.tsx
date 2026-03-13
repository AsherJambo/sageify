import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import owlLogo from '@/assets/owl-logo.png';

interface DataProcessingAnimationProps {
  onComplete: () => void;
  duration?: number;
}

const ANALYSIS_STEPS = [
  { label: 'מנתח חוזקות אישיות...', icon: '🧬', progress: 15 },
  { label: 'מצליב עוגני קריירה...', icon: '⚓', progress: 30 },
  { label: 'ממפה נטיות תעסוקתיות...', icon: '🗺️', progress: 45 },
  { label: 'מעבד כישורים ומיומנויות...', icon: '⚙️', progress: 60 },
  { label: 'מחפש ארכיטיפ תואם...', icon: '🔍', progress: 75 },
  { label: 'בונה פרופיל אישי מותאם...', icon: '✨', progress: 90 },
  { label: 'מכין תובנות מותאמות אישית', icon: '🎯', progress: 100 },
];

const DataProcessingAnimation = ({ onComplete, duration = 4500 }: DataProcessingAnimationProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const stepDuration = duration / ANALYSIS_STEPS.length;
    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = prev + 1;
        if (next >= ANALYSIS_STEPS.length) {
          clearInterval(interval);
          setTimeout(onComplete, 600);
          return prev;
        }
        return next;
      });
    }, stepDuration);

    return () => clearInterval(interval);
  }, [duration, onComplete]);

  useEffect(() => {
    setProgress(ANALYSIS_STEPS[currentStep]?.progress || 0);
  }, [currentStep]);

  const step = ANALYSIS_STEPS[currentStep];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="max-w-md text-center space-y-8">
        {/* Animated logo */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], rotate: [0, 2, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <img
            src={owlLogo}
            alt="Processing"
            className="w-28 h-28 mx-auto rounded-full shadow-[var(--shadow-elevated)]"
          />
        </motion.div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold font-display text-foreground tracking-wide">
            מעבד את הנתונים שלך...
          </h2>
          <p className="text-muted-foreground text-sm">
            מנוע ה-AI שלנו מנתח את הפרופיל הפסיכומטרי שלך
          </p>
        </div>

        {/* Current step indicator */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center gap-3 bg-card rounded-2xl border border-border/60 px-6 py-4 shadow-[var(--shadow-card)]"
          >
            <span className="text-2xl">{step?.icon}</span>
            <span className="text-sm font-medium text-foreground">{step?.label}</span>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-2.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progress}%</span>
            <span>ניתוח פסיכומטרי מתקדם</span>
          </div>
        </div>

        {/* Completed steps */}
        <div className="space-y-1.5">
          {ANALYSIS_STEPS.slice(0, currentStep).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.6, x: 0 }}
              className="flex items-center gap-2 text-xs text-muted-foreground justify-center"
            >
              <span className="text-secondary">✓</span>
              <span>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Data points counter */}
        <motion.p
          className="text-xs text-muted-foreground/60"
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          מעבד {Math.round(progress * 12)} נקודות נתונים...
        </motion.p>
      </div>
    </div>
  );
};

export default DataProcessingAnimation;
