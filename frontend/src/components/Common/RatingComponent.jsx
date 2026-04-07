import React, { useState } from 'react';
import { Star } from 'lucide-react';

export const StarRating = ({ rating, count, size = 16 }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            className={`${
              star <= Math.round(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-gray-700 ml-1">
        {rating.toFixed(1)}
      </span>
      {count !== undefined && (
        <span className="text-xs text-gray-400 font-medium">
          ({count} reviews)
        </span>
      )}
    </div>
  );
};

export const RatingInput = ({ onRate, submitting }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (rating === 0) return;
    onRate({ rating, comment });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-center">
        <h4 className="text-lg font-black text-gray-900 mb-2">Rate Your Experience</h4>
        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="focus:outline-none transition-transform active:scale-90"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
            >
              <Star
                size={32}
                className={`${
                  star <= (hover || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-200'
                } transition-colors`}
              />
            </button>
          ))}
        </div>
      </div>

      <textarea
        className="w-full p-3 rounded-xl border-2 border-gray-100 focus:border-red-600 outline-none text-sm transition-all"
        rows="3"
        placeholder="Tell others about your experience with this donor..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        type="submit"
        disabled={rating === 0 || submitting}
        className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${
          rating === 0 || submitting
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-red-600 text-white shadow-lg shadow-red-200 hover:scale-[1.02]'
        }`}
      >
        {submitting ? 'Submitting...' : 'Submit Rating'}
      </button>
    </form>
  );
};
