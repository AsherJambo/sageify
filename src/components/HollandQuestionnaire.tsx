import { useState, useMemo } from 'react';
import { hollandQuestions, hollandCategories } from '@/data/hollandQuestions';
import OwlMessage from './OwlMessage';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';

const hollandAnswerKey = [
  { label: 'כן', desc: 'הכישור או היכולת קיימים אצלי' },
  { label: 'לא', desc: 'הכישור או היכולת לא קיימים אצלי' },
];

interface HollandQuestionnaireProps {
  onComplete: (answers: Record<number, boolean>) => void;
  onBackToHub?: () => void;
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

const HollandQuestionnaire = ({ onComplete, onBackToHub }: HollandQuestionnaireProps) => {
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
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            🧭 נטיות
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">נטיות תעסוקתיות</h2>
          <p className="text-muted-foreground text-lg">סמנו "כן" או "לא" עבור כל פעילות</p>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-base text-muted-foreground">
            <span>{totalAnswered} / {shuffledQuestions.length} שאלות</span>
            <span>עמוד {page + 1} / {totalPages}</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full progress-bar-fill transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <AnswerKeyReminder items={hollandAnswerKey} />

        {/* Questions */}
        <div className="space-y-3">
          {pageQuestions.map((q, idx) => (
            <div key={q.id} className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 slide-up" style={{ animationDelay: `${idx * 0.03}s` }}>
              <p className="text-foreground font-medium mb-4 text-lg leading-relaxed">{q.text}</p>
              <div className="flex gap-4 justify-center" dir="ltr">
                <button
                  onClick={() => handleAnswer(q.id, true)}
                  aria-label={`כן – ${q.text}`}
                  className={`px-10 py-3.5 rounded-full font-semibold font-display tracking-wide transition-all duration-300 border-2 min-h-[52px] text-lg ${
                    answers[q.id] === true
                      ? 'bg-success text-success-foreground border-success scale-[1.05] shadow-[0_0_24px_hsl(var(--success)/0.35)]'
                      : 'bg-card text-foreground border-border hover:border-success/50 hover:bg-success-soft/40'
                  }`}
                >
                  כן ✓
                </button>
                <button
                  onClick={() => handleAnswer(q.id, false)}
                  aria-label={`לא – ${q.text}`}
                  className={`px-10 py-3.5 rounded-full font-semibold font-display tracking-wide transition-all duration-300 border-2 min-h-[52px] text-lg ${
                    answers[q.id] === false
                      ? 'bg-coral text-coral-foreground border-coral scale-[1.05] shadow-[0_0_24px_hsl(var(--coral)/0.35)]'
                      : 'bg-card text-foreground border-border hover:border-coral/50 hover:bg-coral-soft/40'
                  }`}
                >
                  לא ✗
                </button>
              </div>
            </div>
          ))}
        </div>

        <QuestionnaireNav
          onPrev={() => setPage(p => p - 1)}
          prevDisabled={page === 0}
          showPrev
          showNext={page < totalPages - 1}
          onNext={() => setPage(p => p + 1)}
          nextDisabled={!pageAllAnswered}
          showComplete={page === totalPages - 1}
          onComplete={() => onComplete(answers)}
          completeDisabled={!allAnswered}
          completeLabel="סיום שאלון נטיות"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default HollandQuestionnaire;
