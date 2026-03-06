import { useState, useMemo } from 'react';
import { viaQuestions } from '@/data/viaQuestions';
import StarRating from './StarRating';
import OwlMessage from './OwlMessage';
import type { Answers } from '@/lib/scoring';
import { getVIAEncouragement, getRandomWisdomTip } from '@/lib/owlMessages';

interface VIAQuestionnaireProps {
  answers: Answers;
  onAnswer: (id: number, score: number) => void;
  onComplete: () => void;
}

const QUESTIONS_PER_PAGE = 8;

const VIAQuestionnaire = ({ answers, onAnswer, onComplete }: VIAQuestionnaireProps) => {
  const [page, setPageRaw] = useState(0);
  const setPage = (updater: (p: number) => number) => {
    setPageRaw(prev => {
      const next = updater(prev);
      if (next !== prev) window.scrollTo({ top: 0, behavior: 'instant' });
      return next;
    });
  };
  const totalPages = Math.ceil(viaQuestions.length / QUESTIONS_PER_PAGE);
  const currentQuestions = viaQuestions.slice(
    page * QUESTIONS_PER_PAGE,
    (page + 1) * QUESTIONS_PER_PAGE
  );

  const answeredOnPage = currentQuestions.filter(q => answers[q.id] !== undefined).length;
  const allAnswered = Object.keys(answers).length >= viaQuestions.length;
  const totalAnswered = Object.keys(answers).length;
  const progress = (totalAnswered / viaQuestions.length) * 100;

  const encouragement = getVIAEncouragement(totalAnswered, viaQuestions.length);
  const wisdomTip = useMemo(() => getRandomWisdomTip(), [page]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm">
            🌟 חלק א׳
          </div>
          <h2 className="text-2xl font-bold font-serif text-foreground">שאלון חוזקות VIA</h2>
          <p className="text-muted-foreground">דרגו כל אמירה מ-1 (לא מתאים) עד 5 (מתאים מאוד)</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>עמוד {page + 1} מתוך {totalPages}</span>
            <span>{totalAnswered} / {viaQuestions.length} שאלות</span>
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
        {page > 0 && !encouragement && <OwlMessage message={wisdomTip} variant="tip" />}

        {/* Questions */}
        <div className="space-y-6" key={page}>
          {currentQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-2xl p-6 shadow-md border border-border card-enter" style={{ animationDelay: `${idx * 0.1}s` }}>
              <p className="text-question font-medium text-foreground mb-4">
                {q.id}. {q.text}
              </p>
              <StarRating
                value={answers[q.id] || 0}
                onChange={(val) => onAnswer(q.id, val)}
              />
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-6 py-3 rounded-xl bg-muted text-foreground font-medium disabled:opacity-30 hover:bg-muted/80 transition-colors"
          >
            ← הקודם
          </button>

          {page < totalPages - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={answeredOnPage < currentQuestions.length}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium disabled:opacity-30 hover:opacity-90 transition-colors"
            >
              הבא →
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={!allAnswered}
              className="px-8 py-3 rounded-xl bg-secondary text-secondary-foreground font-semibold font-serif disabled:opacity-30 hover:opacity-90 transition-colors"
            >
              <img src={owlLogo} alt="" className="w-5 h-5 rounded-full inline-block" /> סיום חלק א׳ ✓
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIAQuestionnaire;
