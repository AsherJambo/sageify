import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

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

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 fade-in">
      <div className="w-full max-w-2xl space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-block px-4 py-1 rounded-full bg-gold-light text-accent font-semibold text-sm">
            ✨ כוח ה-3
          </div>
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          <p className="text-muted-foreground text-lg">{subtitle}</p>
          <p className="text-accent font-semibold">
            נבחרו {selected.length} / 3
          </p>
        </div>

        <div className="space-y-3">
          {questions.map((q) => {
            const isSelected = selected.includes(q.id);
            return (
              <button
                key={q.id}
                onClick={() => toggle(q.id)}
                className={`w-full text-right p-5 rounded-xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-accent bg-gold-light shadow-md'
                    : 'border-border bg-card hover:border-accent/40'
                }`}
              >
                <div className="flex items-start gap-3">
                  <CheckCircle
                    size={24}
                    className={`mt-0.5 flex-shrink-0 transition-colors ${
                      isSelected ? 'text-accent' : 'text-muted-foreground/30'
                    }`}
                  />
                  <div>
                    <p className="text-lg font-medium text-foreground">{q.text}</p>
                    <p className="text-sm text-muted-foreground mt-1">{q.category}</p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-center pt-4">
          <button
            onClick={() => onComplete(selected)}
            disabled={selected.length !== 3}
            className="px-10 py-4 rounded-lg bg-primary text-primary-foreground font-semibold text-xl disabled:opacity-30 hover:opacity-90 transition-all"
          >
            אישור הבחירה →
          </button>
        </div>
      </div>
    </div>
  );
};

export default BonusSelection;
