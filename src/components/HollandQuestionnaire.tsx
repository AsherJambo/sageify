import { useState } from 'react';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import OwlMessage from './OwlMessage';

interface HollandQuestionnaireProps {
  onComplete: (answers: Record<number, boolean>) => void;
}

const QUESTIONS_PER_PAGE = 11;

const HollandQuestionnaire = ({ onComplete }: HollandQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [page, setPage] = useState(0);

  const totalPages = Math.ceil(hollandQuestions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = hollandQuestions.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE);
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / hollandQuestions.length) * 100;
  const allAnswered = totalAnswered >= hollandQuestions.length;

  const pageAllAnswered = pageQuestions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (id: number, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  // Get category label for current page
  const pageCategory = pageQuestions[0]?.category;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-accent/10 text-accent font-semibold text-sm">
            🔍 חלק ד׳
          </div>
          <h2 className="text-2xl font-bold text-foreground">נטיות תעסוקתיות (הולנד)</h2>
          <p className="text-muted-foreground">סמנו "כן" או "לא" עבור כל פעילות</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAnswered} / {hollandQuestions.length} שאלות</span>
            <span>עמוד {page + 1} / {totalPages}</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Category header */}
        <div className="text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm">
            {pageCategory}
          </span>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {pageQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-xl p-4 shadow-sm border border-border slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
              <p className="text-foreground font-medium mb-3">{q.id}. {q.text}</p>
              <div className="flex gap-3 justify-center" dir="ltr">
                <button
                  onClick={() => handleAnswer(q.id, true)}
                  className={`px-6 py-2 rounded-full font-bold transition-all duration-200 border-2 ${
                    answers[q.id] === true
                      ? 'bg-secondary text-secondary-foreground border-secondary scale-105'
                      : 'bg-background text-foreground border-border hover:border-secondary/50'
                  }`}
                >
                  כן ✓
                </button>
                <button
                  onClick={() => handleAnswer(q.id, false)}
                  className={`px-6 py-2 rounded-full font-bold transition-all duration-200 border-2 ${
                    answers[q.id] === false
                      ? 'bg-destructive/80 text-destructive-foreground border-destructive scale-105'
                      : 'bg-background text-foreground border-border hover:border-destructive/50'
                  }`}
                >
                  לא ✗
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-6 py-3 rounded-lg bg-muted text-foreground font-medium disabled:opacity-30 hover:bg-muted/80 transition-all"
          >
            ← הקודם
          </button>

          {page < totalPages - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pageAllAnswered}
              className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium disabled:opacity-30 hover:opacity-90 transition-all"
            >
              הבא →
            </button>
          ) : (
            <button
              onClick={() => onComplete(answers)}
              disabled={!allAnswered}
              className="px-10 py-4 rounded-lg bg-secondary text-secondary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
            >
              🦉 סיום חלק ד׳ ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default HollandQuestionnaire;
