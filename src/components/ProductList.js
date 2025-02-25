// src/components/ProductList.js
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ProductItem from './ProductItem';

function ProductList({ title, products, loading, error, scrollable = true }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-xl">
        <p className="text-red-600 text-lg font-medium">{error}</p>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <p className="text-gray-600 text-lg font-medium">No products available.</p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {title && (
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {scrollable && (
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={() => scroll('right')} className="bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {scrollable ? (
        <div 
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-4 pb-4 scrollbar-hide scroll-smooth pl-2 pr-2" // Added pl-2 pr-2 to reduce padding
          style={{ scrollbarWidth: 'none' }}
        >
          {products.map(product => (
            <div key={product._id} className="min-w-[250px] max-w-[250px]">
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map(product => (
            <ProductItem key={product._id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

ProductList.propTypes = {
  title: PropTypes.string,
  products: PropTypes.array,
  loading: PropTypes.bool,
  error: PropTypes.string,
  scrollable: PropTypes.bool,
};

export default ProductList;