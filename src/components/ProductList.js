import React, { useState } from 'react';
import ProductItem from './ProductItem';

function ProductList({ products }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const productsPerView = 4;

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-4">
        <p>No products available.</p>
      </div>
    );
  }

  const totalSlides = Math.ceil(products.length / productsPerView);

  const handlePrevSlide = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const handleNextSlide = () => {
    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
  };

  const visibleProducts = products.slice(
    currentSlide * productsPerView,
    (currentSlide * productsPerView) + productsPerView
  );

  return (
    <div className="product-slider position-relative">
      <div className="row row-cols-1 row-cols-md-4 g-4">
        {visibleProducts.map(product => (
          <div key={product._id} className="col">
            <ProductItem product={product} />
          </div>
        ))}
      </div>

      {totalSlides > 1 && (
        <>
          <button 
            className="slider-arrow slider-arrow-prev"
            onClick={handlePrevSlide}
            disabled={currentSlide === 0}
            aria-label="Previous products"
          >
            <i className="fas fa-chevron-left"></i>
          </button>
          <button 
            className="slider-arrow slider-arrow-next"
            onClick={handleNextSlide}
            disabled={currentSlide === totalSlides - 1}
            aria-label="Next products"
          >
            <i className="fas fa-chevron-right"></i>
          </button>
        </>
      )}
    </div>
  );
}

export default ProductList;