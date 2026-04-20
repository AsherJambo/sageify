import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface QuestProgressBadgeProps {
  /** Number of items answered so far */
  current: number;
  /** Total number of items in the quest */
  total: number;
  /** Short label, e.g. "עוגנים" / "נטיות" */
  label: string;
  /** Emoji icon */
  icon: string;
}

/**
 * Floating playful badge in the top-right of every questionnaire.
 * Shows live progress, pulses when a milestone is reached, mirrors the
 * landing page's "8 תחומים ✦" / "live" sticker vibe.
 */
const QuestProgressBadge = ({ current, total, label, icon }: QuestProgressBadgeProps) => {
  const [lastMilestone, setLastMilestone] = useState(0);
  const [pop, setPop] = useState(false);

  const pct = total === 0 ? 0 : Math.min(100, Math.round((current / total) * 100));

  // Trigger a pop animation every 25%
  useEffect(() => {
    const milestone = Math.floor(pct / 25);
    if (milestone > lastMilestone && pct > 0) {
      setLastMilestone(milestone);
      setPop(true);
      const t = setTimeout(() => setPop(false), 700);
      return () => clearTimeout(t);
    }
  }, [pct, lastMilestone]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6, y: -10, rotate: -8 }}
      animate={{ opacity: 1, scale: 1, y: 0, rotate: -4 }}
      transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 14 }}
      className="fixed top-3 left-3 md:top-5 md:left-auto md:right-6 z-40 pointer-events-none select-none"
      style={{ transform: 'rotate(-4deg)' }}
    >
      <motion.div
        animate={pop ? { scale: [1, 1.2, 1], rotate: [-4, 4, -4] } : {}}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="relative bg-card border-2 border-secondary/20 rounded-2xl shadow-[var(--shadow-elevated)] px-3 py-2 md:px-4 md:py-2.5 flex items-center gap-2"
      >
        {/* Live pulse dot */}
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-70" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
        </span>

        <span className="text-base md:text-lg leading-none">{icon}</span>

        <div className="flex flex-col leading-tight">
          <span className="text-[10px] md:text-[11px] uppercase tracking-wider text-muted-foreground font-bold font-display">
            {label}
          </span>
          <span className="text-xs md:text-sm font-bold text-foreground">
            {current} / {total}
          </span>
        </div>

        {/* Tiny rounded progress ring on the side */}
        <div className="relative w-7 h-7 md:w-8 md:h-8">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              className="stroke-muted"
              strokeWidth="3"
            />
            <motion.circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              className="stroke-success"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 15}
              initial={{ strokeDashoffset: 2 * Math.PI * 15 }}
              animate={{ strokeDashoffset: 2 * Math.PI * 15 * (1 - pct / 100) }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] md:text-[10px] font-bold text-foreground font-display">
            {pct}%
          </span>
        </div>

        {/* Sparkle when milestone hit */}
        <AnimatePresence>
          {pop && (
            <motion.span
              initial={{ opacity: 0, scale: 0, x: 10, y: -10 }}
              animate={{ opacity: 1, scale: 1.4, x: 14, y: -14 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute -top-1 -right-1 text-base md:text-lg pointer-events-none"
            >
              ✦
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default QuestProgressBadge;
