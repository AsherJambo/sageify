import { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import owlLogo from '@/assets/sageify-owl-icon.jpeg';

interface BonusSelectionProps {
  title: string;
  subtitle: string;
  questions: { id: number; text: string; category: string }[];
  onComplete: (selectedIds: number[]) => void;
}

const BonusSelection = ({ title, subtitle, questions, onComplete }: BonusSelectionProps) => {
  const [selected, setSelected] = useState<number[]>([]);

  const toggle = (id: number) => {
    setSelected(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  const feedbackMessage = selected.length === 0
    ? '🌿 סגי ממתין לבחירה שלכם – סמכו על התחושה הראשונית'
    : selected.length === 1
    ? '🪶 בחירה ראשונה מצוינת! עוד שתיים...'
    : selected.length === 2
    ? '✨ כמעט שם – עוד אחת אחרונה!'
    : '🌟 שלוש בחירות מושלמות! סגי מאשר';

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-12 fade-in">
      <div className="w-full max-w-2xl space-y-8">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1.5 rounded-full bg-secondary/8 text-secondary font-medium text-sm tracking-wide border border-secondary/15">
            ✦ כוח ה-3
          </div>
          <h2 className="text-2xl md:text-3xl font-bold font-display text-foreground tracking-wide">{title}</h2>
          <p className="text-muted-foreground text-lg">{subtitle}</p>
        </div>

        {/* Feedback */}
        <div className="flex items-center gap-4 bg-card rounded-3xl p-5 border border-border/60 shadow-[var(--shadow-card)]">
          <img src={owlLogo} alt="" className="w-12 h-12 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <p className="text-foreground text-base">{feedbackMessage}</p>
          </div>
          <span className="text-secondary font-display font-bold text-xl">{selected.length}/3</span>
        </div>

        <div className="space-y-3">
          {questions.map((q) => {
            const isSelected = selected.includes(q.id);
            return (
              <button
                key={q.id}
                onClick={() => toggle(q.id)}
                className={`w-full text-right p-6 rounded-2xl border transition-all duration-300 ${
                  isSelected
                    ? 'border-secondary/40 bg-secondary/5 shadow-[var(--shadow-card)] scale-[1.01]'
                    : 'border-border/60 bg-card hover:border-secondary/25 hover:shadow-[var(--shadow-card)]'
                }`}
              >
                <div className="flex items-start gap-4">
                  <CheckCircle
                    size={22}
                    className={`mt-0.5 flex-shrink-0 transition-all duration-300 ${
                      isSelected ? 'text-secondary scale-110' : 'text-muted-foreground/20'
                    }`}
                  />
                  <div>
                    <p className="text-lg font-medium text-foreground">{q.text}</p>
                    <p className="text-sm text-muted-foreground mt-1.5">{q.category}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center pt-6">
          <button
            onClick={() => onComplete(selected)}
            disabled={selected.length !== 3}
            className="px-12 py-5 rounded-2xl bg-primary text-primary-foreground font-semibold font-display text-xl tracking-wide disabled:opacity-25 hover:bg-primary/85 transition-all duration-500 hover:scale-[1.03] shadow-[var(--shadow-elevated)]"
          >
            אישור הבחירה →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BonusSelection;
