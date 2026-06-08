import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell from './GameShell';
import { skills, type SkillColumn } from '@/data/skillsData';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (assignments: Record<number, SkillColumn>) => void;
  onBackToHub?: () => void;
}

const COLUMNS: { id: SkillColumn; label: string; emoji: string; color: string }[] = [
  { id: 'winner', label: 'ארגז מנצח', emoji: '🏆', color: 'from-emerald-400 to-teal-500' },
  { id: 'burnout', label: 'מיציתי', emoji: '🔥', color: 'from-rose-400 to-red-500' },
  { id: 'aspire', label: 'רוצה ללמוד', emoji: '🌱', color: 'from-sky-400 to-cyan-500' },
  { id: 'irrelevant', label: 'לא רלוונטי', emoji: '💤', color: 'from-slate-400 to-slate-500' },
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
        // jump back to first unassigned-winner candidate; allow user to re-pick
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
      bg="bg-gradient-to-b from-[#062b1c] via-[#0e4b35] to-[#03110a]"
      onBack={onBackToHub}
    >
      <div className="flex-1 flex flex-col px-4 pb-6">
        <div className="flex-1 flex items-center justify-center relative min-h-[220px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={current?.id ?? 'done'}
              initial={{ opacity: 0, y: 30, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.9 }}
              transition={{ duration: 0.35 }}
              className="w-full max-w-md bg-white/10 backdrop-blur border border-white/20 rounded-3xl p-7 text-center shadow-2xl"
            >
              <div className="text-xs tracking-widest opacity-60 mb-3">כישור {index + 1}</div>
              <p className="text-xl md:text-2xl font-bold leading-relaxed">{current?.text}</p>
            </motion.div>
          </AnimatePresence>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-3 text-center text-sm bg-amber-400 text-slate-900 rounded-lg py-2 px-3 font-bold"
          >
            {error}
          </motion.div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-3">
          {COLUMNS.map((c) => (
            <motion.button
              key={c.id}
              whileTap={{ scale: 0.94 }}
              onClick={() => assign(c.id)}
              className={`min-h-[80px] rounded-2xl p-3 bg-gradient-to-br ${c.color} text-white font-bold shadow-lg border-2 border-white/20 flex flex-col items-center justify-center gap-1`}
            >
              <span className="text-2xl">{c.emoji}</span>
              <span className="text-sm">{c.label}</span>
            </motion.button>
          ))}
        </div>

        <div className="flex justify-between items-center text-xs opacity-80">
          <button onClick={goBack} disabled={index === 0} className="px-3 py-1.5 rounded-lg bg-white/10 disabled:opacity-30">
            → קודם
          </button>
          <span>בארגז המנצח: {winnerCount} (5–7)</span>
        </div>
      </div>
    </GameShell>
  );
};

export default GameSkills;
