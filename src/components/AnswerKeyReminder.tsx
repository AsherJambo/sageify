import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export interface AnswerKeyItem {
  label: string;
  desc: string;
}

interface AnswerKeyReminderProps {
  items: AnswerKeyItem[];
}

const AnswerKeyReminder = ({ items }: AnswerKeyReminderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-secondary hover:text-secondary/80 font-display font-semibold text-base transition-colors duration-200 min-h-[44px] mx-auto"
      >
        <span className="text-lg">{open ? '▾' : '▸'}</span>
        <span>{open ? 'הסתר הגדרות תשובות' : '📖 הזכר לי את הגדרות התשובות'}</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 bg-muted/30 rounded-2xl p-5 border border-border/40">
              {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-base">
                  <span className="font-bold text-foreground bg-secondary/10 px-3 py-1 rounded-lg text-sm min-w-fit">
                    {item.label}
                  </span>
                  <span className="text-muted-foreground">{item.desc}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnswerKeyReminder;
