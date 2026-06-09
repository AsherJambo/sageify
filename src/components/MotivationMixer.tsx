import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QuestionnaireNav from './QuestionnaireNav';
import OwlMessage from './OwlMessage';
import AnswerKeyReminder from './AnswerKeyReminder';
import QuestProgressBadge from './QuestProgressBadge';
import { burstConfetti } from '@/lib/confetti';
import {
  motivationClusters,
  intentionStatements,
  type MotivationScores,
  type IntentionAnswers,
} from '@/data/motivationQuestions';

interface Props {
  onComplete: (motivationScores: MotivationScores, intentionAnswers: IntentionAnswers) => void;
  onBackToHub?: () => void;
}

const SCALE = [1, 2, 3, 4, 5];
const scaleLabels: Record<number, string> = {
  1: 'כלל לא',
  2: 'מועט',
  3: 'בינוני',
  4: 'רב',
  5: 'מאוד',
};

const answerKey = [
  { label: '💧', desc: 'כלל לא מניע אותי' },
  { label: '💧💧', desc: 'מניע מעט' },
  { label: '💧💧💧', desc: 'מניע במידה בינונית' },
  { label: '💧💧💧💧', desc: 'מניע מאוד' },
  { label: '💧💧💧💧💧', desc: 'זה ממש המנוע שלי' },
];

// Cluster visual mapping — each cluster gets a "jar" of elixir
const CLUSTER_STYLE: Record<string, { color: string; soft: string; emoji: string; ringHsl: string }> = {
  financial:     { color: 'hsl(var(--sunny))',   soft: 'hsl(var(--sunny-soft))',   emoji: '💰', ringHsl: 'var(--sunny)' },
  social:        { color: 'hsl(var(--coral))',   soft: 'hsl(var(--coral-soft))',   emoji: '🤝', ringHsl: 'var(--coral)' },
  psychological: { color: 'hsl(var(--sky))',     soft: 'hsl(var(--sky-soft))',     emoji: '🧠', ringHsl: 'var(--sky)' },
  vitality:      { color: 'hsl(var(--success))', soft: 'hsl(var(--success-soft))', emoji: '🌿', ringHsl: 'var(--success)' },
};

// A potion jar that fills with elixir based on rating (0..5)
const PotionJar = ({ clusterId, value }: { clusterId: string; value: number }) => {
  const style = CLUSTER_STYLE[clusterId] ?? CLUSTER_STYLE.psychological;
  const fillPct = (value / 5) * 100;
  return (
    <div className="flex flex-col items-center gap-1 min-w-[58px]">
      {/* lid */}
      <div
        className="w-9 h-2 rounded-t-md"
        style={{ background: `hsl(${style.ringHsl} / 0.4)` }}
      />
      {/* jar */}
      <div
        className="relative w-12 h-20 md:w-14 md:h-24 rounded-b-2xl rounded-t-md border-2 overflow-hidden bg-card/70 backdrop-blur-sm"
        style={{ borderColor: `hsl(${style.ringHsl} / 0.55)` }}
      >
        {/* liquid */}
        <motion.div
          className="absolute bottom-0 left-0 right-0"
          initial={false}
          animate={{ height: `${fillPct}%` }}
          transition={{ type: 'spring', stiffness: 180, damping: 22 }}
          style={{
            background: `linear-gradient(to top, ${style.color} 0%, ${style.color} 60%, hsl(${style.ringHsl} / 0.6) 100%)`,
            boxShadow: `inset 0 6px 12px hsl(${style.ringHsl} / 0.35)`,
          }}
        >
          {/* surface shimmer */}
          {value > 0 && (
            <motion.div
              className="absolute top-0 left-0 right-0 h-1.5 bg-white/40"
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.div>
        {/* emoji label */}
        <div className="absolute inset-0 flex items-center justify-center text-2xl select-none"
             style={{ filter: value === 0 ? 'grayscale(0.6) opacity(0.5)' : 'none' }}>
          {style.emoji}
        </div>
      </div>
      <div className="text-[10px] text-muted-foreground/80 leading-tight text-center max-w-[64px] mt-1">
        {value > 0 ? `${value}/5` : '—'}
      </div>
    </div>
  );
};

// Mixer bench showing all 4 jars
const MixerBench = ({ scores }: { scores: MotivationScores }) => (
  <div
    className="relative rounded-3xl overflow-hidden border border-border/60 shadow-[var(--shadow-card)]"
    style={{
      background:
        'linear-gradient(to bottom, hsl(35 40% 92%) 0%, hsl(35 30% 88%) 60%, hsl(28 35% 78%) 100%)',
    }}
  >
    {/* sparkles */}
    <div className="absolute top-3 left-4 text-2xl select-none animate-pulse">✨</div>
    <div className="absolute top-4 right-6 text-xl opacity-70 select-none">🪄</div>
    <div className="px-4 pt-10 pb-4 flex items-end justify-around gap-2">
      {motivationClusters.map(c => (
        <PotionJar key={c.id} clusterId={c.id} value={scores[c.id] ?? 0} />
      ))}
    </div>
    {/* bench */}
    <div className="h-4" style={{ background: 'linear-gradient(to bottom, hsl(var(--sand-warm)), hsl(var(--sage) / 0.55))' }} />
  </div>
);

// 5-droplet rating (reused style from VIA)
const WaterRating = ({
  value,
  onChange,
  color,
}: {
  value: number;
  onChange: (v: number) => void;
  color: string;
}) => (
  <div className="flex gap-2 justify-center items-center" dir="ltr">
    {SCALE.map(v => {
      const active = value >= v;
      return (
        <motion.button
          key={v}
          onClick={() => onChange(v)}
          whileTap={{ scale: 0.85 }}
          whileHover={{ y: -2 }}
          aria-label={`${v} מתוך 5 — ${scaleLabels[v]}`}
          title={scaleLabels[v]}
          className={`relative w-11 h-12 md:w-12 md:h-14 rounded-b-full rounded-t-[40%] border-2 transition-all duration-300 flex items-end justify-center pb-1 text-sm font-bold ${
            active
              ? 'border-foreground/15 text-primary-foreground shadow-md scale-105'
              : 'border-foreground/15 bg-card text-foreground/40 hover:border-accent/60'
          }`}
          style={
            active
              ? {
                  background: `linear-gradient(to bottom, ${color}55 0%, ${color} 70%, ${color} 100%)`,
                  boxShadow: `0 4px 14px ${color}55`,
                }
              : undefined
          }
        >
          <span className="absolute top-1.5 right-2.5 w-1.5 h-1.5 rounded-full bg-white/70" />
          {v}
        </motion.button>
      );
    })}
  </div>
);

// Intention seedling — grows with average rating
const SeedlingTray = ({ answers }: { answers: IntentionAnswers }) => {
  const total = intentionStatements.length;
  const answered = Object.keys(answers).length;
  const values = Object.values(answers);
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const t = Math.max(0, Math.min(1, avg / 5));
  const stemH = 20 + t * 70;
  const bloomScale = 0.6 + t * 0.8;

  return (
    <div
      className="relative rounded-3xl overflow-hidden border border-border/60 shadow-[var(--shadow-card)]"
      style={{
        background:
          'linear-gradient(to bottom, hsl(200 70% 90%) 0%, hsl(200 60% 95%) 55%, hsl(40 30% 88%) 56%, hsl(28 35% 78%) 100%)',
      }}
    >
      <div className="absolute top-3 left-4 text-2xl select-none animate-pulse">☀️</div>
      <div className="px-4 pt-10 pb-4 flex items-end justify-center gap-3">
        {Array.from({ length: total }).map((_, i) => {
          const id = intentionStatements[i].id;
          const v = answers[id] ?? 0;
          const localT = v / 5;
          return (
            <div key={id} className="flex flex-col items-center gap-1">
              <motion.div
                animate={{ scale: bloomScale * (0.7 + localT * 0.5) }}
                transition={{ type: 'spring', stiffness: 200, damping: 16 }}
                className="text-xl select-none"
                style={{
                  opacity: v === 0 ? 0.3 : 0.7 + localT * 0.3,
                  filter: v === 0 ? 'grayscale(0.7)' : 'drop-shadow(0 2px 4px hsl(var(--sage) / 0.4))',
                }}
              >
                {v >= 4 ? '🌸' : v >= 2 ? '🌱' : '·'}
              </motion.div>
              <motion.div
                animate={{ height: 12 + localT * stemH * 0.5 }}
                transition={{ type: 'spring', stiffness: 180, damping: 18 }}
                className="w-[2px] rounded-full"
                style={{ background: 'hsl(var(--sage))' }}
              />
            </div>
          );
        })}
      </div>
      <div className="h-4" style={{ background: 'linear-gradient(to bottom, hsl(var(--sand-warm)), hsl(var(--sage) / 0.55))' }} />
      <div className="absolute bottom-5 left-0 right-0 text-center text-xs text-foreground/70 font-medium">
        {answered}/{total} זרעי כוונה
      </div>
    </div>
  );
};

type Part = 'A' | 'B';

const MotivationMixer = ({ onComplete, onBackToHub }: Props) => {
  const [part, setPart] = useState<Part>('A');
  const [scores, setScores] = useState<MotivationScores>({});
  const [intentions, setIntentions] = useState<IntentionAnswers>({});

  const partAComplete = Object.keys(scores).length >= motivationClusters.length;
  const intentionAnswered = Object.keys(intentions).length;
  const partBComplete = intentionAnswered >= intentionStatements.length;
  const allComplete = partAComplete && partBComplete;

  const totalDone = Object.keys(scores).length + intentionAnswered;
  const totalQ = motivationClusters.length + intentionStatements.length;

  const setPartScroll = (p: Part) => {
    setPart(p);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const encouragement = useMemo(() => {
    if (part === 'A') {
      const c = Object.keys(scores).length;
      if (c === 0) return null;
      if (c < motivationClusters.length) return 'יופי — כל מנה במיקסר מגלה לי קצת ממה שמניע אתכם 🌿';
      return 'מצוין! חלק א׳ מוכן. בואו נוסיף את הכוונות ✦';
    }
    if (intentionAnswered === 0) return null;
    if (intentionAnswered < 5) return 'ענו בכנות — אין תשובות נכונות או לא נכונות 🪶';
    if (!partBComplete) return 'כמעט שם! עוד כמה זרעים ✨';
    return 'מעולה! סיימתם — סגי כבר מעבד את התובנות 🦉';
  }, [part, scores, intentionAnswered, partBComplete]);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <QuestProgressBadge current={totalDone} total={totalQ} label="מניעים" icon="🔥" />
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            🧪 המיקסר של המניעים
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">
            {part === 'A' ? 'מערבבים את התמהיל שמניע אתכם' : 'נוטעים את זרעי הכוונה'}
          </h2>
          <p className="text-muted-foreground text-lg">
            {part === 'A'
              ? 'יש לפניכם ארבע צנצנות. כל טיפה שתוסיפו לצנצנת תגלה כמה אותו מניע חזק אצלכם.'
              : 'כל אמירה היא זרע. דרגו את מידת ההסכמה — והזרע יצמח בהתאם.'}
          </p>
        </div>

        {/* Live visual */}
        {part === 'A' ? <MixerBench scores={scores} /> : <SeedlingTray answers={intentions} />}

        {/* Part tabs */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setPartScroll('A')}
            className={`px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 min-h-[48px] ${
              part === 'A'
                ? 'bg-primary text-primary-foreground shadow-[var(--shadow-card)]'
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            א׳ — תמהיל המניעים
          </button>
          <button
            onClick={() => partAComplete && setPartScroll('B')}
            disabled={!partAComplete}
            className={`px-5 py-2.5 rounded-xl font-display font-semibold text-sm transition-all duration-300 min-h-[48px] ${
              part === 'B'
                ? 'bg-primary text-primary-foreground shadow-[var(--shadow-card)]'
                : partAComplete
                  ? 'bg-muted/50 text-muted-foreground hover:bg-muted cursor-pointer'
                  : 'bg-muted/30 text-muted-foreground/40 cursor-not-allowed'
            }`}
          >
            ב׳ — זרעי הכוונה
          </button>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-base text-muted-foreground">
            <span>
              {part === 'A'
                ? `${Object.keys(scores).length} / ${motivationClusters.length} צנצנות`
                : `${intentionAnswered} / ${intentionStatements.length} זרעים`}
            </span>
            <span>{totalDone} / {totalQ} סך הכול</span>
          </div>
          <div className="w-full h-2.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-coral via-sunny to-success rounded-full progress-bar-fill transition-all duration-700"
              style={{ width: `${(totalDone / totalQ) * 100}%` }}
            />
          </div>
        </div>

        <AnswerKeyReminder items={answerKey} />

        {encouragement && <OwlMessage message={encouragement} variant="encouragement" />}

        <AnimatePresence mode="wait">
          {part === 'A' ? (
            <motion.div
              key="partA"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-5"
            >
              {motivationClusters.map((cluster, idx) => {
                const style = CLUSTER_STYLE[cluster.id] ?? CLUSTER_STYLE.psychological;
                return (
                  <motion.div
                    key={cluster.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.06, 0.3) }}
                    className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 relative overflow-hidden"
                  >
                    <div
                      className="absolute -top-10 -left-10 w-32 h-32 rounded-full opacity-40 blur-2xl pointer-events-none"
                      style={{ background: style.color }}
                    />
                    <div className="flex items-start gap-4 mb-4 relative">
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0 border-2"
                        style={{ background: style.soft, borderColor: `${style.color}40` }}
                        aria-hidden
                      >
                        {style.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold font-display text-foreground text-base mb-1">{cluster.title}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">{cluster.description}</p>
                      </div>
                    </div>
                    <WaterRating
                      value={scores[cluster.id] || 0}
                      onChange={v => setScores(s => ({ ...s, [cluster.id]: v }))}
                      color={style.color}
                    />
                  </motion.div>
                );
              })}

              <QuestionnaireNav
                showPrev={false}
                showNext
                showComplete={false}
                nextDisabled={!partAComplete}
                onNext={() => setPartScroll('B')}
                completeLabel=""
                onBackToHub={onBackToHub}
              />
            </motion.div>
          ) : (
            <motion.div
              key="partB"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-4"
            >
              {intentionStatements.map((stmt, idx) => {
                const v = intentions[stmt.id] || 0;
                return (
                  <motion.div
                    key={stmt.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                    className="bg-card rounded-3xl p-5 md:p-6 shadow-[var(--shadow-card)] border border-border/60 relative overflow-hidden"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 border-2"
                        style={{ background: 'hsl(var(--sage-light))', borderColor: 'hsl(var(--sage) / 0.4)' }}
                        aria-hidden
                      >
                        {v >= 4 ? '🌸' : v >= 2 ? '🌱' : '🌰'}
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-muted-foreground/70 mb-1">זרע #{stmt.id}</div>
                        <p className="text-lg font-medium text-foreground leading-relaxed">{stmt.text}</p>
                      </div>
                    </div>
                    <WaterRating
                      value={v}
                      onChange={val => setIntentions(s => ({ ...s, [stmt.id]: val }))}
                      color="hsl(var(--sage))"
                    />
                  </motion.div>
                );
              })}

              <QuestionnaireNav
                showPrev
                showComplete
                onPrev={() => setPartScroll('A')}
                onComplete={() => {
                  burstConfetti();
                  onComplete(scores, intentions);
                }}
                completeDisabled={!allComplete}
                completeLabel="סיום שאלון מניעים"
                onBackToHub={onBackToHub}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MotivationMixer;
