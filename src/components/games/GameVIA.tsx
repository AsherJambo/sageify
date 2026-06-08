import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GameShell from './GameShell';
import { viaQuestions, viaCategories, type VIACategory } from '@/data/viaQuestions';
import { applyBonus } from '@/lib/scoring';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (finalAnswers: Record<number, number>, bonusIds: number[]) => void;
  onBackToHub?: () => void;
}

const CORE_COLORS: Record<VIACategory, string> = {
  'מיקוד בטוב/נשגבות': 'from-amber-400 to-orange-500',
  'אנושיות': 'from-rose-400 to-pink-500',
  'חכמה וידע': 'from-sky-400 to-cyan-500',
  'אומץ לב': 'from-red-500 to-rose-600',
  'חוש צדק': 'from-emerald-400 to-teal-500',
  'מתינות וריסון': 'from-violet-400 to-fuchsia-500',
};

const TARGET = 3;

const GameVIA = ({ onComplete, onBackToHub }: Props) => {
  const [picked, setPicked] = useState<VIACategory[]>([]);
  const [pulse, setPulse] = useState(0);

  const cores = useMemo(
    () =>
      viaCategories.map((c, i) => ({
        name: c,
        color: CORE_COLORS[c],
        x: ((i * 41) % 70) + 15,
        y: ((i * 27) % 50) + 12,
        delay: (i * 0.07) % 0.6,
      })),
    [],
  );

  const toggle = (name: VIACategory) => {
    if (picked.includes(name)) {
      setPicked(picked.filter((n) => n !== name));
      return;
    }
    if (picked.length >= TARGET) return;
    setPulse((p) => p + 1);
    const next = [...picked, name];
    setPicked(next);
    if (next.length === TARGET) {
      setTimeout(() => finish(next), 800);
    }
  };

  const finish = (selected: VIACategory[]) => {
    // Synthesize Likert: questions in picked categories => 5, otherwise => 3
    const answers: Record<number, number> = {};
    viaQuestions.forEach((q) => {
      answers[q.id] = selected.includes(q.category as VIACategory) ? 5 : 3;
    });
    // Bonus: 3 questions — one from each picked category (lowest id for stability)
    const bonusIds: number[] = [];
    selected.forEach((cat) => {
      const q = viaQuestions.find((x) => x.category === cat);
      if (q) bonusIds.push(q.id);
    });
    const finalAnswers = applyBonus(answers, bonusIds);
    burstConfetti();
    onComplete(finalAnswers, bonusIds);
  };

  return (
    <GameShell
      title="ליבת החוזקות"
      subtitle="הקישו על 3 עולמות שמדליקים אתכם"
      step={picked.length}
      total={TARGET}
      bg="bg-gradient-to-b from-[#0b0420] via-[#120833] to-[#05010f]"
      onBack={onBackToHub}
    >
      <div className="relative flex-1 overflow-hidden">
        {/* Central Core */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{
              scale: [1, 1.08, 1],
              boxShadow: [
                '0 0 60px 10px rgba(168,85,247,0.35)',
                '0 0 90px 20px rgba(236,72,153,0.55)',
                '0 0 60px 10px rgba(168,85,247,0.35)',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-36 h-36 rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-indigo-600 flex items-center justify-center"
          >
            <div className="w-28 h-28 rounded-full bg-black/40 backdrop-blur flex flex-col items-center justify-center text-center">
              <div className="text-4xl font-bold tabular-nums">{picked.length}</div>
              <div className="text-[10px] tracking-[0.25em] opacity-70">/ {TARGET}</div>
            </div>
          </motion.div>
          <AnimatePresence>
            {pulse > 0 && (
              <motion.div
                key={pulse}
                initial={{ scale: 0.4, opacity: 0.6 }}
                animate={{ scale: 2.6, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.9 }}
                className="absolute inset-0 rounded-full border-2 border-fuchsia-400/60 pointer-events-none"
              />
            )}
          </AnimatePresence>
        </div>

        {/* Floating category bubbles */}
        <div className="relative w-full h-[560px]">
          {cores.map((it) => {
            const isPicked = picked.includes(it.name);
            return (
              <motion.button
                key={it.name}
                onClick={() => toggle(it.name)}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{
                  opacity: 1,
                  scale: isPicked ? 1.1 : 1,
                  y: [0, -10, 0],
                }}
                transition={{
                  opacity: { duration: 0.4 },
                  scale: { duration: 0.4 },
                  y: { duration: 3 + it.delay * 4, repeat: Infinity, delay: it.delay },
                }}
                whileTap={{ scale: 0.92 }}
                style={{ left: `${it.x}%`, top: `${it.y}%` }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-4 py-3 min-h-[52px] rounded-2xl text-sm font-bold text-white bg-gradient-to-br ${it.color} shadow-xl border-2 transition-all ${
                  isPicked ? 'border-white ring-4 ring-white/40' : 'border-white/20'
                }`}
              >
                {it.name}
                {isPicked && <span className="block text-[10px] opacity-90 mt-0.5">✓ נבחר</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};

export default GameVIA;
