import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { thinkingQuestions, exampleImage, TIME_LIMIT_SECONDS, calculateThinkingResult, type ThinkingResult } from '@/data/thinkingQuestions';
import QuestionnaireNav from '@/components/QuestionnaireNav';
import sageifyLogo from '@/assets/owl-logo.png';

interface ThinkingSkillsQuestionnaireProps {
  onComplete: (result: ThinkingResult) => void;
  onBackToHub?: () => void;
}

const ANSWER_OPTION_OVERLAYS = [
  { left: 60, top: 3.1 },
  { left: 77.1, top: 3.1 },
  { left: 60, top: 26.7 },
  { left: 77.1, top: 26.7 },
  { left: 60, top: 50.2 },
  { left: 77.1, top: 50.2 },
  { left: 60, top: 73.9 },
  { left: 77.1, top: 73.9 },
] as const;

const ANSWER_OVERLAY_WIDTH = 11.9;
const ANSWER_OVERLAY_HEIGHT = 21.2;

const ThinkingSkillsQuestionnaire = ({ onComplete, onBackToHub }: ThinkingSkillsQuestionnaireProps) => {
  const [phase, setPhase] = useState<'intro' | 'test' | 'done'>('intro');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (phase !== 'test') return;
    const interval = setInterval(() => {
      const now = Math.floor((Date.now() - startTime) / 1000);
      setElapsed(now);
      if (now >= TIME_LIMIT_SECONDS) {
        clearInterval(interval);
        finishTest();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [phase, startTime]);

  const finishTest = useCallback(() => {
    const timeUsed = Math.floor((Date.now() - startTime) / 1000);
    const result = calculateThinkingResult(answers, timeUsed);
    setPhase('done');
    onComplete(result);
  }, [answers, startTime, onComplete]);

  const startTest = () => {
    setStartTime(Date.now());
    setPhase('test');
  };

  const question = thinkingQuestions[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const remainingMinutes = Math.max(0, Math.floor((TIME_LIMIT_SECONDS - elapsed) / 60));
  const remainingSeconds = Math.max(0, (TIME_LIMIT_SECONDS - elapsed) % 60);
  const isTimeLow = elapsed > TIME_LIMIT_SECONDS - 120;

  const handleAnswer = (optionNum: number) => {
    setAnswers(prev => ({ ...prev, [question.id]: optionNum }));
  };

  const goNext = () => {
    if (currentIndex < thinkingQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const canFinish = answeredCount === thinkingQuestions.length;

  // -- Intro Phase --
  if (phase === 'intro') {
    return (
      <div className="min-h-screen flex flex-col items-center px-4 py-10 md:py-16" dir="rtl">
        <div className="max-w-2xl w-full space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center space-y-4"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-secondary/10 flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
            <h1 className="text-3xl font-bold font-display text-foreground tracking-wide">
              הערכת חשיבה וגמישות קוגניטיבית
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              בפניכם מבחן יכולת חשיבה מסוג זיהוי צורה חסרה
            </p>
          </motion.div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-card border border-border/60 rounded-2xl p-6 shadow-[var(--shadow-card)] space-y-5"
          >
            <h2 className="font-bold font-display text-foreground text-lg">איך זה עובד?</h2>
            <div className="space-y-3 text-muted-foreground leading-relaxed">
              <p>בכל שאלה תראו טבלה (3×3) המכילה צורות שמשתנות לפי חוקיות מסוימת. הצורה בפינה הימנית התחתונה חסרה.</p>
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <span className="text-secondary font-bold mt-0.5">1.</span>
                  <span><strong>זהו את החוקיות</strong> – הסתכלו על הצורות בשורות ובטורים</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-secondary font-bold mt-0.5">2.</span>
                  <span><strong>מצאו את הקשר</strong> – הצורות משתנות לפי סדר מסוים</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-secondary font-bold mt-0.5">3.</span>
                  <span><strong>בחרו את התשובה</strong> – מתוך 8 אפשרויות, בחרו את הצורה שמשלימה את התמונה</span>
                </div>
              </div>
            </div>

            {/* Example */}
            <div className="border-t border-border/40 pt-5">
              <img
                src={exampleImage}
                alt="דוגמה – ריבוע לבן עם מעטפת ירוקה"
                className="w-full rounded-lg border border-border/30 shadow-sm object-contain"
              />
            </div>

            <div className="bg-secondary/[0.04] border border-secondary/15 rounded-xl p-4 flex items-center gap-3">
              <span className="text-xl">⏱</span>
              <div>
                <p className="font-display font-semibold text-foreground text-sm">15 שאלות · עד 15 דקות</p>
                <p className="text-muted-foreground text-sm">קחו את הזמן, אבל לא יותר מדי 😊</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center space-y-3"
          >
            <button
              onClick={startTest}
              className="px-12 py-5 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold font-display tracking-wide hover:bg-primary/85 transition-all duration-300 hover:scale-[1.02] shadow-[var(--shadow-elevated)]"
            >
              בואו נתחיל! 🧠
            </button>
            {onBackToHub && (
              <div>
                <button onClick={onBackToHub} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  ← חזרה למרכז השאלונים
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // -- Test Phase --
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 md:py-10" dir="rtl">
      <div className="max-w-4xl w-full space-y-5">
        {/* Top bar: timer + progress */}
        <div className="flex items-center justify-between bg-card border border-border/60 rounded-2xl px-5 py-3 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-3">
            <span className="text-sm font-display font-semibold text-foreground">
              שאלה {currentIndex + 1} מתוך {thinkingQuestions.length}
            </span>
            <div className="h-1.5 w-32 bg-muted/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-secondary rounded-full transition-all duration-500"
                style={{ width: `${((currentIndex + 1) / thinkingQuestions.length) * 100}%` }}
              />
            </div>
          </div>
          <div className={`flex items-center gap-2 text-sm font-display font-semibold ${isTimeLow ? 'text-destructive animate-pulse' : 'text-muted-foreground'}`}>
            <span>⏱</span>
            <span>{String(remainingMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}</span>
          </div>
        </div>

        {/* Question image with clickable answer overlays */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] relative"
          >
            <img
              src={question.image}
              alt={`שאלה ${currentIndex + 1}`}
              className="w-full"
            />
            {/* Clickable overlays on the 8 answer options (right side of image, 2 cols × 4 rows) */}
            {ANSWER_OPTION_OVERLAYS.map((overlay, index) => {
              const num = index + 1;
              const isSelected = answers[question.id] === num;

              return (
                <button
                  key={num}
                  onClick={() => handleAnswer(num)}
                  className={`absolute rounded-lg transition-all duration-200 ${
                    isSelected
                      ? 'ring-3 ring-secondary bg-secondary/20 shadow-lg'
                      : 'hover:bg-secondary/10 hover:ring-2 hover:ring-secondary/40'
                  }`}
                  style={{
                    left: `${overlay.left}%`,
                    top: `${overlay.top}%`,
                    width: `${ANSWER_OVERLAY_WIDTH}%`,
                    height: `${ANSWER_OVERLAY_HEIGHT}%`,
                  }}
                  title={`תשובה ${num}`}
                />
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={goPrev}
            disabled={currentIndex === 0}
            className="px-6 py-3 rounded-xl border border-border/60 text-sm font-display font-semibold text-foreground hover:bg-muted/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            → הקודמת
          </button>

          <div className="flex gap-1.5 flex-wrap justify-center">
            {thinkingQuestions.map((q, i) => (
              <button
                key={q.id}
                onClick={() => setCurrentIndex(i)}
                className={`w-7 h-7 rounded-full text-xs font-bold transition-all duration-200 ${
                  i === currentIndex
                    ? 'bg-secondary text-white scale-110'
                    : answers[q.id]
                      ? 'bg-secondary/20 text-secondary'
                      : 'bg-muted/40 text-muted-foreground hover:bg-muted/60'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {currentIndex < thinkingQuestions.length - 1 ? (
            <button
              onClick={goNext}
              className="px-6 py-3 rounded-xl bg-secondary/10 text-secondary text-sm font-display font-semibold hover:bg-secondary/20 transition-colors"
            >
              הבאה ←
            </button>
          ) : (
            <button
              onClick={finishTest}
              disabled={!canFinish}
              className={`px-6 py-3 rounded-xl text-sm font-display font-semibold transition-all ${
                canFinish
                  ? 'bg-primary text-primary-foreground hover:bg-primary/85'
                  : 'bg-muted text-muted-foreground cursor-not-allowed opacity-60'
              }`}
            >
              סיום ✦
            </button>
          )}
        </div>

        {/* Unanswered hint */}
        {currentIndex === thinkingQuestions.length - 1 && !canFinish && (
          <p className="text-center text-sm text-muted-foreground">
            📋 נשארו {thinkingQuestions.length - answeredCount} שאלות ללא מענה – לחצו על המספרים למעלה כדי לחזור אליהן
          </p>
        )}

        {onBackToHub && (
          <div className="text-center pt-2">
            <button onClick={onBackToHub} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← חזרה למרכז השאלונים
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ThinkingSkillsQuestionnaire;
