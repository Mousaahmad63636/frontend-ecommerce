// src/components/RatingStars.js
import React, { useState } from 'react';

const RatingStars = ({ 
  initialRating = 0, 
  showLabel = true, 
  labelText = "Rate this product:", 
  readOnly = false,
  onRatingChange = null,
  size = "medium" // small, medium, large
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');

  const handleRating = (selectedRating) => {
    if (readOnly) return;
    
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
    
    // Call the callback if provided
    if (onRatingChange) {
      onRatingChange(selectedRating);
    }
    
    // Reset message after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
    }, 3000);
  };

  // Size classes for the stars
  const sizeClasses = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-3xl"
  };

  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center mb-2">
        {showLabel && <p className="mr-2 text-sm text-gray-600">{labelText}</p>}
        <div className="flex">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            
            return (
              <button
                type="button"
                key={ratingValue}
                className={`${sizeClasses[size] || sizeClasses.medium} px-1 focus:outline-none ${
                  ratingValue <= (hover || rating) 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                onClick={() => handleRating(ratingValue)}
                onMouseEnter={() => !readOnly && setHover(ratingValue)}
                onMouseLeave={() => !readOnly && setHover(0)}
                disabled={readOnly}
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