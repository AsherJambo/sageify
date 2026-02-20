import { useState } from 'react';
import { scheinQuestions } from '@/data/scheinQuestions';
import type { Answers } from '@/lib/scoring';

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

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">חלק ב׳: עוגנים תעסוקתיים של שיין</h2>
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

        {/* Questions */}
        <div className="space-y-4">
          {scheinQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-xl p-5 shadow-sm border border-border slide-up" style={{ animationDelay: `${Math.min(idx * 0.03, 0.5)}s` }}>
              <p className="text-question font-medium text-foreground mb-4">
                {q.id}. {q.text}
              </p>
              <div className="flex gap-2 justify-center flex-wrap" dir="ltr">
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
              </div>
            </div>
          ))}
        </div>

        {/* Complete */}
        <div className="text-center pt-6">
          <button
            onClick={onComplete}
            disabled={!allAnswered}
            className="px-10 py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
          >
            סיום חלק ב׳ ✓
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheinQuestionnaire;
