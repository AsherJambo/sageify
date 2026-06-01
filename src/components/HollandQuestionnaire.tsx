import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hollandQuestions, hollandCategories, type HollandCategory } from '@/data/hollandQuestions';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';
import QuestProgressBadge from './QuestProgressBadge';
import { burstConfetti } from '@/lib/confetti';

const hollandAnswerKey = [
  { label: 'שמור על הקיר', desc: 'הגלויה שמורה — הפעילות מדברת אליי' },
  { label: 'לא בשבילי', desc: 'הגלויה מתהפכת — לא תוסיף לקיר שלי' },
];

// Postcard "stamp" per RIASEC category — emoji + warm gradient
const CARD_STYLE: Record<HollandCategory, { stamp: string; place: string; tint: string; ring: string; chip: string }> = {
  'ביצועי (R)':   { stamp: '🛠️', place: 'הסדנה',     tint: 'from-amber-50 via-orange-50/60 to-stone-50',    ring: 'ring-amber-200/70',  chip: 'bg-amber-100/80 text-amber-900' },
  'חקרני (I)':    { stamp: '🔬', place: 'המעבדה',     tint: 'from-sky-50 via-blue-50/60 to-indigo-50/40',     ring: 'ring-sky-200/70',    chip: 'bg-sky-100/80 text-sky-900' },
  'אומנותי (A)':  { stamp: '🎨', place: 'הסטודיו',    tint: 'from-fuchsia-50 via-rose-50/60 to-purple-50/40', ring: 'ring-fuchsia-200/70',chip: 'bg-fuchsia-100/80 text-fuchsia-900' },
  'חברתי (S)':    { stamp: '🤝', place: 'הקהילה',     tint: 'from-rose-50 via-coral-soft/40 to-orange-50',    ring: 'ring-rose-200/70',   chip: 'bg-rose-100/80 text-rose-900' },
  'יזמי (E)':     { stamp: '✨', place: 'הבמה',       tint: 'from-yellow-50 via-amber-50/60 to-orange-50/40', ring: 'ring-yellow-200/70', chip: 'bg-yellow-100/80 text-yellow-900' },
  'מינהלי (C)':   { stamp: '🗂️', place: 'הלשכה',      tint: 'from-teal-50 via-emerald-50/60 to-cyan-50/40',   ring: 'ring-teal-200/70',   chip: 'bg-teal-100/80 text-teal-900' },
};

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
  const onWall = Object.values(answers).filter(v => v === true).length;
  const progress = (totalAnswered / shuffledQuestions.length) * 100;
  const allAnswered = totalAnswered >= shuffledQuestions.length;
  const pageAllAnswered = pageQuestions.every(q => answers[q.id] !== undefined);

  const handleAnswer = (id: number, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <QuestProgressBadge current={totalAnswered} total={shuffledQuestions.length} label="גלויות" icon="🖼️" />
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            🖼️ קיר הגלויות שלי
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">איזו פעילות הייתי תולה על הקיר?</h2>
          <p className="text-muted-foreground text-lg">כל גלויה היא פעילות מהחיים. "שמור" — אם זה מדבר אליך. "לא בשבילי" — אם לא.</p>
        </div>

        {/* Mini wall — collected postcards so far */}
        <div className="bg-card/70 backdrop-blur rounded-3xl p-4 border border-border/60 shadow-[var(--shadow-card)]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">🖼️ הקיר שלי</span>
            <span className="text-sm text-muted-foreground">{onWall} גלויות נתלו · עמוד {page + 1}/{totalPages}</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
          {onWall > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3 max-h-16 overflow-hidden">
              {shuffledQuestions
                .filter(q => answers[q.id] === true)
                .slice(-24)
                .map((q, i) => (
                  <motion.span
                    key={q.id}
                    initial={{ scale: 0, rotate: -20 }}
                    animate={{ scale: 1, rotate: (i % 5 - 2) * 4 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 14 }}
                    className={`inline-flex w-7 h-7 items-center justify-center rounded-md text-base shadow-sm ${CARD_STYLE[q.category].chip}`}
                    aria-hidden
                  >
                    {CARD_STYLE[q.category].stamp}
                  </motion.span>
                ))}
            </div>
          )}
        </div>

        <AnswerKeyReminder items={hollandAnswerKey} />

        {/* Postcards */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {pageQuestions.map((q, idx) => {
              const style = CARD_STYLE[q.category];
              const tilt = (idx % 2 === 0 ? -1 : 1) * (0.6 + (idx % 3) * 0.4);
              const selected = answers[q.id];
              const isYes = selected === true;
              const isNo = selected === false;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20, rotate: tilt - 2 }}
                  animate={{ opacity: 1, y: 0, rotate: isNo ? 0 : tilt, scale: isYes ? 1.01 : 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04, ease: 'easeOut' }}
                  className="relative"
                >
                  {/* "Pin" decoration when saved */}
                  {isYes && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-coral shadow-[0_2px_6px_hsl(var(--coral)/0.5)] z-10 ring-2 ring-background"
                      aria-hidden
                    />
                  )}

                  <div
                    className={`relative bg-gradient-to-br ${style.tint} rounded-2xl border-2 border-dashed border-border/60 ring-1 ${style.ring} p-5 md:p-6 shadow-[var(--shadow-card)] overflow-hidden ${isNo ? 'opacity-60' : ''}`}
                    style={{
                      backgroundImage:
                        'radial-gradient(circle at 1px 1px, hsl(var(--border) / 0.25) 1px, transparent 0)',
                      backgroundSize: '14px 14px',
                    }}
                  >
                    {/* Postcard "stamp" */}
                    <div className={`absolute top-3 left-3 w-12 h-14 rounded-md ${style.chip} flex items-center justify-center text-2xl border-2 border-dashed border-background/60 shadow-sm rotate-[-6deg]`} aria-hidden>
                      {style.stamp}
                    </div>
                    {/* "Postmark" */}
                    <div className="absolute top-4 right-4 text-[10px] text-muted-foreground/70 font-mono uppercase tracking-widest border border-border/50 rounded-full px-2 py-0.5 rotate-[8deg]">
                      ✉ {style.place}
                    </div>

                    <p className="text-foreground font-medium mb-5 text-lg leading-relaxed mt-12 pr-2 font-display">
                      {q.text}
                    </p>

                    <div className="flex gap-3 justify-center" dir="ltr">
                      <motion.button
                        onClick={() => handleAnswer(q.id, true)}
                        whileTap={{ scale: 0.92 }}
                        aria-label={`שמור על הקיר – ${q.text}`}
                        className={`px-7 py-3.5 rounded-full font-semibold font-display tracking-wide transition-all duration-300 border-2 min-h-[52px] text-base md:text-lg ${
                          isYes
                            ? 'bg-success text-success-foreground border-success scale-[1.05] shadow-[0_0_24px_hsl(var(--success)/0.35)]'
                            : 'bg-card/80 text-foreground border-border hover:border-success/50 hover:bg-success-soft/40'
                        }`}
                      >
                        📌 שמור על הקיר
                      </motion.button>
                      <motion.button
                        onClick={() => handleAnswer(q.id, false)}
                        whileTap={{ scale: 0.92 }}
                        aria-label={`לא בשבילי – ${q.text}`}
                        className={`px-7 py-3.5 rounded-full font-semibold font-display tracking-wide transition-all duration-300 border-2 min-h-[52px] text-base md:text-lg ${
                          isNo
                            ? 'bg-coral text-coral-foreground border-coral scale-[1.05] shadow-[0_0_24px_hsl(var(--coral)/0.35)]'
                            : 'bg-card/80 text-foreground border-border hover:border-coral/50 hover:bg-coral-soft/40'
                        }`}
                      >
                        ↩︎ לא בשבילי
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        <QuestionnaireNav
          onPrev={() => setPage(p => p - 1)}
          prevDisabled={page === 0}
          showPrev
          showNext={page < totalPages - 1}
          onNext={() => setPage(p => p + 1)}
          nextDisabled={!pageAllAnswered}
          showComplete={page === totalPages - 1}
          onComplete={() => { burstConfetti(); onComplete(answers); }}
          completeDisabled={!allAnswered}
          completeLabel="סיום שאלון נטיות"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default HollandQuestionnaire;
