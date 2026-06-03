import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import type { PreviewGame } from '@/lib/previewGames';

interface Props {
  game: PreviewGame;
  onStart: () => void;
}

const accentBg: Record<PreviewGame['accent'], string> = {
  sky: 'bg-sky text-white',
  sunny: 'bg-sunny text-foreground',
  secondary: 'bg-secondary text-secondary-foreground',
  success: 'bg-success text-white',
  coral: 'bg-coral text-white',
  primary: 'bg-primary text-primary-foreground',
};

const accentChip: Record<PreviewGame['accent'], string> = {
  sky: 'bg-sky/15 text-sky',
  sunny: 'bg-sunny/20 text-foreground',
  secondary: 'bg-secondary/15 text-secondary',
  success: 'bg-success/15 text-success',
  coral: 'bg-coral/15 text-coral',
  primary: 'bg-primary/15 text-primary',
};

const PreviewIntroScreen = ({ game, onStart }: Props) => {
  return (
    <div dir="rtl" className={`min-h-screen bg-gradient-to-br ${game.tone} flex items-center justify-center p-5`}>
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-xl w-full bg-card/95 backdrop-blur rounded-3xl shadow-2xl border border-border/60 p-8 md:p-10 text-center"
      >
        {/* Round badges */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className={`text-xs font-semibold px-3 py-1 rounded-full ${accentChip[game.accent]}`}>
            משחק #{String(['holland','via','schein','motivation','thinking','skills','considerations','preferences'].indexOf(game.id)+1).padStart(2,'0')}
          </span>
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
            ⏱ {game.minutes}
          </span>
        </div>

        <motion.div
          initial={{ scale: 0.6, rotate: -8 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 220, damping: 14 }}
          className="text-7xl md:text-8xl mb-4"
        >
          {game.emoji}
        </motion.div>

        <p className="text-sm font-medium tracking-widest text-muted-foreground uppercase mb-2">
          {game.style}
        </p>
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
          {game.title}
        </h1>
        <p className="text-lg text-foreground/80 leading-relaxed mb-7 max-w-md mx-auto">
          {game.pitch}
        </p>

        {/* Rules */}
        <div className="grid sm:grid-cols-3 gap-3 mb-8 text-right">
          {game.rules.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              className="bg-background/70 rounded-xl p-3 border border-border/40 flex items-start gap-2"
            >
              <span className={`flex-shrink-0 w-6 h-6 rounded-full ${accentChip[game.accent]} text-xs font-bold flex items-center justify-center`}>
                {i + 1}
              </span>
              <span className="text-sm text-foreground/80 leading-snug">{r}</span>
            </motion.div>
          ))}
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={onStart}
          className={`${accentBg[game.accent]} px-8 py-4 rounded-full font-bold text-lg shadow-xl inline-flex items-center gap-2`}
        >
          בואו נשחק
          <span aria-hidden>←</span>
        </motion.button>

        <div className="mt-6">
          <Link to="/preview" className="text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
            ← חזרה למרכז המשחקים
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default PreviewIntroScreen;
