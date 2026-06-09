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
      onBack={onBackToHub}
    >
      {/* Budget bar */}
      <div className="px-4 pt-3 pb-2 sticky top-0 z-20 bg-background/85 backdrop-blur">
        <div className="bg-card border-2 border-foreground/15 rounded-2xl p-3 max-w-3xl mx-auto"
             style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.15)' }}>
          <div className="flex justify-between text-xs mb-2 font-bold text-foreground">
            <span>נשארו: {remaining}</span>
            <span>נבחרו: {selected.length}</span>
            <span>תקציב: {BUDGET}</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden border-2 border-foreground/10">
            <motion.div
              animate={{ width: `${(used / BUDGET) * 100}%` }}
              className="h-full bg-gradient-to-l from-[hsl(var(--accent))] to-[hsl(var(--destructive))]"
            />
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-3xl mx-auto w-full">
        {considerations.map((name) => {
          const v = points[name] || 0;
          const active = v > 0;
          return (
            <motion.div
              key={name}
              whileTap={{ scale: 0.98 }}
              className={`relative rounded-2xl p-3 border-2 transition-colors overflow-hidden ${
                active
                  ? 'bg-accent/20 border-accent'
                  : 'bg-card border-foreground/15'
              }`}
              style={{ boxShadow: active ? '0 4px 0 0 hsl(var(--accent) / 0.4)' : '0 3px 0 0 hsl(var(--foreground) / 0.12)' }}
            >
              {active && (
                <motion.div
                  layoutId={`fill-${name}`}
                  className="absolute inset-0 bg-accent/25"
                  initial={false}
                  animate={{ width: `${Math.min(100, v * 2)}%` }}
                />
              )}
              <div className="relative flex items-center justify-between gap-2">
                <span className="text-sm font-bold flex-1 leading-tight text-foreground">{name}</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => adjust(name, -STEP)}
                    disabled={v === 0}
                    className="w-9 h-9 rounded-full bg-secondary border-2 border-foreground/15 text-foreground text-lg leading-none disabled:opacity-30 active:translate-y-0.5 transition-transform font-bold"
                    style={{ boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.18)' }}
                  >
                    −
                  </button>
                  <span className="min-w-[28px] text-center font-bold tabular-nums text-sm text-foreground">{v}</span>
                  <button
                    onClick={() => adjust(name, STEP)}
                    disabled={remaining < STEP}
                    className="w-9 h-9 rounded-full bg-accent text-foreground border-2 border-foreground/20 font-bold text-lg leading-none disabled:opacity-30 active:translate-y-0.5 transition-transform"
                    style={{ boxShadow: '0 2px 0 0 hsl(var(--foreground) / 0.25)' }}
                  >
                    +
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="sticky bottom-0 p-4 bg-gradient-to-t from-background via-background/95 to-transparent">
        <div className="max-w-3xl mx-auto">
          <button
            onClick={finish}
            disabled={!canFinish}
            className={`w-full py-4 rounded-2xl text-base font-bold transition-all border-2 active:translate-y-1 ${
              canFinish
                ? 'bg-destructive text-destructive-foreground border-foreground/25'
                : 'bg-secondary text-foreground/40 border-foreground/10 cursor-not-allowed'
            }`}
            style={canFinish ? { boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.25)' } : undefined}
          >
            {canFinish ? 'סיימתי לחלק ✓' : `נשארו לחלק ${remaining} נקודות`}
          </button>
        </div>
      </div>
    </GameShell>
  );
};

export default GameConsiderations;
