import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { scheinQuestions } from '@/data/scheinQuestions';
import OwlMessage from './OwlMessage';
import QuestProgressBadge from './QuestProgressBadge';
import type { Answers } from '@/lib/scoring';
import { getScheinEncouragement } from '@/lib/owlMessages';
import { burstConfetti } from '@/lib/confetti';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  answers: Answers;
  onAnswer: (id: number, score: number) => void;
  onComplete: () => void;
  onBackToHub?: () => void;
}

const SCALE = [1, 2, 3, 4, 5, 6, 7];

const SCALE_META: Record<number, { label: string; color: string }> = {
  1: { label: 'לא חשוב לי', color: 'hsl(var(--coral))' },
  2: { label: 'מעט חשוב', color: 'hsl(var(--coral))' },
  3: { label: 'חשוב במידה מועטה', color: 'hsl(var(--sunny))' },
  4: { label: 'חשוב במידה בינונית', color: 'hsl(var(--sunny))' },
  5: { label: 'חשוב', color: 'hsl(var(--sky))' },
  6: { label: 'חשוב מאוד', color: 'hsl(var(--success))' },
  7: { label: 'חשוב לי במיוחד', color: 'hsl(var(--success))' },
};

const CATEGORY_ICON: Record<string, string> = {
  'מומחיות': '🎓',
  'ניהול': '🧭',
  'אוטונומיה': '🪁',
  'בטחון ויציבות': '🏛️',
  'יצירתיות יזמית': '💡',
  'שליחות': '🌍',
  'אתגר': '⛰️',
  'סגנון חיים': '🌿',
};

const ScheinJourney = ({ answers, onAnswer, onComplete, onBackToHub }: Props) => {
  const total = scheinQuestions.length;
  const totalAnswered = Object.keys(answers).length;

  // Start at first unanswered, or first
  const firstUnanswered = scheinQuestions.findIndex(q => answers[q.id] === undefined);
  const [idx, setIdx] = useState(firstUnanswered === -1 ? 0 : firstUnanswered);
  const [direction, setDirection] = useState(1);

  const q = scheinQuestions[idx];
  const selected = answers[q.id];
  const allAnswered = totalAnswered >= total;
  const progress = ((idx + (selected ? 1 : 0)) / total) * 100;
  const encouragement = useMemo(
    () => getScheinEncouragement(totalAnswered, total),
    [totalAnswered, total]
  );

  const goNext = () => {
    if (idx < total - 1) {
      setDirection(1);
      setIdx(idx + 1);
    }
  };
  const goPrev = () => {
    if (idx > 0) {
      setDirection(-1);
      setIdx(idx - 1);
    }
  };

  // Auto-advance after answering (subtle delight)
  const handleSelect = (val: number) => {
    onAnswer(q.id, val);
    if (idx < total - 1) {
      setTimeout(() => {
        setDirection(1);
        setIdx(i => Math.min(i + 1, total - 1));
      }, 380);
    }
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [idx]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 fade-in">
      <QuestProgressBadge current={totalAnswered} total={total} label="עוגנים" icon="⚓" />

      <div className="w-full max-w-3xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ⚓ מסע העוגנים
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            עוגנים תעסוקתיים של שיין
          </h2>
          <p className="text-muted-foreground text-base">שאלה אחת בכל פעם — קצב נינוח, מסע ברור</p>
        </div>

        {/* Linear Journey path */}
        <div className="relative pt-6 pb-2" dir="ltr">
          {/* Track */}
          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-coral via-sunny to-success rounded-full"
              initial={false}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: 'easeInOut' }}
            />
          </div>
          {/* Stations - show milestones every ~5 questions */}
          <div className="relative flex justify-between items-center">
            {scheinQuestions.map((sq, i) => {
              const isMilestone = i === 0 || i === total - 1 || (i + 1) % 5 === 0;
              const isPast = i < idx;
              const isCurrent = i === idx;
              if (!isMilestone && !isCurrent) {
                return (
                  <div key={sq.id} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 z-10" />
                );
              }
              return (
                <motion.div
                  key={sq.id}
                  initial={false}
                  animate={{ scale: isCurrent ? 1.15 : 1 }}
                  className={`z-10 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    isCurrent
                      ? 'w-9 h-9 bg-card border-secondary text-secondary shadow-[0_0_18px_hsl(var(--secondary)/0.35)]'
                      : isPast
                      ? 'w-6 h-6 bg-success border-success text-success-foreground'
                      : 'w-6 h-6 bg-card border-border text-muted-foreground'
                  }`}
                >
                  {isCurrent ? '⚓' : isPast ? '✓' : i + 1}
                </motion.div>
              );
            })}
          </div>
          <div className="text-center text-xs text-muted-foreground mt-3" dir="rtl">
            תחנה {idx + 1} מתוך {total} · {totalAnswered} נענו
          </div>
        </div>

        {encouragement && <OwlMessage message={encouragement} variant="encouragement" />}

        {/* Question card with slide animation */}
        <div className="relative min-h-[360px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={q.id}
              custom={direction}
              initial={{ opacity: 0, x: direction * 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -direction * 40 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="bg-card rounded-3xl p-7 md:p-10 shadow-[var(--shadow-elegant)] border border-border/60"
            >
              <div className="flex items-center gap-2 mb-5 text-sm">
                <span className="text-2xl">{CATEGORY_ICON[q.category] ?? '⚓'}</span>
                <span className="text-muted-foreground font-medium">{q.category}</span>
              </div>

              <p className="text-xl md:text-2xl font-medium text-foreground leading-relaxed mb-8">
                {q.text}
              </p>

              {/* Scale */}
              <div className="space-y-4">
                <div className="flex gap-2 justify-between items-center" dir="ltr">
                  {SCALE.map(val => {
                    const isSel = selected === val;
                    return (
                      <motion.button
                        key={val}
                        onClick={() => handleSelect(val)}
                        whileTap={{ scale: 0.9 }}
                        whileHover={{ y: -2 }}
                        className={`flex-1 min-w-[44px] h-14 rounded-2xl font-display font-bold text-lg border-2 transition-all duration-300 ${
                          isSel
                            ? 'border-transparent text-white shadow-[0_8px_24px_-8px_rgba(0,0,0,0.3)] scale-105'
                            : 'bg-card text-foreground border-border/60 hover:border-secondary/50'
                        }`}
                        style={isSel ? { background: SCALE_META[val].color } : undefined}
                      >
                        {val}
                      </motion.button>
                    );
                  })}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground px-1" dir="rtl">
                  <span>לא חשוב כלל</span>
                  <span>חשוב לי מאוד</span>
                </div>
                {selected !== undefined && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center text-sm text-secondary font-medium pt-1"
                  >
                    בחרת: {SCALE_META[selected].label}
                  </motion.div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between gap-3">
          <button
            onClick={goPrev}
            disabled={idx === 0}
            className="flex items-center gap-2 px-5 py-3 rounded-full text-foreground border border-border/60 bg-card disabled:opacity-40 disabled:cursor-not-allowed hover:bg-muted transition"
          >
            <ChevronRight className="w-4 h-4" />
            הקודמת
          </button>

          {idx < total - 1 ? (
            <button
              onClick={goNext}
              disabled={selected === undefined}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition shadow-md"
            >
              הבאה
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => {
                if (allAnswered) {
                  burstConfetti();
                  onComplete();
                }
              }}
              disabled={!allAnswered}
              className="px-7 py-3 rounded-full bg-success text-success-foreground font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition shadow-md"
            >
              סיום מסע העוגנים ⚓
            </button>
          )}
        </div>

        {onBackToHub && (
          <div className="text-center">
            <button
              onClick={onBackToHub}
              className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline"
            >
              חזרה למרכז השאלונים
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheinJourney;
