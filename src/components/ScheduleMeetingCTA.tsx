import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import ContactFormModal from '@/components/ContactFormModal';

interface ScheduleMeetingCTAProps {
  variant?: 'banner' | 'floating';
}

/**
 * CTA to schedule a meeting with a human career counselor.
 * Shown after the user reaches the advisor / results — the next step
 * after the gamified diagnosis is a real consultation.
 */
const ScheduleMeetingCTA = ({ variant = 'banner' }: ScheduleMeetingCTAProps) => {
  const [open, setOpen] = useState(false);

  if (variant === 'floating') {
    return (
      <>
        <motion.button
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, type: 'spring' }}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          className="fixed bottom-5 left-5 z-40 inline-flex items-center gap-2 px-4 py-3 rounded-full bg-accent text-accent-foreground font-bold text-sm shadow-[var(--shadow-elevated)]"
        >
          <CalendarCheck size={18} />
          תיאום פגישה עם יועץ
        </motion.button>
        <ContactFormModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        dir="rtl"
        className="max-w-2xl mx-auto my-8 p-6 md:p-7 rounded-2xl bg-gradient-to-br from-accent/10 via-card to-secondary/5 border border-accent/30 shadow-[var(--shadow-card)] text-right"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-accent/15 flex items-center justify-center text-accent flex-shrink-0">
            <CalendarCheck size={22} />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
              השלב הבא: פגישה עם יועץ תעסוקתי
            </h3>
            <p className="text-base text-muted-foreground leading-relaxed">
              סגי עזר לכם לחדד את התמונה. עכשיו — פגישה אישית עם יועץ אנושי שמתמחה בתעסוקה אקטיבית אחרי פרישה,
              שיתרגם את התובנות לתוכנית פעולה ולהזדמנויות אמיתיות בשטח.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setOpen(true)}
              className="mt-3 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-accent text-accent-foreground font-bold text-base hover:opacity-90 transition-all shadow-md"
            >
              <CalendarCheck size={18} />
              לתיאום פגישה
            </motion.button>
          </div>
        </div>
      </motion.div>
      <ContactFormModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ScheduleMeetingCTA;
