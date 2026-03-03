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
      <div className="flex gap-1 sm:gap-2 justify-center items-center" dir="ltr">
        <span className="text-[10px] sm:text-xs text-muted-foreground/60 shrink-0">לא</span>
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
                  ? 'fill-gold text-gold'
                  : 'fill-none text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
        <span className="text-[10px] sm:text-xs text-muted-foreground/60 shrink-0">מאוד</span>
      </div>
    </div>
  );
};

export default StarRating;
