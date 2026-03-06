import { useState, useMemo } from 'react';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import OwlMessage from './OwlMessage';
import owlLogo from '@/assets/owl-logo.png';

interface HollandQuestionnaireProps {
  onComplete: (answers: Record<number, boolean>) => void;
}

const QUESTIONS_PER_PAGE = 11;

function seededShuffle<T>(arr: T[], seed: number): T[] {
  const result = [...arr];
  let s = seed;
  for (let i = result.length - 1; i > 0; i--) {
    s = (s * 16807 + 0) % 2147483647;
    const j = s % (i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const HollandQuestionnaire = ({ onComplete }: HollandQuestionnaireProps) => {
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [page, setPageRaw] = useState(0);
  const setPage = (updater: (p: number) => number) => {
    setPageRaw(prev => {
      const next = updater(prev);
      if (next !== prev) window.scrollTo({ top: 0, behavior: 'instant' });
      return next;
    });
  };

  const shuffledQuestions = useMemo(() => seededShuffle(hollandQuestions, 42), []);

  const totalPages = Math.ceil(shuffledQuestions.length / QUESTIONS_PER_PAGE);
  const pageQuestions = shuffledQuestions.slice(page * QUESTIONS_PER_PAGE, (page + 1) * QUESTIONS_PER_PAGE);
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / shuffledQuestions.length) * 100;
  const allAnswered = totalAnswered >= shuffledQuestions.length;
  const pageAllAnswered = pageQuestions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (id: number, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm">
            🔍 חלק ד׳
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">נטיות תעסוקתיות</h2>
          <p className="text-muted-foreground">סמנו "כן" או "לא" עבור כל פעילות</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{totalAnswered} / {shuffledQuestions.length} שאלות</span>
            <span>עמוד {page + 1} / {totalPages}</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-secondary rounded-full progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-3">
          {pageQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-2xl p-4 shadow-md border border-border slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
              <p className="text-foreground font-medium mb-3">{q.text}</p>
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
            className="px-6 py-3 rounded-xl bg-muted text-foreground font-medium disabled:opacity-30 hover:bg-muted/80 transition-all"
          >
            ← הקודם
          </button>

          {page < totalPages - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={!pageAllAnswered}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-30 hover:opacity-90 transition-all"
            >
              הבא →
            </button>
          ) : (
            <button
              onClick={() => onComplete(answers)}
              disabled={!allAnswered}
              className="px-10 py-4 rounded-xl bg-secondary text-secondary-foreground font-semibold font-serif text-xl disabled:opacity-30 hover:opacity-90 transition-all shadow-lg"
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
