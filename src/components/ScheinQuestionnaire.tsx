import { useMemo } from 'react';
import { scheinQuestions } from '@/data/scheinQuestions';
import OwlMessage from './OwlMessage';
import owlLogo from '@/assets/owl-logo.png';
import type { Answers } from '@/lib/scoring';
import { getScheinEncouragement, getRandomWisdomTip } from '@/lib/owlMessages';

interface ScheinQuestionnaireProps {
  answers: Answers;
  onAnswer: (id: number, score: number) => void;
  onComplete: () => void;
}

const SCALE = [1, 2, 3, 4, 5, 6, 7];

const ScheinQuestionnaire = ({ answers, onAnswer, onComplete }: ScheinQuestionnaireProps) => {
  const totalAnswered = Object.keys(answers).length;
  const allAnswered = totalAnswered >= scheinQuestions.length;
  const progress = (totalAnswered / scheinQuestions.length) * 100;

  const encouragement = getScheinEncouragement(totalAnswered, scheinQuestions.length);
  const wisdomTip = useMemo(() => getRandomWisdomTip(), [totalAnswered > 0]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm">
            🧭 חלק ב׳
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">עוגנים תעסוקתיים של שיין</h2>
          <p className="text-muted-foreground">דרגו כל אמירה מ-1 (לא מסכים כלל) עד 7 (מסכים לחלוטין)</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAnswered} / {scheinQuestions.length} שאלות</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Owl encouragement */}
        {encouragement && <OwlMessage message={encouragement} variant="encouragement" />}

        {/* Questions */}
        <div className="space-y-4">
          {scheinQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-2xl p-5 shadow-md border border-border slide-up" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
              <p className="text-question font-medium text-foreground mb-4">
                {q.id}. {q.text}
              </p>
              <div className="flex gap-2 justify-center items-center flex-wrap" dir="ltr">
                <span className="text-xs text-muted-foreground/60 w-20 text-right hidden sm:inline">לא מסכים כלל</span>
                {SCALE.map(val => (
                  <button
                    key={val}
                    onClick={() => onAnswer(q.id, val)}
                    className={`w-11 h-11 rounded-full font-bold text-lg transition-all duration-200 border-2 ${
                      answers[q.id] === val
                        ? 'bg-primary text-primary-foreground border-primary scale-110'
                        : 'bg-background text-foreground border-border hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    {val}
                  </button>
                ))}
                <span className="text-xs text-muted-foreground/60 w-20 text-left hidden sm:inline">מסכים לחלוטין</span>
              </div>
            </div>
          ))}
        </div>

        {/* Complete */}
        <div className="text-center pt-6">
          <button
            onClick={onComplete}
            disabled={!allAnswered}
            className="px-10 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold font-serif text-xl disabled:opacity-30 hover:opacity-90 transition-all shadow-lg"
          >
            🦉 סיום חלק ב׳ ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheinQuestionnaire;
