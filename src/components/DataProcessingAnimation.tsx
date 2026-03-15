import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import owlLogo from '@/assets/owl-logo.png';

interface DataProcessingAnimationProps {
  onComplete: () => void;
  duration?: number;
}

const ANALYSIS_STEPS = [
  { label: 'סורק דפוסי ניסיון תעסוקתי...', icon: '🌿', progress: 12 },
  { label: 'מצליב חוזקות עם עוגנים תעסוקתיים...', icon: '🧬', progress: 25 },
  { label: 'ממפה נטיות תעסוקתיות וערכים...', icon: '🗺️', progress: 38 },
  { label: 'מנתח כישורים ומיומנויות ייחודיים...', icon: '⚙️', progress: 50 },
  { label: 'משווה לפרופילים דומים בקהילת סגי...', icon: '👥', progress: 65 },
  { label: 'מתאים הזדמנויות מתוך מאגר הנתונים...', icon: '🔍', progress: 78 },
  { label: 'בונה מפת דרכים מותאמת אישית...', icon: '✨', progress: 90 },
  { label: 'מכין את התובנות המותאמות עבורכם', icon: '🎯', progress: 100 },
];

// Floating data particles
const DataParticle = ({ delay, x }: { delay: number; x: number }) => (
  <motion.div
    className="absolute w-1 h-1 rounded-full bg-secondary/40"
    initial={{ opacity: 0, y: 200, x }}
    animate={{
      opacity: [0, 0.8, 0],
      y: [-20, -200],
      x: [x, x + (Math.random() - 0.5) * 60],
    }}
    transition={{
      duration: 3,
      delay,
      repeat: Infinity,
      ease: 'easeOut',
    }}
  />
);

const DataProcessingAnimation = ({ onComplete, duration = 5500 }: DataProcessingAnimationProps) => {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Data stream particles */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <DataParticle
            key={i}
            delay={i * 0.3}
            x={Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400)}
          />
        ))}
      </div>

      <div className="max-w-md text-center space-y-10 relative z-10">
        {/* Pulsing halo around logo */}
        <div className="relative inline-block">
          {/* Outer halo */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--secondary) / 0.15) 0%, transparent 70%)',
              width: '200px',
              height: '200px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* Middle halo */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, hsl(var(--secondary) / 0.2) 0%, transparent 60%)',
              width: '160px',
              height: '160px',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.6, 0.3, 0.6],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
          <motion.img
            src={owlLogo}
            alt="Processing"
            className="w-32 h-32 mx-auto rounded-full shadow-[var(--shadow-elevated)] relative z-10"
            animate={{ scale: [1, 1.04, 1] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            סגי מעבד את הנתונים שלכם...
          </h2>
          <p className="text-muted-foreground text-base">
            מצליב את הפרופיל הפסיכומטרי שלכם עם מאגר הנתונים של קהילת הפורשים
          </p>
        </div>

        {/* Current step indicator with glassmorphism */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 16, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center justify-center gap-3 bg-card/80 backdrop-blur-xl rounded-2xl border border-secondary/20 px-7 py-5 shadow-[var(--shadow-card)]"
          >
            <span className="text-2xl">{step?.icon}</span>
            <span className="text-base font-medium text-foreground">{step?.label}</span>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="w-full h-3 bg-muted/40 rounded-full overflow-hidden backdrop-blur-sm">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--secondary)), hsl(var(--secondary) / 0.7), hsl(var(--secondary)))',
                backgroundSize: '200% 100%',
              }}
              animate={{
                width: `${progress}%`,
                backgroundPosition: ['0% 0%', '100% 0%', '0% 0%'],
              }}
              transition={{
                width: { duration: 0.5, ease: 'easeOut' },
                backgroundPosition: { duration: 2, repeat: Infinity, ease: 'linear' },
              }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{progress}%</span>
            <span>ניתוח פסיכומטרי מתקדם</span>
          </div>
        </div>

        {/* Completed steps */}
        <div className="space-y-2">
          {ANALYSIS_STEPS.slice(0, currentStep).map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 0.5, x: 0 }}
              className="flex items-center gap-2 text-sm text-muted-foreground justify-center"
            >
              <span className="text-secondary">✓</span>
              <span>{s.label}</span>
            </motion.div>
          ))}
        </div>

        {/* Data points counter */}
        <motion.p
          className="text-sm text-muted-foreground/60"
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
