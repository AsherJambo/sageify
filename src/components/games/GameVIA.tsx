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

// Owl Forest tints — semantic tokens, warm forest palette
const CORE_TINTS: Record<VIACategory, { bg: string; ring: string; shadow: string }> = {
  'מיקוד בטוב/נשגבות': { bg: 'bg-accent', ring: 'border-accent', shadow: 'hsl(var(--accent) / 0.5)' },
  'אנושיות':           { bg: 'bg-coral-soft', ring: 'border-destructive', shadow: 'hsl(var(--destructive) / 0.4)' },
  'חכמה וידע':         { bg: 'bg-sky-soft', ring: 'border-foreground/30', shadow: 'hsl(var(--foreground) / 0.18)' },
  'אומץ לב':           { bg: 'bg-destructive', ring: 'border-foreground/30', shadow: 'hsl(var(--destructive) / 0.5)' },
  'חוש צדק':           { bg: 'bg-sage', ring: 'border-sage', shadow: 'hsl(var(--sage) / 0.5)' },
  'מתינות וריסון':     { bg: 'bg-sage-light', ring: 'border-sage', shadow: 'hsl(var(--sage) / 0.35)' },
};

const TARGET = 3;

const GameVIA = ({ onComplete, onBackToHub }: Props) => {
  const [picked, setPicked] = useState<VIACategory[]>([]);
  const [pulse, setPulse] = useState(0);

  const cores = useMemo(
    () =>
      viaCategories.map((c, i) => ({
        name: c,
        tint: CORE_TINTS[c],
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
    const answers: Record<number, number> = {};
    viaQuestions.forEach((q) => {
      answers[q.id] = selected.includes(q.category as VIACategory) ? 5 : 3;
    });
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
      onBack={onBackToHub}
    >
      <div className="relative flex-1 overflow-hidden">
        {/* Central Owl Core — chunky amber medallion */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <motion.div
            animate={{ scale: [1, 1.06, 1] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="w-36 h-36 rounded-full bg-accent border-4 border-foreground/20 flex items-center justify-center"
            style={{ boxShadow: '0 8px 0 0 hsl(var(--foreground) / 0.22)' }}
          >
            <div className="w-28 h-28 rounded-full bg-card border-2 border-foreground/15 flex flex-col items-center justify-center text-center text-foreground">
              <div className="text-4xl font-serif tabular-nums">{picked.length}</div>
              <div className="text-[10px] tracking-[0.25em] opacity-60">/ {TARGET}</div>
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
                className="absolute inset-0 rounded-full border-2 border-accent pointer-events-none"
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
                whileTap={{ scale: 0.92, y: 4 }}
                style={{
                  left: `${it.x}%`,
                  top: `${it.y}%`,
                  boxShadow: `0 6px 0 0 ${it.tint.shadow}`,
                  minHeight: 52,
                }}
                className={`absolute -translate-x-1/2 -translate-y-1/2 px-4 py-3 rounded-2xl text-sm font-bold text-foreground ${it.tint.bg} border-2 transition-all ${
                  isPicked ? 'border-foreground ring-4 ring-accent/40' : it.tint.ring
                }`}
              >
                {it.name}
                {isPicked && <span className="block text-[10px] opacity-80 mt-0.5">✓ נבחר</span>}
              </motion.button>
            );
          })}
        </div>
      </div>
    </GameShell>
  );
};

export default GameVIA;
