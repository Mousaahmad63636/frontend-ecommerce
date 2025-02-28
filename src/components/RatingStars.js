import React, { useState } from 'react';

const RatingStars = () => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleRating = (selectedRating) => {
    setRating(selectedRating);
    setSubmitted(true);
    
    // Different messages based on rating
    if (selectedRating <= 2) {
      setMessage("Thank you for your feedback. We'll work to improve your experience.");
    } else if (selectedRating === 3) {
      setMessage("Thank you for your feedback. We appreciate your honest review.");
    } else {
      setMessage("Thank you for your positive feedback!");
    }
    
    // Reset after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2">
        <p className="mr-2 text-sm text-gray-600">Rate your experience:</p>
        <div className="flex">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            
            return (
              <button
                type="button"
                key={ratingValue}
                className={`text-2xl px-1 focus:outline-none ${
                  ratingValue <= (hover || rating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
                onClick={() => handleRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
                disabled={submitted}
              >
                <span className="star">★</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {message && (
        <div className="mt-2 text-sm text-center text-green-600 animate-fade-in">
          {message}
        </div>
      )}
    </div>
  );
};

export default RatingStars;