import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { thinkingQuestions, TIME_LIMIT_SECONDS, calculateThinkingResult, type ThinkingResult } from '@/data/thinkingQuestions';

interface Props {
  onComplete?: (r: ThinkingResult) => void;
  onBackToHub?: () => void;
}

const ThinkingCrackingCards = ({ onComplete, onBackToHub }: Props) => {
  const [index, setIndex] = useState(0);
  const [opened, setOpened] = useState(false);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [startTime] = useState(Date.now());
  const [phase, setPhase] = useState<'test' | 'done'>('test');

  const q = thinkingQuestions[index];
  const total = thinkingQuestions.length;
  const progress = useMemo(() => (index / total) * 100, [index, total]);

  const selectAnswer = (n: number) => {
    const next = { ...answers, [q.id]: n };
    setAnswers(next);
    setTimeout(() => {
      if (index + 1 >= total) {
        const used = Math.min(TIME_LIMIT_SECONDS, Math.floor((Date.now() - startTime) / 1000));
        const result = calculateThinkingResult(next, used);
        setPhase('done');
        onComplete?.(result);
      } else {
        setOpened(false);
        setTimeout(() => setIndex((i) => i + 1), 350);
      }
    }, 500);
  };

  if (phase === 'done') {
    const correct = thinkingQuestions.filter((tq) => answers[tq.id] === tq.correctAnswer).length;
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-xl w-full text-center bg-card rounded-2xl shadow-lg p-10 border">
          <div className="text-6xl mb-4">🔓</div>
          <h1 className="font-serif text-3xl mb-3 text-foreground">כל הכרטיסים נפתחו</h1>
          <p className="text-lg text-muted-foreground">פתרת נכון {correct} מתוך {total}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 px-4 py-8" dir="rtl">
      {/* Progress */}
      <div className="max-w-3xl mx-auto mb-6">
        <div className="flex justify-between items-center text-sm text-muted-foreground mb-2 font-medium">
          <span>כרטיס {index + 1} מתוך {total}</span>
          <span>{q.difficulty === 'easy' ? 'קל' : q.difficulty === 'medium' ? 'בינוני' : 'מאתגר'}</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6 }}
          />
        </div>
        {onBackToHub && (
          <button
            onClick={onBackToHub}
            className="mt-3 text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
          >
            ← חזרה למרכז התצוגה
          </button>
        )}
      </div>

      <div className="max-w-3xl mx-auto">
        <AnimatePresence mode="wait">
          {!opened ? (
            <motion.button
              key={`sealed-${q.id}`}
              type="button"
              onClick={() => setOpened(true)}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border-2 border-primary/30 shadow-2xl group focus:outline-none focus:ring-4 focus:ring-primary/40"
              style={{
                background:
                  'radial-gradient(circle at 30% 20%, hsl(var(--primary) / 0.15), transparent 50%), radial-gradient(circle at 70% 80%, hsl(var(--accent) / 0.2), transparent 55%), linear-gradient(135deg, hsl(var(--card)) 0%, hsl(var(--muted)) 100%)',
              }}
            >
              {/* Crackle texture */}
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage:
                  'repeating-linear-gradient(45deg, hsl(var(--foreground)) 0 1px, transparent 1px 22px), repeating-linear-gradient(-45deg, hsl(var(--foreground)) 0 1px, transparent 1px 28px)',
              }} />

              {/* Wax seal */}
              <motion.div
                whileHover={{ scale: 1.08, rotate: -4 }}
                className="absolute inset-0 flex flex-col items-center justify-center gap-5"
              >
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-primary to-primary/70 shadow-xl flex items-center justify-center border-4 border-background/60">
                  <span className="text-5xl">🧩</span>
                </div>
                <p className="font-serif text-2xl text-foreground">לחץ לפיצוח הכרטיס</p>
                <p className="text-base text-muted-foreground">השלם את התבנית</p>
              </motion.div>
            </motion.button>
          ) : (
            <motion.div
              key={`open-${q.id}`}
              initial={{ opacity: 0, rotateY: -90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              exit={{ opacity: 0, rotateY: 90 }}
              transition={{ duration: 0.5 }}
              className="bg-card rounded-3xl border-2 border-primary/20 shadow-2xl overflow-hidden"
            >
              {/* Crack lines reveal */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.4 }}
                className="h-1 bg-gradient-to-l from-transparent via-primary to-transparent origin-center"
              />

              <div className="p-6 md:p-8">
                <div className="relative bg-muted/30 rounded-2xl overflow-hidden mb-6">
                  <img src={q.image} alt={`שאלה ${index + 1}`} className="w-full h-auto" />
                </div>

                <p className="text-center font-serif text-xl text-foreground mb-5">
                  איזו תשובה משלימה את התבנית?
                </p>

                <div className="grid grid-cols-4 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => {
                    const selected = answers[q.id] === n;
                    return (
                      <motion.button
                        key={n}
                        type="button"
                        whileHover={{ scale: 1.06, y: -2 }}
                        whileTap={{ scale: 0.94 }}
                        onClick={() => selectAnswer(n)}
                        className={`min-h-[64px] rounded-xl border-2 font-serif text-2xl font-bold transition-colors ${
                          selected
                            ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                            : 'bg-background text-foreground border-border hover:border-primary/60 hover:bg-primary/5'
                        }`}
                      >
                        {n}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ThinkingCrackingCards;
