import { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { hollandQuestions, type HollandCategory } from '@/data/hollandQuestions';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';
import QuestProgressBadge from './QuestProgressBadge';
import { burstConfetti } from '@/lib/confetti';

const hollandAnswerKey = [
  { label: 'מזוג לקוקטייל', desc: 'התמצית הזו נכנסת לכוס שלך — מדבר אליך' },
  { label: 'החזר למדף', desc: 'התמצית חוזרת למדף — לא בשבילך' },
];

type RIASEC = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

const CAT_TO_KEY: Record<HollandCategory, RIASEC> = {
  'ביצועי (R)': 'R',
  'חקרני (I)': 'I',
  'אומנותי (A)': 'A',
  'חברתי (S)': 'S',
  'יזמי (E)': 'E',
  'מינהלי (C)': 'C',
};

const CAT_STYLE: Record<RIASEC, { liquidTop: string; liquidBot: string; emoji: string; label: string; chip: string }> = {
  R: { liquidTop: '#fbbf24', liquidBot: '#d97706', emoji: '⚙️', label: 'ביצועית', chip: 'bg-amber-100 text-amber-900' },
  I: { liquidTop: '#38bdf8', liquidBot: '#0369a1', emoji: '🔬', label: 'חקרנית',  chip: 'bg-sky-100 text-sky-900' },
  A: { liquidTop: '#f472b6', liquidBot: '#be185d', emoji: '🎨', label: 'אמנותית', chip: 'bg-pink-100 text-pink-900' },
  S: { liquidTop: '#4ade80', liquidBot: '#15803d', emoji: '🤝', label: 'חברתית',  chip: 'bg-emerald-100 text-emerald-900' },
  E: { liquidTop: '#fb923c', liquidBot: '#c2410c', emoji: '✨', label: 'יזמית',   chip: 'bg-orange-100 text-orange-900' },
  C: { liquidTop: '#c084fc', liquidBot: '#7e22ce', emoji: '🗂️', label: 'מנהלתית',chip: 'bg-violet-100 text-violet-900' },
};

// SVG bottle vial — same look & feel as the Cocktail page
const BottleVial = ({
  liquidTop, liquidBot, emoji, selected, bubbling,
}: { liquidTop: string; liquidBot: string; emoji: string; selected: boolean; bubbling: boolean }) => {
  const gradId = `g-${liquidTop.replace('#','')}`;
  return (
    <svg viewBox="0 0 80 130" className="w-full h-full drop-shadow-md overflow-visible">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={liquidTop} stopOpacity="0.95" />
          <stop offset="100%" stopColor={liquidBot} stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`glass-${gradId}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
          <stop offset="40%" stopColor="#ffffff" stopOpacity="0.05" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.1" />
        </linearGradient>
        <clipPath id={`clip-${gradId}`}>
          <path d="M22 50 Q22 45 26 43 L26 35 Q26 32 30 32 L50 32 Q54 32 54 35 L54 43 Q58 45 58 50 L62 115 Q62 122 55 122 L25 122 Q18 122 18 115 Z" />
        </clipPath>
      </defs>
      <rect x="30" y="18" width="20" height="14" rx="2" fill="#8b6f47" />
      <rect x="30" y="18" width="20" height="3" rx="1" fill="#6b5337" />
      <rect x="32" y="28" width="16" height="8" fill="#e8e8e8" opacity="0.4" />
      <path
        d="M22 50 Q22 45 26 43 L26 35 Q26 32 30 32 L50 32 Q54 32 54 35 L54 43 Q58 45 58 50 L62 115 Q62 122 55 122 L25 122 Q18 122 18 115 Z"
        fill="#ffffff" fillOpacity="0.15" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.2"
      />
      <g clipPath={`url(#clip-${gradId})`}>
        <rect x="0" y="55" width="80" height="80" fill={`url(#${gradId})`} />
        <path d="M10 58 Q40 54 70 58 L70 65 L10 65 Z" fill={liquidTop} opacity="0.7" />
        {bubbling && (
          <>
            <circle cx="32" cy="100" r="2" fill="#fff" opacity="0.7">
              <animate attributeName="cy" values="115;55" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.7;0" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="46" cy="90" r="1.5" fill="#fff" opacity="0.6">
              <animate attributeName="cy" values="115;55" dur="2.8s" begin="0.6s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0;0.6;0" dur="2.8s" begin="0.6s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </g>
      <path
        d="M22 50 Q22 45 26 43 L26 35 Q26 32 30 32 L50 32 Q54 32 54 35 L54 43 Q58 45 58 50 L62 115 Q62 122 55 122 L25 122 Q18 122 18 115 Z"
        fill={`url(#glass-${gradId})`}
      />
      <rect x="24" y="55" width="3" height="55" rx="1.5" fill="#ffffff" opacity="0.4" />
      <foreignObject x="20" y="78" width="40" height="30">
        <div style={{ fontSize: 22, textAlign: 'center', filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{emoji}</div>
      </foreignObject>
      {selected && (
        <circle cx="40" cy="78" r="34" fill="none" stroke="#fff" strokeWidth="2.5" opacity="0.9">
          <animate attributeName="r" values="34;38;34" dur="1.6s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
};

// Cocktail glass that fills as the user pours in
const CocktailGlass = ({ counts }: { counts: Record<RIASEC, number> }) => {
  const total = (Object.values(counts) as number[]).reduce((a, b) => a + b, 0);
  const max = 30;
  const fillPct = Math.min(100, (total / max) * 100);
  const keys: RIASEC[] = ['R', 'I', 'A', 'S', 'E', 'C'];
  const order = keys.filter(k => counts[k] > 0);
  let acc = 0;
  return (
    <svg viewBox="0 0 120 140" className="w-24 h-28 drop-shadow-md">
      <defs>
        <clipPath id="glassClip">
          <path d="M20 20 L100 20 L75 90 L75 120 L90 120 L90 130 L30 130 L30 120 L45 120 L45 90 Z" />
        </clipPath>
      </defs>
      <path d="M20 20 L100 20 L75 90 L75 120 L90 120 L90 130 L30 130 L30 120 L45 120 L45 90 Z"
        fill="#ffffff" fillOpacity="0.08" stroke="#ffffff" strokeOpacity="0.6" strokeWidth="1.5" />
      <g clipPath="url(#glassClip)">
        {order.map((k) => {
          const share = counts[k] / total;
          const layerH = share * fillPct;
          const y = 130 - fillPct + acc;
          acc += layerH;
          const s = CAT_STYLE[k];
          return (
            <rect key={k} x="0" y={y} width="120" height={layerH}
              fill={`url(#cock-${k})`} />
          );
        })}
        {keys.map(k => (
          <linearGradient key={k} id={`cock-${k}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CAT_STYLE[k].liquidTop} />
            <stop offset="100%" stopColor={CAT_STYLE[k].liquidBot} />
          </linearGradient>
        ))}
      </g>
      {/* straw */}
      <rect x="62" y="6" width="4" height="80" rx="1.5" fill="#ef4444" opacity="0.85" transform="rotate(12 64 46)" />
    </svg>
  );
};

interface HollandQuestionnaireProps {
  onComplete: (answers: Record<number, boolean>) => void;
  onBackToHub?: () => void;
}

const QUESTIONS_PER_PAGE = 9;

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
  const poured = Object.values(answers).filter(v => v === true).length;
  const progress = (totalAnswered / shuffledQuestions.length) * 100;
  const allAnswered = totalAnswered >= shuffledQuestions.length;
  const pageAllAnswered = pageQuestions.every(q => answers[q.id] !== undefined);

  // counts per category for the glass
  const counts = useMemo(() => {
    const c: Record<RIASEC, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    for (const q of shuffledQuestions) {
      if (answers[q.id] === true) c[CAT_TO_KEY[q.category]]++;
    }
    return c;
  }, [answers, shuffledQuestions]);

  const handleAnswer = (id: number, value: boolean) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <QuestProgressBadge current={totalAnswered} total={shuffledQuestions.length} label="תמציות" icon="🧪" />
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            🧪 בר התמציות שלי
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">איזו תמצית נכנסת לקוקטייל שלך?</h2>
          <p className="text-muted-foreground text-lg">כל תמצית היא פעילות מהחיים. "מזוג" — אם זה אתה. "החזר למדף" — אם לא.</p>
        </div>

        {/* Cocktail glass + progress */}
        <div className="bg-card/70 backdrop-blur rounded-3xl p-4 border border-border/60 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-4">
            <CocktailGlass counts={counts} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">🍸 הקוקטייל שלי</span>
                <span className="text-sm text-muted-foreground">{poured} מזיגות · עמוד {page + 1}/{totalPages}</span>
              </div>
              <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
              </div>
              {poured > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {(Object.entries(counts) as [RIASEC, number][])
                    .filter(([, n]) => n > 0)
                    .sort((a, b) => b[1] - a[1])
                    .map(([k, n]) => (
                      <span key={k} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${CAT_STYLE[k].chip}`}>
                        <span>{CAT_STYLE[k].emoji}</span>
                        <span>{CAT_STYLE[k].label}</span>
                        <span className="opacity-70">×{n}</span>
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <AnswerKeyReminder items={hollandAnswerKey} />

        {/* Bottles */}
        <div className="space-y-5">
          <AnimatePresence mode="popLayout">
            {pageQuestions.map((q, idx) => {
              const key = CAT_TO_KEY[q.category];
              const style = CAT_STYLE[key];
              const selected = answers[q.id];
              const isYes = selected === true;
              const isNo = selected === false;
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0, scale: isYes ? 1.01 : 1 }}
                  transition={{ duration: 0.5, delay: idx * 0.04, ease: 'easeOut' }}
                >
                  <div
                    className={`relative bg-card rounded-3xl border border-border/60 shadow-[var(--shadow-card)] p-4 md:p-5 overflow-hidden flex gap-4 items-stretch ${isNo ? 'opacity-60' : ''} ${isYes ? 'ring-2 ring-success/60' : ''}`}
                  >
                    {/* Bottle on the side */}
                    <div className="w-20 md:w-24 shrink-0 flex items-center justify-center">
                      <BottleVial
                        liquidTop={style.liquidTop}
                        liquidBot={style.liquidBot}
                        emoji={style.emoji}
                        selected={isYes}
                        bubbling={isYes}
                      />
                    </div>

                    {/* Text + actions */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <p className="text-foreground font-medium mb-4 text-lg leading-relaxed font-display">
                        {q.text}
                      </p>
                      <div className="flex gap-2 flex-wrap" dir="ltr">
                        <motion.button
                          onClick={() => handleAnswer(q.id, true)}
                          whileTap={{ scale: 0.92 }}
                          aria-label={`מזוג לקוקטייל – ${q.text}`}
                          className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-full font-semibold font-display tracking-wide transition-all duration-300 border-2 min-h-[52px] text-base md:text-lg ${
                            isYes
                              ? 'bg-success text-success-foreground border-success scale-[1.03] shadow-[0_0_24px_hsl(var(--success)/0.35)]'
                              : 'bg-card text-foreground border-border hover:border-success/50 hover:bg-success-soft/40'
                          }`}
                        >
                          🥃 מזוג לקוקטייל
                        </motion.button>
                        <motion.button
                          onClick={() => handleAnswer(q.id, false)}
                          whileTap={{ scale: 0.92 }}
                          aria-label={`החזר למדף – ${q.text}`}
                          className={`flex-1 min-w-[140px] px-5 py-3.5 rounded-full font-semibold font-display tracking-wide transition-all duration-300 border-2 min-h-[52px] text-base md:text-lg ${
                            isNo
                              ? 'bg-coral text-coral-foreground border-coral scale-[1.03] shadow-[0_0_24px_hsl(var(--coral)/0.35)]'
                              : 'bg-card text-foreground border-border hover:border-coral/50 hover:bg-coral-soft/40'
                          }`}
                        >
                          ↩︎ החזר למדף
                        </motion.button>
                      </div>
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
