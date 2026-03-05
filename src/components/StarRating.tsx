import { Star } from 'lucide-react';
import { useState } from 'react';

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

const StarRating = ({ value, onChange, max = 5 }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex gap-1 justify-center items-center" dir="ltr">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all duration-200 hover:scale-125 focus:outline-none"
          >
            <Star
              size={28}
              className={`transition-colors duration-150 ${
                star <= (hovered || value)
                  ? 'fill-secondary text-secondary'
                  : 'fill-none text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-[180px]" dir="rtl">
        <span className="text-[11px] text-muted-foreground/60">מתאים מאוד</span>
        <span className="text-[11px] text-muted-foreground/60">לא מתאים</span>
      </div>
    </div>
  );
};

export default StarRating;
