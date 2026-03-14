import owlLogo from '@/assets/owl-logo.png';

interface SectionIntroProps {
  title?: string;
  badge?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  paragraphs2?: string[];
  notes?: string[];
  onContinue: () => void;
  buttonText?: string;
  contextFeedback?: string;
}

const SectionIntro = ({
  title,
  badge,
  paragraphs,
  bulletPoints,
  paragraphs2,
  notes,
  onContinue,
  buttonText = '← בואו נמשיך',
  contextFeedback,
}: SectionIntroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-16 fade-in">
      <div className="w-full max-w-2xl space-y-10">
        {/* Contextual feedback toast */}
        {contextFeedback && (
          <div className="bg-secondary/8 border border-secondary/20 rounded-2xl px-6 py-4 text-center text-base text-foreground font-medium animate-fade-in">
            {contextFeedback}
          </div>
        )}

        {/* Logo */}
        <div className="text-center">
          <img
            src={owlLogo}
            alt="Sageify"
            className="w-24 h-24 mx-auto mb-6 rounded-full shadow-[var(--shadow-card)] animate-float"
          />
          {badge && (
            <div className="inline-block px-5 py-2 rounded-full bg-secondary/8 text-secondary font-medium text-base mb-3 tracking-wide border border-secondary/15">
              {badge}
            </div>
          )}
          {title && (
            <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">{title}</h2>
          )}
        </div>

        {/* Main content card */}
        <div className="bg-card rounded-3xl p-8 md:p-10 border border-border/60 shadow-[var(--shadow-card)] space-y-5">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-foreground leading-relaxed text-lg">
              {p}
            </p>
          ))}

          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-4 pr-2">
              {bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground text-lg">
                  <span className="text-secondary/60 mt-1 flex-shrink-0 text-sm">◆</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          )}

          {paragraphs2 && paragraphs2.map((p, i) => (
            <p key={`p2-${i}`} className="text-foreground leading-relaxed text-lg">
              {p}
            </p>
          ))}
        </div>

        {/* Notes block */}
        {notes && notes.length > 0 && (
          <div className="bg-card rounded-3xl p-8 border border-secondary/15 shadow-[var(--shadow-card)] space-y-4">
            <p className="font-semibold font-display text-foreground text-lg tracking-wide">הערות אחרונות לפני שמתחילים:</p>
            <ul className="space-y-3 pr-2">
              {notes.map((note, i) => (
                <li key={i} className="flex items-start gap-3 text-foreground text-base">
                  <span className="text-secondary/50 mt-0.5 flex-shrink-0 text-sm">✦</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <p className="text-foreground text-lg font-medium mt-2">בהצלחה, ונתראה בהמשך!</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-10">
          <button
            onClick={onContinue}
            className="px-14 py-6 bg-primary text-primary-foreground rounded-2xl text-xl font-semibold font-display tracking-wide hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)]"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionIntro;