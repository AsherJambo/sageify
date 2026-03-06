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
    <div className="flex flex-col items-center gap-2">
      <div className="flex gap-2 justify-center items-center" dir="ltr">
        {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className="transition-all duration-300 hover:scale-125 focus:outline-none"
          >
            <Star
              size={30}
              className={`transition-all duration-300 ${
                star <= (hovered || value)
                  ? 'fill-secondary text-secondary drop-shadow-sm'
                  : 'fill-none text-border'
              }`}
            />
          </button>
        ))}
      </div>
      <div className="flex justify-between w-full max-w-[200px]" dir="rtl">
        <span className="text-xs text-muted-foreground/50 tracking-wide">מתאים מאוד</span>
        <span className="text-xs text-muted-foreground/50 tracking-wide">לא מתאים</span>
      </div>
    </div>
  );
};

export default StarRating;
