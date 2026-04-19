import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { scheinQuestions } from '@/data/scheinQuestions';
import OwlMessage from './OwlMessage';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';
import type { Answers } from '@/lib/scoring';
import { getScheinEncouragement, getRandomWisdomTip } from '@/lib/owlMessages';

const scheinAnswerKey = [
  { label: '1', desc: 'לא חשוב לי בכלל' },
  { label: '2-3', desc: 'חשוב במידה מועטה' },
  { label: '4', desc: 'חשוב במידה בינונית' },
  { label: '5-6', desc: 'חשוב במידה רבה' },
  { label: '7', desc: 'חשוב לי מאד' },
];

interface ScheinQuestionnaireProps {
  answers: Answers;
  onAnswer: (id: number, score: number) => void;
  onComplete: () => void;
  onBackToHub?: () => void;
}

const SCALE = [1, 2, 3, 4, 5, 6, 7];

// צבע לכל ערך בסולם – מקורל (לא מסכים) דרך צהוב/תכלת לירוק (מסכים מאוד)
const SCALE_COLORS: Record<number, { bg: string; shadow: string }> = {
  1: { bg: 'bg-coral text-coral-foreground border-coral', shadow: 'shadow-[0_0_20px_hsl(var(--coral)/0.4)]' },
  2: { bg: 'bg-coral/80 text-coral-foreground border-coral/80', shadow: 'shadow-[0_0_18px_hsl(var(--coral)/0.3)]' },
  3: { bg: 'bg-sunny text-foreground border-sunny', shadow: 'shadow-[0_0_18px_hsl(var(--sunny)/0.4)]' },
  4: { bg: 'bg-sunny/90 text-foreground border-sunny/90', shadow: 'shadow-[0_0_18px_hsl(var(--sunny)/0.35)]' },
  5: { bg: 'bg-sky text-foreground border-sky', shadow: 'shadow-[0_0_18px_hsl(var(--sky)/0.4)]' },
  6: { bg: 'bg-success/80 text-success-foreground border-success/80', shadow: 'shadow-[0_0_20px_hsl(var(--success)/0.35)]' },
  7: { bg: 'bg-success text-success-foreground border-success', shadow: 'shadow-[0_0_24px_hsl(var(--success)/0.45)]' },
};

const ScheinQuestionnaire = ({ answers, onAnswer, onComplete, onBackToHub }: ScheinQuestionnaireProps) => {
  const totalAnswered = Object.keys(answers).length;
  const allAnswered = totalAnswered >= scheinQuestions.length;
  const progress = (totalAnswered / scheinQuestions.length) * 100;

  const encouragement = getScheinEncouragement(totalAnswered, scheinQuestions.length);
  const wisdomTip = useMemo(() => getRandomWisdomTip(), [totalAnswered > 0]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ⚓ עוגנים
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">עוגנים תעסוקתיים של שיין</h2>
          <p className="text-muted-foreground text-lg">דרגו כל אמירה מ-1 (לא מסכים כלל) עד 7 (מסכים לחלוטין)</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAnswered} / {scheinQuestions.length} שאלות</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full progress-bar-fill transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnswerKeyReminder items={scheinAnswerKey} />

        {/* Owl encouragement */}
        {encouragement && <OwlMessage message={encouragement} variant="encouragement" />}

        {/* Questions */}
        <div className="space-y-4">
          {scheinQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 slide-up" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
              <p className="text-lg font-medium text-foreground mb-4 leading-relaxed">
                {q.id}. {q.text}
              </p>
              <div className="flex gap-2 justify-center items-center flex-wrap" dir="ltr">
                <span className="text-xs text-muted-foreground/60 w-20 text-right hidden sm:inline">לא מסכים כלל</span>
                {SCALE.map(val => {
                  const colors = SCALE_COLORS[val];
                  const selected = answers[q.id] === val;
                  return (
                    <motion.button
                      key={val}
                      onClick={() => onAnswer(q.id, val)}
                      whileTap={{ scale: 0.88, transition: { type: "spring", stiffness: 400, damping: 15 } }}
                      className={`w-12 h-12 rounded-full font-bold font-display text-lg transition-all duration-300 border-2 ${
                        selected
                          ? `${colors.bg} scale-110 ${colors.shadow}`
                          : 'bg-card text-foreground border-border/60 hover:border-secondary/40 hover:scale-105 hover:shadow-md'
                      }`}
                    >
                      {val}
                    </motion.button>
                  );
                })}
                <span className="text-xs text-muted-foreground/60 w-20 text-left hidden sm:inline">מסכים לחלוטין</span>
              </div>
            </div>
          ))}
        </div>

        <QuestionnaireNav
          showPrev={false}
          showComplete
          onComplete={onComplete}
          completeDisabled={!allAnswered}
          completeLabel="סיום שאלון עוגנים"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default ScheinQuestionnaire;
