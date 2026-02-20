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
    <div className="flex gap-2 justify-center" dir="ltr">
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
            size={32}
            className={`transition-colors duration-150 ${
              star <= (hovered || value)
                ? 'fill-gold text-gold'
                : 'fill-none text-muted-foreground/40'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
