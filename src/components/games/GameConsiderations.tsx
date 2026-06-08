import { useState } from 'react';
import { motion } from 'framer-motion';
import GameShell from './GameShell';
import { considerations } from '@/data/considerationsData';
import { burstConfetti } from '@/lib/confetti';

interface Props {
  onComplete: (selected: string[], points: Record<string, number>) => void;
  onBackToHub?: () => void;
}

const BUDGET = 100;
const STEP = 5;

const GameConsiderations = ({ onComplete, onBackToHub }: Props) => {
  const [points, setPoints] = useState<Record<string, number>>({});

  const used = Object.values(points).reduce((s, n) => s + n, 0);
  const remaining = BUDGET - used;
  const selected = Object.keys(points).filter((k) => points[k] > 0);

  const adjust = (name: string, delta: number) => {
    const current = points[name] || 0;
    const next = Math.max(0, current + delta);
    const diff = next - current;
    if (diff > remaining) return;
    const updated = { ...points, [name]: next };
    if (next === 0) delete updated[name];
    setPoints(updated);
  };

  const canFinish = used === BUDGET && selected.length >= 3;

  const finish = () => {
    if (!canFinish) return;
    burstConfetti();
    onComplete(selected, points);
  };

  return (
    <GameShell
      title="מאזן האנרגיה"
      subtitle="חלקו 100 נקודות בין השיקולים החשובים לכם"
      bg="bg-gradient-to-b from-[#1a0b2e] via-[#2a0f47] to-[#0b0420]"
      onBack={onBackToHub}
    >
      {/* Budget bar */}
      <div className="px-4 pt-3 pb-2 sticky top-0 z-20 bg-gradient-to-b from-[#1a0b2e] to-[#1a0b2e]/85 backdrop-blur">
        <div className="bg-white/10 border border-white/20 rounded-2xl p-3">
          <div className="flex justify-between text-xs mb-2 font-bold">
            <span>נשארו: {remaining}</span>
            <span>נבחרו: {selected.length}</span>
            <span>תקציב: {BUDGET}</span>
          </div>
          <div className="h-3 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              animate={{ width: `${(used / BUDGET) * 100}%` }}
              className="h-full bg-gradient-to-l from-amber-300 via-pink-400 to-fuchsia-500"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {considerations.map((name) => {
          const v = points[name] || 0;
          const active = v > 0;
          return (
            <motion.div
              key={name}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl p-3 border-2 transition-colors overflow-hidden ${
                active
                  ? 'bg-gradient-to-l from-fuchsia-500/30 to-pink-500/20 border-fuchsia-400'
                  : 'bg-white/5 border-white/10'
              }`}
            >
              {active && (
                <motion.div
                  layoutId={`fill-${name}`}
                  className="absolute inset-0 bg-gradient-to-l from-fuchsia-500/40 to-pink-500/20"
                  initial={false}
                  animate={{ width: `${Math.min(100, v * 2)}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <span className="text-sm font-medium flex-1 leading-tight">{name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjust(name, -STEP)}
                    disabled={v === 0}
                    className="w-8 h-8 rounded-full bg-white/15 border border-white/20 text-lg leading-none disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    −
                  </button>
                  <span className="min-w-[28px] text-center font-bold tabular-nums text-sm">{v}</span>
                  <button
                    onClick={() => adjust(name, STEP)}
                    disabled={remaining < STEP}
                    className="w-8 h-8 rounded-full bg-amber-400 text-slate-900 font-bold text-lg leading-none disabled:opacity-30 active:scale-90 transition-transform"
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[#0b0420] to-transparent">
        <button
          onClick={finish}
          disabled={!canFinish}
          className={`w-full py-4 rounded-2xl text-base font-bold transition-all ${
            canFinish
              ? 'bg-gradient-to-l from-amber-300 to-pink-400 text-slate-900 shadow-xl'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          }`}
        >
          {canFinish ? 'סיימתי לחלק ✓' : `נשארו לחלק ${remaining} נקודות`}
        </button>
      </div>
    </GameShell>
  );
};

export default GameConsiderations;
