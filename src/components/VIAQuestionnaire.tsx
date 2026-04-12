import { useState, useMemo } from 'react';
import { viaQuestions } from '@/data/viaQuestions';
import StarRating from './StarRating';
import OwlMessage from './OwlMessage';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';
import type { Answers } from '@/lib/scoring';
import { getVIAEncouragement, getRandomWisdomTip } from '@/lib/owlMessages';

const viaAnswerKey = [
  { label: '1', desc: 'בכלל לא מתאים לי' },
  { label: '2', desc: 'מתאים לי במידה מועטה' },
  { label: '3', desc: 'מתאים לי במידה בינונית' },
  { label: '4', desc: 'מתאים לי במידה רבה' },
  { label: '5', desc: 'מתאים לי מאד' },
];

interface VIAQuestionnaireProps {
  answers: Answers;
  onAnswer: (id: number, score: number) => void;
  onComplete: () => void;
  onBackToHub?: () => void;
}

const QUESTIONS_PER_PAGE = 8;

const VIAQuestionnaire = ({ answers, onAnswer, onComplete, onBackToHub }: VIAQuestionnaireProps) => {
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
            ✦ חוזקות VIA
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">שאלון חוזקות VIA</h2>
          <p className="text-muted-foreground text-lg">דרגו כל אמירה מ-1 (לא מתאים) עד 5 (מתאים מאוד)</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-base text-muted-foreground">
            <span>עמוד {page + 1} מתוך {totalPages}</span>
            <span>{totalAnswered} / {viaQuestions.length} שאלות</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-secondary rounded-full progress-bar-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AnswerKeyReminder items={viaAnswerKey} />

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

        <QuestionnaireNav
          onPrev={() => setPage(p => p - 1)}
          prevDisabled={page === 0}
          showPrev
          showNext={page < totalPages - 1}
          onNext={() => setPage(p => p + 1)}
          nextDisabled={answeredOnPage < currentQuestions.length}
          showComplete={page === totalPages - 1}
          onComplete={onComplete}
          completeDisabled={!allAnswered}
          completeLabel="סיום שאלון חוזקות"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default VIAQuestionnaire;
