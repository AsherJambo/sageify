import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { viaQuestions, viaCategories, type VIACategory } from '@/data/viaQuestions';
import OwlMessage from './OwlMessage';
import QuestionnaireNav from './QuestionnaireNav';
import AnswerKeyReminder from './AnswerKeyReminder';
import QuestProgressBadge from './QuestProgressBadge';
import type { Answers } from '@/lib/scoring';
import { getVIAEncouragement, getRandomWisdomTip } from '@/lib/owlMessages';
import { burstConfetti } from '@/lib/confetti';

const viaAnswerKey = [
  { label: '💧', desc: 'בכלל לא מתאים — אין השקיה' },
  { label: '💧💧', desc: 'מתאים מעט' },
  { label: '💧💧💧', desc: 'מתאים במידה בינונית' },
  { label: '💧💧💧💧', desc: 'מתאים מאוד' },
  { label: '💧💧💧💧💧', desc: 'זה ממש אני — פריחה מלאה' },
];

interface VIAQuestionnaireProps {
  answers: Answers;
  onAnswer: (id: number, score: number) => void;
  onComplete: () => void;
  onBackToHub?: () => void;
}

const QUESTIONS_PER_PAGE = 8;

// Visual identity per VIA category — flower + color from design tokens
const CAT_STYLE: Record<VIACategory, { emoji: string; color: string; soft: string; ring: string; label: string }> = {
  'חכמה וידע':           { emoji: '🌻', color: 'hsl(var(--sunny))',   soft: 'hsl(var(--sunny-soft))',   ring: 'hsl(var(--sunny))',   label: 'חמנייה' },
  'אומץ לב':              { emoji: '🌹', color: 'hsl(var(--coral))',   soft: 'hsl(var(--coral-soft))',   ring: 'hsl(var(--coral))',   label: 'שושנה' },
  'אנושיות':              { emoji: '🌷', color: 'hsl(var(--terracotta))', soft: 'hsl(var(--coral-soft))', ring: 'hsl(var(--terracotta))', label: 'צבעוני' },
  'חוש צדק':              { emoji: '🍀', color: 'hsl(var(--success))', soft: 'hsl(var(--success-soft))', ring: 'hsl(var(--success))', label: 'תלתן' },
  'מתינות וריסון':        { emoji: '🌿', color: 'hsl(var(--sage))',    soft: 'hsl(var(--sage-light))',   ring: 'hsl(var(--sage))',    label: 'עשב חכם' },
  'מיקוד בטוב/נשגבות':   { emoji: '🌼', color: 'hsl(var(--sky))',     soft: 'hsl(var(--sky-soft))',     ring: 'hsl(var(--sky))',     label: 'חיננית' },
};

// A single flower in the garden — stem + bloom that grows with score
const Flower = ({ cat, avg, count }: { cat: VIACategory; avg: number; count: number }) => {
  const style = CAT_STYLE[cat];
  // bloom scale: 0 (seed) -> 1 (full bloom), based on avg 0..5
  const t = Math.max(0, Math.min(1, avg / 5));
  const bloomScale = 0.35 + t * 0.85; // 0.35 -> 1.2
  const stemHeight = 30 + t * 50;     // 30 -> 80
  const bloomOpacity = count === 0 ? 0.25 : 0.6 + t * 0.4;

  return (
    <div className="flex flex-col items-center gap-1 min-w-[58px]">
      <motion.div
        key={`${cat}-${count}-${avg.toFixed(2)}`}
        initial={{ scale: bloomScale * 0.85 }}
        animate={{ scale: bloomScale }}
        transition={{ type: 'spring', stiffness: 220, damping: 14 }}
        className="text-3xl md:text-4xl select-none"
        style={{
          filter: count === 0
            ? 'grayscale(0.7) opacity(0.45)'
            : `drop-shadow(0 4px 10px ${style.color}55)`,
          opacity: bloomOpacity,
        }}
      >
        {style.emoji}
      </motion.div>
      <motion.div
        initial={{ height: 30 }}
        animate={{ height: stemHeight }}
        transition={{ type: 'spring', stiffness: 180, damping: 18 }}
        className="w-[3px] rounded-full"
        style={{ background: `linear-gradient(to top, hsl(var(--sage)/0.7), ${style.color})` }}
      />
      <div className="text-[10px] text-muted-foreground/70 leading-tight text-center max-w-[64px]">
        {cat}
      </div>
    </div>
  );
};

// Garden bed component
const GardenBed = ({ answers }: { answers: Answers }) => {
  const perCat = useMemo(() => {
    const acc: Record<string, { total: number; count: number }> = {};
    viaCategories.forEach(c => { acc[c] = { total: 0, count: 0 }; });
    Object.entries(answers).forEach(([id, score]) => {
      const q = viaQuestions.find(q => q.id === Number(id));
      if (q && acc[q.category]) {
        acc[q.category].total += score;
        acc[q.category].count += 1;
      }
    });
    return acc;
  }, [answers]);

  return (
    <div className="relative rounded-3xl overflow-hidden border border-border/60 shadow-[var(--shadow-card)]"
         style={{ background: 'linear-gradient(to bottom, hsl(200 70% 88%) 0%, hsl(200 60% 94%) 55%, hsl(40 30% 88%) 56%, hsl(28 35% 78%) 100%)' }}>
      {/* sun */}
      <div className="absolute top-3 left-4 text-3xl select-none animate-pulse">☀️</div>
      {/* clouds */}
      <div className="absolute top-4 right-6 text-2xl opacity-70 select-none">☁️</div>

      <div className="px-3 pt-12 pb-4 flex items-end justify-between gap-1 md:gap-2 overflow-x-auto">
        {viaCategories.map(cat => (
          <Flower
            key={cat}
            cat={cat}
            avg={perCat[cat].count ? perCat[cat].total / perCat[cat].count : 0}
            count={perCat[cat].count}
          />
        ))}
      </div>
      {/* soil */}
      <div className="h-3 bg-gradient-to-b from-[hsl(28,40%,55%)] to-[hsl(28,45%,42%)]" />
    </div>
  );
};

// 5-droplet rating input
const WaterRating = ({ value, onChange, color }: { value: number; onChange: (v: number) => void; color: string }) => {
  return (
    <div className="flex gap-2 justify-center items-center" dir="ltr">
      {[1, 2, 3, 4, 5].map(v => {
        const active = value >= v;
        return (
          <motion.button
            key={v}
            onClick={() => onChange(v)}
            whileTap={{ scale: 0.85 }}
            whileHover={{ y: -2 }}
            aria-label={`${v} מתוך 5`}
            className={`relative w-11 h-12 md:w-12 md:h-14 rounded-b-full rounded-t-[40%] border-2 transition-all duration-300 flex items-end justify-center pb-1 text-xs font-bold ${
              active
                ? 'border-transparent text-white shadow-md scale-105'
                : 'border-border/60 bg-card text-muted-foreground/40 hover:border-sky/50'
            }`}
            style={active ? {
              background: `linear-gradient(to bottom, ${color}55 0%, ${color} 70%, ${color} 100%)`,
              boxShadow: `0 4px 14px ${color}55`,
            } : undefined}
          >
            <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/70" />
            {v}
          </motion.button>
        );
      })}
    </div>
  );
};

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
      <QuestProgressBadge current={totalAnswered} total={viaQuestions.length} label="חוזקות" icon="🌱" />
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            🌱 גן החוזקות
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            השקו את גן החוזקות שלכם
          </h2>
          <p className="text-muted-foreground text-lg">
            כל שאלה היא זרע. בחרו כמה טיפות מים להעניק — ככל שתשקו יותר, הפרח של אותה חוזקה ילבלב חזק יותר.
          </p>
        </div>

        {/* The living garden */}
        <GardenBed answers={answers} />

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-base text-muted-foreground">
            <span>עמוד {page + 1} מתוך {totalPages}</span>
            <span>{totalAnswered} / {viaQuestions.length} זרעים הושקו</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full progress-bar-fill transition-all duration-700"
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
          {currentQuestions.map((q, idx) => {
            const cat = q.category as VIACategory;
            const style = CAT_STYLE[cat] ?? CAT_STYLE['חכמה וידע'];
            return (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(idx * 0.05, 0.3) }}
                className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 relative overflow-hidden"
              >
                {/* soft category halo */}
                <div className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-40 blur-2xl pointer-events-none"
                     style={{ background: style.color }} />

                <div className="flex items-start gap-4 mb-4 relative">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2"
                    style={{ background: style.soft, borderColor: `${style.color}40` }}
                    aria-hidden
                  >
                    {style.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-muted-foreground/70 mb-1">זרע #{q.id}</div>
                    <p className="text-lg font-medium text-foreground leading-relaxed">
                      {q.text}
                    </p>
                  </div>
                </div>

                <WaterRating
                  value={answers[q.id] || 0}
                  onChange={(val) => onAnswer(q.id, val)}
                  color={style.color}
                />
              </motion.div>
            );
          })}
        </div>

        <QuestionnaireNav
          onPrev={() => setPage(p => p - 1)}
          prevDisabled={page === 0}
          showPrev
          showNext={page < totalPages - 1}
          onNext={() => setPage(p => p + 1)}
          nextDisabled={answeredOnPage < currentQuestions.length}
          showComplete={page === totalPages - 1}
          onComplete={() => { burstConfetti(); onComplete(); }}
          completeDisabled={!allAnswered}
          completeLabel="סיום שאלון חוזקות"
          onBackToHub={onBackToHub}
        />
      </div>
    </div>
  );
};

export default VIAQuestionnaire;
