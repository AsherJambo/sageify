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
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ חלק ב׳
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">עוגנים תעסוקתיים של שיין</h2>
          <p className="text-muted-foreground text-lg">דרגו כל אמירה מ-1 (לא מסכים כלל) עד 7 (מסכים לחלוטין)</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAnswered} / {scheinQuestions.length} שאלות</span>
          </div>
          <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
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
            <div key={q.id} className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 slide-up" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
              <p className="text-lg font-medium text-foreground mb-4 leading-relaxed">
                {q.id}. {q.text}
              </p>
              <div className="flex gap-2 justify-center items-center flex-wrap" dir="ltr">
                <span className="text-xs text-muted-foreground/60 w-20 text-right hidden sm:inline">לא מסכים כלל</span>
                {SCALE.map(val => (
                  <button
                    key={val}
                    onClick={() => onAnswer(q.id, val)}
                    className={`w-11 h-11 rounded-full font-bold text-lg transition-all duration-300 border-2 ${
                      answers[q.id] === val
                        ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-[var(--shadow-card)]'
                        : 'bg-card text-foreground border-border/60 hover:border-secondary/40 hover:scale-105'
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
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold font-display text-lg tracking-wide disabled:opacity-25 hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)]"
          >
            <img src={owlLogo} alt="" className="w-6 h-6 rounded-full ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110" />
            <span>סיום חלק ב׳</span>
            <span className="text-primary-foreground/60 transition-transform duration-300 group-hover:translate-x-[4px]">✓</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheinQuestionnaire;
