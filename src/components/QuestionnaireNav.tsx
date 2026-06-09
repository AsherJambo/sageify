import { useState } from 'react';
import owlLogo from '@/assets/owl-logo.png';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface QuestionnaireNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
  onBackToHub?: () => void;
  prevDisabled?: boolean;
  nextDisabled?: boolean;
  completeDisabled?: boolean;
  completeLabel: string;
  showPrev?: boolean;
  showNext?: boolean;
  showComplete?: boolean;
}

const QuestionnaireNav = ({
  onPrev,
  onNext,
  onComplete,
  onBackToHub,
  prevDisabled = false,
  nextDisabled = false,
  completeDisabled = false,
  completeLabel,
  showPrev = true,
  showNext = false,
  showComplete = false,
}: QuestionnaireNavProps) => {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div className="space-y-3 pt-6">
      <div className={`flex ${showPrev && (showNext || showComplete) ? 'justify-between' : 'justify-center'} items-center gap-3`}>
        {showPrev && (
          <button
            onClick={onPrev}
            disabled={prevDisabled}
            style={{ boxShadow: '0 4px 0 0 hsl(var(--foreground) / 0.12)' }}
            className="group inline-flex items-center gap-3 px-7 py-4 rounded-2xl bg-card text-foreground font-semibold font-display text-lg tracking-wide border-2 border-foreground/15 disabled:opacity-30 hover:-translate-y-[2px] active:translate-y-[2px] active:shadow-none transition-all duration-200 min-h-[52px]"
          >
            <span className="text-foreground/70">→</span>
            <span>הקודם</span>
          </button>
        )}

        {showNext && (
          <button
            onClick={onNext}
            disabled={nextDisabled}
            style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.18)' }}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-accent text-accent-foreground font-bold font-display text-lg tracking-wide border-2 border-foreground/15 disabled:opacity-30 hover:-translate-y-[2px] active:translate-y-[3px] active:shadow-none transition-all duration-200 min-h-[52px]"
          >
            <span>הבא</span>
            <span>←</span>
          </button>
        )}

        {showComplete && (
          <button
            onClick={onComplete}
            disabled={completeDisabled}
            style={{ boxShadow: '0 6px 0 0 hsl(var(--foreground) / 0.22)' }}
            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-destructive text-destructive-foreground font-bold font-display text-lg tracking-wide border-2 border-foreground/15 disabled:opacity-30 disabled:bg-muted disabled:text-muted-foreground hover:-translate-y-[2px] active:translate-y-[3px] active:shadow-none transition-all duration-200 min-h-[52px]"
          >
            <img
              src={owlLogo}
              alt=""
              className="w-7 h-7 rounded-full ring-2 ring-background/40 transition-transform duration-300 group-hover:rotate-6"
            />
            <span>{completeLabel}</span>
            <span>←</span>
          </button>
        )}
      </div>

      {onBackToHub && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowConfirm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-base font-display font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all duration-400 min-h-[48px]"
          >
            <span>→</span>
            <span>חזרה לתפריט הראשי</span>
          </button>
        </div>
      )}

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent 
          className="max-w-sm rounded-2xl data-[state=open]:animate-[fade-in_0.3s_ease-out,scale-in_0.25s_cubic-bezier(0.16,1,0.3,1)] data-[state=closed]:animate-[fade-out_0.2s_ease-in,scale-out_0.2s_ease-in]" 
          dir="rtl"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right font-display">לצאת מהשאלון?</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              ההתקדמות שלך נשמרת – תוכל/י לחזור ולהמשיך בכל שלב.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row-reverse gap-2 sm:flex-row-reverse">
            <AlertDialogAction 
              onClick={() => { setShowConfirm(false); onBackToHub?.(); }}
              className="transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
            >
              כן, חזרה לתפריט
            </AlertDialogAction>
            <AlertDialogCancel className="transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]">
              להישאר
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default QuestionnaireNav;
