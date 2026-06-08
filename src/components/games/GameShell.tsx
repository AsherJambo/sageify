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

const GameShell = ({ title, subtitle, step, total, bg, onBack, children }: GameShellProps) => {
  const pct = step !== undefined && total ? Math.min(100, (step / total) * 100) : 0;
  return (
    <div
      dir="rtl"
      className={`min-h-screen flex flex-col text-white ${bg ?? 'bg-gradient-to-b from-[#0b0f1f] via-[#1a1f3a] to-[#0b0f1f]'}`}
    >
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        {onBack && (
          <button
            onClick={onBack}
            aria-label="חזרה למרכז המשחקים"
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur transition-colors border border-white/15"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-display font-bold leading-tight truncate">{title}</h1>
          {subtitle && <p className="text-xs opacity-70 truncate">{subtitle}</p>}
        </div>
        {step !== undefined && total && (
          <span className="text-xs font-bold tabular-nums px-2.5 py-1 rounded-full bg-white/10 border border-white/15">
            {step}/{total}
          </span>
        )}
      </header>

      {step !== undefined && total && (
        <div className="h-1 bg-white/10 mx-4 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-l from-fuchsia-400 via-pink-400 to-amber-300"
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      <main className="flex-1 flex flex-col">{children}</main>
    </div>
  );
};

export default GameShell;
