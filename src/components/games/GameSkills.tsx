import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell from './GameShell';
import { skills, type SkillColumn } from '@/data/skillsData';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (assignments: Record<number, SkillColumn>) => void;
  onBackToHub?: () => void;
}

// Owl Forest column tints — each uses a semantic token tied to the palette
const COLUMNS: { id: SkillColumn; label: string; emoji: string; bg: string; shadow: string }[] = [
  { id: 'winner',     label: 'ארגז מנצח',   emoji: '🏆', bg: 'bg-accent',      shadow: 'hsl(var(--accent) / 0.55)' },
  { id: 'burnout',    label: 'מיציתי',       emoji: '🔥', bg: 'bg-destructive', shadow: 'hsl(var(--destructive) / 0.5)' },
  { id: 'aspire',     label: 'רוצה ללמוד',   emoji: '🌱', bg: 'bg-sage',        shadow: 'hsl(var(--sage) / 0.55)' },
  { id: 'irrelevant', label: 'לא רלוונטי',   emoji: '💤', bg: 'bg-secondary',   shadow: 'hsl(var(--foreground) / 0.18)' },
];

const GameSkills = ({ onComplete, onBackToHub }: Props) => {
  const [assignments, setAssignments] = useState<Record<number, SkillColumn>>({});
  const [index, setIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const total = skills.length;
  const current = skills[index];
  const winnerCount = Object.values(assignments).filter((v) => v === 'winner').length;

  const assign = (col: SkillColumn) => {
    if (!current) return;
    if (col === 'winner' && winnerCount >= 7) {
      setError('עד 7 כישורים בארגז המנצח');
      setTimeout(() => setError(null), 1800);
      return;
    }
    setError(null);
    const next = { ...assignments, [current.id]: col };
    setAssignments(next);
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      const winners = Object.values(next).filter((v) => v === 'winner').length;
      if (winners < 5) {
        setError(`בחרו לפחות 5 לארגז המנצח (כרגע ${winners})`);
        return;
      }
      burstConfetti();
      onComplete(next);
    }
  };

  const goBack = () => {
    if (index === 0) return;
    setIndex(index - 1);
    setError(null);
  };

  return (
    <GameShell
      title="ארגז הכלים"
      subtitle="מיינו כל כישור לאחת מ-4 הקבוצות"
      step={index + 1}
      total={total}
      onBack={onBackToHub}
    >
      <div className="flex-1 flex flex-col px-4 pb-6 max-w-3xl mx-auto w-full">
        <div className="flex-1 flex items-center justify-center relative min-h-[220px] py-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? 'done'}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md bg-card border-2 border-foreground/15 rounded-3xl p-7 text-center"
              style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.18)' }}
            >
              <div className="text-xs tracking-widest text-foreground/60 mb-3">כישור {index + 1}</div>
              <p className="text-xl md:text-2xl font-serif leading-relaxed text-foreground">{current?.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-center text-sm bg-accent text-foreground rounded-xl py-2.5 px-3 font-bold border-2 border-foreground/20"
            style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.20)' }}
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          {COLUMNS.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.94, y: 4 }}
              onClick={() => assign(c.id)}
              style={{ boxShadow: `0 6px 0 0 ${c.shadow}`, minHeight: 88 }}
              className={`rounded-2xl p-3 ${c.bg} text-foreground font-bold border-2 border-foreground/20 flex flex-col items-center justify-center gap-1 transition-transform active:translate-y-1`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-sm">{c.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs text-foreground/70">
          <button
            onClick={goBack}
            disabled={index === 0}
            className="px-3 py-2 rounded-xl bg-card border-2 border-foreground/15 font-bold disabled:opacity-30"
            style={{ boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.18)' }}
          >
            → קודם
          </button>
          <span className="font-bold">בארגז המנצח: {winnerCount} (5–7)</span>
        </div>
      </div>
    </GameShell>
  );
};

export default GameSkills;
