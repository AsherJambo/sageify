import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import sageifyLogo from '@/assets/owl-logo.png';

interface ThinkingSkillsPlaceholderProps {
  trigger?: React.ReactNode;
}

const ThinkingSkillsPlaceholder = ({ trigger }: ThinkingSkillsPlaceholderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <div onClick={() => setOpen(true)} className="cursor-pointer">
          {trigger}
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl text-lg font-semibold font-display tracking-wide hover:bg-primary/85 transition-all duration-300 hover:scale-[1.02]"
        >
          התחילו את ההערכה
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg rounded-3xl border-border/60 bg-card p-0 overflow-hidden">
          <div className="bg-gradient-to-b from-secondary/5 to-transparent p-8 pb-4 text-center">
            <img
              src={sageifyLogo}
              alt="Sageify"
              className="w-20 h-20 mx-auto rounded-full border-2 border-secondary/15 shadow-[var(--shadow-card)] mb-4"
            />
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold font-display text-foreground tracking-wide">
                הערכת חשיבה וגמישות קוגניטיבית
              </DialogTitle>
            </DialogHeader>
          </div>

          <div className="px-8 pb-8 space-y-5 text-center">
            <div className="bg-secondary/[0.04] border border-secondary/15 rounded-2xl p-6 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-gold-light flex items-center justify-center">
                <span className="text-xl">🌱</span>
              </div>
              <p className="text-lg text-foreground font-display font-semibold tracking-wide">
                ההערכה בשלבי פיתוח
              </p>
              <p className="text-muted-foreground leading-relaxed text-base">
                אנחנו בונים בקפידה הערכה שתספק תובנות משמעותיות ומכבדות,
                מותאמות במיוחד לשלב הזה בחיים.
              </p>
            </div>

            <DialogDescription className="text-muted-foreground leading-relaxed text-base">
              ההערכה תעזור לחשוף חוזקות חשיבה שלא תמיד באות לידי ביטוי
              במסלולי קריירה מסורתיים – ולתרגם אותן לצעדים הבאים המשמעותיים עבורכם.
            </DialogDescription>

            <button
              onClick={() => setOpen(false)}
              className="px-8 py-3 bg-muted text-foreground rounded-2xl text-base font-semibold font-display tracking-wide hover:bg-muted/80 transition-all duration-300"
            >
              הבנתי, אחכה לעדכון ✦
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ThinkingSkillsPlaceholder;
