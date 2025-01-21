// src/components/CategorySlider/CategorySlider.js
import React, { useState } from 'react';
import './CategorySlider.css';

const CategorySlider = ({ categories, selectedCategory, onSelectCategory }) => {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCategories = 4;

  const handleNext = () => {
    setStartIndex(prev => Math.min(prev + 1, categories.length - visibleCategories));
  };

  const handlePrev = () => {
    setStartIndex(prev => Math.max(prev - 1, 0));
  };

  return (
    <div className="category-slider">
      <button 
        className={`slider-arrow left ${startIndex === 0 ? 'disabled' : ''}`}
        onClick={handlePrev}
        disabled={startIndex === 0}
      >
        <i className="fas fa-chevron-left"></i>
      </button>

      <div className="categories-container">
        {categories.slice(startIndex, startIndex + visibleCategories).map(category => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onSelectCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <button 
        className={`slider-arrow right ${startIndex >= categories.length - visibleCategories ? 'disabled' : ''}`}
        onClick={handleNext}
        disabled={startIndex >= categories.length - visibleCategories}
      >
        <i className="fas fa-chevron-right"></i>
      </button>
    </div>
  );
};

export default CategorySlider;