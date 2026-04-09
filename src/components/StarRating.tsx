import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

const LABELS: Record<number, string> = {
  1: 'לא מתאים',
  2: 'מתאים מעט',
  3: 'מתאים חלקית',
  4: 'מתאים',
  5: 'מתאים מאוד',
};

const StarRating = ({ value, onChange, max = 5 }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);
  const active = hovered || value;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex gap-3 justify-center items-center" dir="ltr">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            aria-label={`${LABELS[star]} – ${star} מתוך ${max}`}
            className="p-1.5 transition-all duration-400 hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary focus-visible:ring-offset-2 rounded-lg min-h-[48px] min-w-[48px] flex items-center justify-center"
          >
            <Star
              size={34}
              strokeWidth={1.5}
              className={`transition-all duration-400 ${
                star <= active
                  ? 'fill-secondary text-secondary drop-shadow-sm'
                  : 'fill-none text-border'
              }`}
            />
          </button>
        ))}
      </div>
      {/* Active label */}
      <div className="h-6 flex items-center">
        {active > 0 && (
          <span className="text-sm font-display font-medium text-secondary tracking-wide animate-fade-in">
            {LABELS[active]}
          </span>
        )}
      </div>
      <div className="flex justify-between w-full max-w-[260px]" dir="rtl">
        <span className="text-sm text-muted-foreground tracking-wide">מתאים מאוד</span>
        <span className="text-sm text-muted-foreground tracking-wide">לא מתאים</span>
      </div>
    </div>
  );
};

export default StarRating;
