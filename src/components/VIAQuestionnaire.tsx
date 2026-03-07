import { useState, useMemo } from 'react';
import { viaQuestions } from '@/data/viaQuestions';
import StarRating from './StarRating';
import OwlMessage from './OwlMessage';
import owlLogo from '@/assets/owl-logo.png';
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
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ חלק א׳
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">שאלון חוזקות VIA</h2>
          <p className="text-muted-foreground text-lg">דרגו כל אמירה מ-1 (לא מתאים) עד 5 (מתאים מאוד)</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>עמוד {page + 1} מתוך {totalPages}</span>
            <span>{totalAnswered} / {viaQuestions.length} שאלות</span>
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
        {page > 0 && !encouragement && <OwlMessage message={wisdomTip} variant="tip" />}

        {/* Questions */}
        <div className="space-y-5" key={page}>
          {currentQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-3xl p-6 md:p-8 shadow-[var(--shadow-card)] border border-border/60 card-enter" style={{ animationDelay: `${idx * 0.08}s` }}>
              <p className="text-lg font-medium text-foreground mb-5 leading-relaxed">
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
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setPage(p => p - 1)}
            disabled={page === 0}
            className="px-6 py-3 rounded-2xl bg-card text-foreground font-medium font-display tracking-wide border border-border/60 disabled:opacity-25 hover:border-secondary/30 hover:shadow-[var(--shadow-card)] transition-all duration-300"
          >
            הקודם →
          </button>

          {page < totalPages - 1 ? (
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={answeredOnPage < currentQuestions.length}
              className="px-8 py-3 rounded-2xl bg-primary text-primary-foreground font-medium font-display tracking-wide disabled:opacity-25 hover:bg-primary/85 transition-all duration-300 shadow-[var(--shadow-card)]"
            >
              ← הבא
            </button>
          ) : (
            <button
              onClick={onComplete}
              disabled={!allAnswered}
              className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold font-display text-lg tracking-wide disabled:opacity-25 hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)]"
            >
              <img src={owlLogo} alt="" className="w-6 h-6 rounded-full ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110" />
              <span>סיום חלק א׳</span>
              <span className="text-primary-foreground/60 transition-transform duration-300 group-hover:translate-x-[4px]">✓</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VIAQuestionnaire;
