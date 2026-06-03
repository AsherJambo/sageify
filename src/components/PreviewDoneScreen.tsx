import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { burstConfetti } from '@/lib/confetti';
import { getNextGame } from '@/lib/previewGames';

interface Props {
  title: string;
  emoji?: string;
  summary?: string;
  /** game id to suggest the next game */
  gameId?: string;
  children?: React.ReactNode;
}

const PreviewDoneScreen = ({ title, emoji = '✨', summary, gameId, children }: Props) => {
  useEffect(() => {
    burstConfetti();
  }, []);
  const next = gameId ? getNextGame(gameId) : null;

  return (
    <div dir="rtl" className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl w-full text-center bg-card rounded-3xl shadow-2xl p-10 border border-border/60"
      >
        <p className="text-xs font-semibold tracking-widest text-success uppercase mb-3">
          ✓ סבב הושלם
        </p>
        <motion.div
          initial={{ scale: 0.5, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 12, delay: 0.1 }}
          className="text-7xl mb-5"
        >
          {emoji}
        </motion.div>
        <h1 className="font-display text-3xl font-bold text-foreground mb-3">{title}</h1>
        {summary && <p className="text-lg text-muted-foreground mb-6 leading-relaxed">{summary}</p>}
        {children && <div className="mb-6">{children}</div>}

        <div className="flex flex-col gap-3">
          {next && (
            <Link
              to={next.path}
              className="px-6 py-4 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition shadow-lg inline-flex items-center justify-center gap-2"
            >
              <span className="text-xl">{next.emoji}</span>
              המשחק הבא — {next.title}
              <span aria-hidden>←</span>
            </Link>
          )}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/preview"
              className="px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium hover:opacity-90 transition shadow-md"
            >
              חזרה למרכז המשחקים
            </Link>
            <Link
              to="/"
              className="px-6 py-3 rounded-full border border-border bg-card text-foreground hover:bg-muted transition"
            >
              לדף הבית
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PreviewDoneScreen;
