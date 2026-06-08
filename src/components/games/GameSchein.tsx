import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell from './GameShell';
import { scheinQuestions, scheinCategories, type ScheinCategory } from '@/data/scheinQuestions';
import { applyBonus } from '@/lib/scoring';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (finalAnswers: Record<number, number>, bonusIds: number[]) => void;
  onBackToHub?: () => void;
}

const ANCHOR_EMOJI: Record<ScheinCategory, string> = {
  'מומחיות': '🎓',
  'ניהול': '🎯',
  'אוטונומיה': '🕊️',
  'בטחון ויציבות': '🛡️',
  'יצירתיות יזמית': '💡',
  'שליחות': '❤️',
  'אתגר': '⚡',
  'סגנון חיים': '🌿',
};

const TARGET = 3;

const GameSchein = ({ onComplete, onBackToHub }: Props) => {
  const [picked, setPicked] = useState<ScheinCategory[]>([]);
  const [sinking, setSinking] = useState<ScheinCategory | null>(null);

  const remaining = scheinCategories.filter(
    (c) => !picked.includes(c) && sinking !== c,
  );

  const sink = (c: ScheinCategory) => {
    setSinking(c);
    setTimeout(() => setSinking(null), 600);
  };

  const keep = (c: ScheinCategory) => {
    if (picked.length >= TARGET) return;
    const next = [...picked, c];
    setPicked(next);
    if (next.length === TARGET) {
      setTimeout(() => finish(next), 700);
    }
  };

  const finish = (selected: ScheinCategory[]) => {
    const answers: Record<number, number> = {};
    scheinQuestions.forEach((q) => {
      answers[q.id] = selected.includes(q.category as ScheinCategory) ? 5 : 3;
    });
    const bonusIds: number[] = [];
    selected.forEach((cat) => {
      const q = scheinQuestions.find((x) => x.category === cat);
      if (q) bonusIds.push(q.id);
    });
    const finalAnswers = applyBonus(answers, bonusIds);
    burstConfetti();
    onComplete(finalAnswers, bonusIds);
  };

  return (
    <GameShell
      title="עוגני הקריירה"
      subtitle="השאירו את 3 העוגנים שהכי מעגנים אתכם"
      step={picked.length}
      total={TARGET}
      bg="bg-gradient-to-b from-[#0a1f33] via-[#0f3457] to-[#020816]"
      onBack={onBackToHub}
    >
      <div className="px-4 py-6 flex-1 flex flex-col">
        {/* Kept anchors */}
        <div className="mb-6">
          <p className="text-[11px] tracking-widest opacity-60 mb-2 text-center">העוגנים שלכם</p>
          <div className="flex gap-2 justify-center min-h-[60px]">
            {picked.length === 0 && (
              <span className="text-xs opacity-50 self-center">בחרו 3 שמדברים אליכם</span>
            )}
            {picked.map((p) => (
              <motion.div
                key={p}
                initial={{ scale: 0.4, y: -20 }}
                animate={{ scale: 1, y: 0 }}
                className="px-3 py-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-400 text-slate-900 text-xs font-bold shadow-lg flex items-center gap-1.5"
              >
                <span>{ANCHOR_EMOJI[p]}</span>
                <span>{p}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating anchors */}
        <div className="flex-1 grid grid-cols-2 gap-3 content-start">
          <AnimatePresence>
            {remaining.map((c) => (
              <motion.div
                key={c}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  y: sinking === c ? 600 : [0, -4, 0],
                  rotate: sinking === c ? 25 : 0,
                }}
                exit={{ opacity: 0, y: 400, transition: { duration: 0.5 } }}
                transition={
                  sinking === c
                    ? { duration: 0.6, ease: 'easeIn' }
                    : { y: { duration: 4, repeat: Infinity }, opacity: { duration: 0.4 } }
                }
                className="relative bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-4 flex flex-col items-center gap-3 min-h-[140px]"
              >
                <div className="text-3xl">{ANCHOR_EMOJI[c]}</div>
                <div className="text-sm font-bold text-center leading-tight">{c}</div>
                <div className="flex gap-2 w-full">
                  <button
                    onClick={() => sink(c)}
                    className="flex-1 text-[11px] py-1.5 rounded-lg bg-white/10 hover:bg-rose-500/30 border border-white/15 transition-colors"
                  >
                    שחרר ↓
                  </button>
                  <button
                    onClick={() => keep(c)}
                    className="flex-1 text-[11px] py-1.5 rounded-lg bg-amber-400 text-slate-900 font-bold hover:bg-amber-300 transition-colors"
                  >
                    שמור ★
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </GameShell>
  );
};

export default GameSchein;
