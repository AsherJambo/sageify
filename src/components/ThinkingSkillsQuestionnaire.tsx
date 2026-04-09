import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { thinkingQuestions, exampleImage, TIME_LIMIT_SECONDS, calculateThinkingResult, type ThinkingResult } from '@/data/thinkingQuestions';
import QuestionnaireNav from '@/components/QuestionnaireNav';
import OwlMessage from '@/components/OwlMessage';
import { getRandomWisdomTip } from '@/lib/owlMessages';
import sageifyLogo from '@/assets/owl-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';

interface ThinkingSkillsQuestionnaireProps {
  onComplete: (result: ThinkingResult) => void;
  onBackToHub?: () => void;
}

const ANSWER_OPTION_OVERLAYS = [
  { left: 60, top: 2, height: 24.8 },
  { left: 77.1, top: 2, height: 24.8 },
  { left: 60, top: 26.8, height: 23.6 },
  { left: 77.1, top: 26.8, height: 23.6 },
  { left: 60, top: 50.4, height: 23.6 },
  { left: 77.1, top: 50.4, height: 23.6 },
  { left: 60, top: 74, height: 24.7 },
  { left: 77.1, top: 74, height: 24.7 },
] as const;

const ANSWER_OVERLAY_WIDTH = 11.8;

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

  const encouragement = useMemo(() => {
    if (answeredCount === 0) return 'קחו נשימה עמוקה ובואו נתחיל 🧠';
    if (answeredCount <= 3) return 'התחלה מצוינת! המשיכו כך 💪';
    if (answeredCount <= 7) return 'אתם בכיוון הנכון! 🌟';
    if (answeredCount <= 11) return 'עוד קצת ומסיימים! כל הכבוד 🎯';
    if (answeredCount < thinkingQuestions.length) return 'כמעט שם! סיום מרשים 🏆';
    return 'ענית על הכל! אפשר לסיים ✨';
  }, [answeredCount]);

  const wisdomTip = useMemo(() => getRandomWisdomTip(), [currentIndex]);

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
  const progress = ((answeredCount) / thinkingQuestions.length) * 100;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-6 md:py-10" dir="rtl">
      <div className="max-w-3xl w-full space-y-5">
        {/* Header with timer */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-2"
        >
          <div className="flex items-center justify-center gap-3">
            <img src={sageifyLogo} alt="Sageify" className="w-10 h-10 rounded-full ring-2 ring-secondary/20" />
            <h2 className="text-xl font-bold font-display text-foreground">הערכת חשיבה</h2>
          </div>
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-display font-semibold ${
            isTimeLow 
              ? 'bg-destructive/10 text-destructive animate-pulse' 
              : 'bg-secondary/10 text-secondary'
          }`}>
            <span>⏱</span>
            <span>{String(remainingMinutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}</span>
          </div>
        </motion.div>

        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-display text-muted-foreground px-1">
            <span>{answeredCount} מתוך {thinkingQuestions.length} שאלות</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-secondary rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Owl encouragement */}
        <OwlMessage message={encouragement} variant={answeredCount >= thinkingQuestions.length ? 'celebration' : 'encouragement'} />

        {/* Question card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
          >
            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-sm font-display font-semibold">
                שאלה {currentIndex + 1} מתוך {thinkingQuestions.length}
              </span>
            </div>

            <div className="bg-card border-2 border-secondary/20 rounded-2xl overflow-hidden shadow-[var(--shadow-card)] relative">
              {/* Branded tint overlay on the whole image */}
              <div className="relative">
                <img
                  src={question.image}
                  alt={`שאלה ${currentIndex + 1}`}
                  className="w-full mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/[0.03] to-primary/[0.05] pointer-events-none" />
              </div>
              {/* Clickable overlays on the 8 answer options */}
              {ANSWER_OPTION_OVERLAYS.map((overlay, index) => {
                const num = index + 1;
                const isSelected = answers[question.id] === num;

                return (
                  <button
                    key={num}
                    onClick={() => handleAnswer(num)}
                    className={`absolute rounded-xl border-2 transition-all duration-300 ${
                      isSelected
                        ? 'border-secondary bg-secondary/25 shadow-[0_0_16px_hsl(var(--secondary)/0.3)] scale-[1.03]'
                        : 'border-transparent hover:border-secondary/50 hover:bg-secondary/10 hover:scale-[1.02]'
                    }`}
                    style={{
                      left: `${overlay.left}%`,
                      top: `${overlay.top}%`,
                      width: `${ANSWER_OVERLAY_WIDTH}%`,
                      height: `${overlay.height}%`,
                    }}
                    title={`תשובה ${num}`}
                  >
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-secondary text-white flex items-center justify-center text-xs font-bold shadow-md"
                      >
                        ✓
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selection feedback */}
            {answers[question.id] && (
              <motion.p
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center text-sm font-display text-secondary"
              >
                ✓ בחרת תשובה {answers[question.id]}
              </motion.p>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Unanswered hint */}
        {currentIndex === thinkingQuestions.length - 1 && !canFinish && (
          <p className="text-center text-sm text-muted-foreground">
            📋 נשארו {thinkingQuestions.length - answeredCount} שאלות ללא מענה
          </p>
        )}

        {/* Wisdom tip */}
        <p className="text-center text-xs text-muted-foreground/70 italic font-display">
          💡 {wisdomTip}
        </p>

        {/* Navigation using QuestionnaireNav */}
        <QuestionnaireNav
          onPrev={goPrev}
          onNext={goNext}
          onComplete={finishTest}
          showPrev={currentIndex > 0}
          showNext={currentIndex < thinkingQuestions.length - 1}
          showComplete={currentIndex === thinkingQuestions.length - 1}
          completeDisabled={!canFinish}
          completeLabel="סיום שאלון חשיבה"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default ThinkingSkillsQuestionnaire;
