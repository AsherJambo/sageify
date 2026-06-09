import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

interface GameShellProps {
  title: string;
  subtitle?: string;
  step?: number;
  total?: number;
  bg?: string;
  onBack?: () => void;
  children: ReactNode;
}

/**
 * GameShell — Owl Forest playful shell.
 * Cream canvas, forest ink, amber progress, chunky pill buttons.
 */
const GameShell = ({ title, subtitle, step, total, bg, onBack, children }: GameShellProps) => {
  const pct = step !== undefined && total ? Math.min(100, (step / total) * 100) : 0;
  return (
    <div
      dir="rtl"
      className={`min-h-screen flex flex-col text-foreground ${bg ?? 'bg-background'}`}
    >
      {/* Cozy ambient blobs (only when default bg) */}
      {!bg && (
        <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-sage/25 blur-3xl" />
        </div>
      )}

      <header className="px-4 pt-5 pb-3 flex items-center gap-3 max-w-3xl mx-auto w-full">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="חזרה למרכז המשחקים"
            className="p-3 rounded-2xl bg-card border-2 border-foreground/15 text-foreground transition-all hover:-translate-y-0.5 active:translate-y-0.5"
            style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.18)', minHeight: 48, minWidth: 48 }}
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-xl md:text-2xl font-serif leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-sm text-foreground/65 truncate mt-0.5">{subtitle}</p>}
        </div>
        {step !== undefined && total && (
          <span
            className="text-sm font-bold tabular-nums px-3.5 py-1.5 rounded-full bg-accent text-foreground border-2 border-foreground/15"
            style={{ boxShadow: '0 3px 0 0 hsl(var(--foreground) / 0.20)' }}
          >
            {step}/{total}
          </span>
        )}
      </header>

      {step !== undefined && total && (
        <div className="h-3 bg-secondary mx-4 rounded-full overflow-hidden border-2 border-foreground/10 max-w-3xl md:mx-auto md:w-full">
          <motion.div
            className="h-full bg-gradient-to-l from-[hsl(var(--accent))] via-[hsl(var(--accent))] to-[hsl(var(--destructive))] rounded-full"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

export default GameShell;
