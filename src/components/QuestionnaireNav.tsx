import owlLogo from '@/assets/owl-logo.png';

interface QuestionnaireNavProps {
  onPrev?: () => void;
  onNext?: () => void;
  onComplete?: () => void;
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
  prevDisabled = false,
  nextDisabled = false,
  completeDisabled = false,
  completeLabel,
  showPrev = true,
  showNext = false,
  showComplete = false,
}: QuestionnaireNavProps) => {
  return (
    <div className={`flex ${showPrev && (showNext || showComplete) ? 'justify-between' : 'justify-center'} items-center pt-6`}>
      {showPrev && (
        <button
          onClick={onPrev}
          disabled={prevDisabled}
          className="group inline-flex items-center gap-3 px-8 py-4.5 rounded-2xl bg-card text-foreground font-medium font-display text-lg tracking-wide border border-border/60 disabled:opacity-20 hover:border-secondary/30 hover:bg-card/80 hover:shadow-[var(--shadow-card)] transition-all duration-300"
        >
          <span className="text-muted-foreground/70 transition-transform duration-300 group-hover:translate-x-[3px]">→</span>
          <span>הקודם</span>
        </button>
      )}

      {showNext && (
        <button
          onClick={onNext}
          disabled={nextDisabled}
          className="group inline-flex items-center gap-3 px-10 py-4.5 rounded-2xl bg-primary text-primary-foreground font-medium font-display text-lg tracking-wide disabled:opacity-20 hover:bg-primary/85 transition-all duration-300 shadow-[var(--shadow-card)] hover:shadow-[var(--shadow-elevated)]"
        >
          <span>הבא</span>
          <span className="transition-transform duration-300 group-hover:translate-x-[-3px]">←</span>
        </button>
      )}

      {showComplete && (
        <button
          onClick={onComplete}
          disabled={completeDisabled}
          className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold font-display text-lg tracking-wide disabled:opacity-20 hover:bg-primary/85 transition-all duration-500 hover:scale-[1.02] shadow-[var(--shadow-elevated)] hover:shadow-[0_12px_40px_-8px_hsl(var(--primary)/0.4)]"
        >
          <img
            src={owlLogo}
            alt=""
            className="w-7 h-7 rounded-full ring-1 ring-white/20 transition-transform duration-500 group-hover:scale-110"
          />
          <span>{completeLabel}</span>
          <span className="text-primary-foreground/50 text-sm transition-transform duration-300 group-hover:translate-x-[-3px]">←</span>
        </button>
      )}
    </div>
  );
};

export default QuestionnaireNav;
