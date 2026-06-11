import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck } from 'lucide-react';
import MeetingBookingModal from '@/components/MeetingBookingModal';

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
        <MeetingBookingModal open={open} onClose={() => setOpen(false)} />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        dir="rtl"
        className="max-w-2xl mx-auto my-4 md:my-8 p-4 sm:p-6 md:p-8 rounded-2xl bg-gradient-to-br from-accent/15 via-card to-secondary/10 border-2 border-accent/40 shadow-[var(--shadow-elevated)] text-right"
      >
        <div className="flex items-start gap-3 sm:gap-5">
          <div className="relative shrink-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-md">
              <CalendarCheck size={24} />
            </div>
            <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-green-500 border-2 border-card flex items-center justify-center">
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse" />
            </span>
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-display text-xl md:text-2xl font-bold text-foreground">
                קבע פגישה ליועץ תעסוקתי
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                זמין עכשיו
              </span>
            </div>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              סיימתם את התכתבות עם סגי וקיבלתם תובנות ראשוניות. השלב הבא —
              <strong className="text-foreground"> פגישה אישית עם יועץ אנושי</strong>{' '}
              שיתרגם את התוצאות לתוכנית פעולה מעשית והזדמנויות אמיתיות בשטח.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setOpen(true)}
              className="mt-4 inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-accent text-accent-foreground font-bold text-lg hover:brightness-110 transition-all shadow-[var(--shadow-button)]"
            >
              <CalendarCheck size={20} />
              לתיאום הפגישה
            </motion.button>
          </div>
        </div>
      </motion.div>
      <MeetingBookingModal open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default ScheduleMeetingCTA;
