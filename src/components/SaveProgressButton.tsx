import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const SaveProgressButton = () => {
  const [justSaved, setJustSaved] = useState(false);
  const [pulse, setPulse] = useState(true);

  useEffect(() => {
    // Gentle glow every 8 seconds
    const interval = setInterval(() => setPulse(p => !p), 4000);
    return () => clearInterval(interval);
  }, []);

  const handleSave = () => {
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  return (
    <motion.button
      onClick={handleSave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-5 right-4 sm:right-6 z-40 flex items-center gap-2 bg-card/95 backdrop-blur-xl border border-secondary/25 rounded-full px-4 py-2.5 sm:px-5 sm:py-3 shadow-[var(--shadow-elevated)] hover:border-secondary/40 transition-all duration-300 group min-h-[48px] sm:min-h-[52px]"
      style={{
        boxShadow: pulse
          ? '0 0 20px 2px hsl(var(--secondary) / 0.15), var(--shadow-elevated)'
          : 'var(--shadow-elevated)',
        transition: 'box-shadow 2s ease-in-out',
      }}
    >
      <span className="text-lg">{justSaved ? '✓' : '💾'}</span>
      <span className="text-sm font-medium text-foreground group-hover:text-secondary transition-colors">
        {justSaved ? 'נשמר!' : 'שמירת התקדמות'}
      </span>
    </motion.button>
  );
};

export default SaveProgressButton;
