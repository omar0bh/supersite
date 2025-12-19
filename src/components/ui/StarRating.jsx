import { useState } from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating, onRatingChange, disabled = false }) => {
  const [hoveredRating, setHoveredRating] = useState(0);

  const handleStarClick = (value) => {
    if (!disabled) {
      onRatingChange(value);
    }
  };

  const handleStarHover = (value) => {
    if (!disabled) {
      setHoveredRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!disabled) {
      setHoveredRating(0);
    }
  };

  return (
    <div className="flex items-center gap-2" onMouseLeave={handleMouseLeave}>
      {[1, 2, 3, 4, 5].map((value) => {
        const isFilled = value <= (hoveredRating || rating);
        return (
          <button
            key={value}
            type="button"
            onClick={() => handleStarClick(value)}
            onMouseEnter={() => handleStarHover(value)}
            disabled={disabled}
            className={`transition-all duration-200 ${
              disabled ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-110'
            }`}
            aria-label={`Rate ${value} out of 5 stars`}
          >
            <Star
              size={28}
              className={`${
                isFilled
                  ? 'fill-[var(--accent-primary)] text-[var(--accent-primary)]'
                  : 'fill-transparent text-[var(--text-secondary)]'
              } transition-all duration-200 ${
                !disabled && hoveredRating >= value ? 'scale-110' : ''
              }`}
            />
          </button>
        );
      })}
      {rating > 0 && (
        <span className="ml-2 text-sm font-medium text-[var(--text-secondary)]">
          {rating} / 5
        </span>
      )}
    </div>
  );
};

export default StarRating;

