import owlLogo from '@/assets/sageify-owl-icon.jpeg';

interface SectionIntroProps {
  title?: string;
  badge?: string;
  paragraphs: string[];
  bulletPoints?: string[];
  paragraphs2?: string[];
  notes?: string[];
  onContinue: () => void;
  buttonText?: string;
}

const SectionIntro = ({
  title,
  badge,
  paragraphs,
  bulletPoints,
  paragraphs2,
  notes,
  onContinue,
  buttonText = 'בואו נמשיך →',
}: SectionIntroProps) => {
  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        {/* Logo */}
        <div className="text-center">
          <img
            src={owlLogo}
            alt="Sageify"
            className="w-20 h-20 mx-auto mb-4 rounded-full shadow-md animate-float"
          />
          {badge && (
            <div className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary font-semibold text-sm mb-2">
              {badge}
            </div>
          )}
          {title && (
            <h2 className="text-2xl font-bold font-serif text-foreground">{title}</h2>
          )}
        </div>

        {/* Main content card */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-md space-y-4">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-foreground leading-relaxed text-base">
              {p}
            </p>
          ))}

          {bulletPoints && bulletPoints.length > 0 && (
            <ul className="space-y-2 pr-2">
              {bulletPoints.map((bp, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground text-base">
                  <span className="text-secondary mt-1 flex-shrink-0">•</span>
                  <span>{bp}</span>
                </li>
              ))}
            </ul>
          )}

          {paragraphs2 && paragraphs2.map((p, i) => (
            <p key={`p2-${i}`} className="text-foreground leading-relaxed text-base">
              {p}
            </p>
          ))}
        </div>

        {/* Notes block */}
        {notes && notes.length > 0 && (
          <div className="bg-primary/5 rounded-2xl p-5 border border-primary/15 space-y-3">
            <p className="font-semibold font-serif text-foreground text-base">וכמה הערות אחרונות לפני המעבר לאבחון:</p>
            <ul className="space-y-2 pr-2">
              {notes.map((note, i) => (
                <li key={i} className="flex items-start gap-2 text-foreground text-sm">
                  <span className="text-secondary mt-0.5 flex-shrink-0">✦</span>
                  <span>{note}</span>
                </li>
              ))}
            </ul>
            <p className="text-foreground text-base font-medium mt-2">בהצלחה, ונתראה שוב בהמשך! 🦉</p>
          </div>
        )}

        {/* CTA */}
        <div className="text-center pt-4">
          <button
            onClick={onContinue}
            className="px-10 py-4 bg-primary text-primary-foreground rounded-xl text-xl font-semibold font-serif hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg"
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SectionIntro;
