import React from 'react';
import PropTypes from 'prop-types';
import ProductItem from './ProductItem';
import { Spinner } from 'flowbite-react';

function ProductList({ products, loading, error }) {
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Spinner size="xl" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-lg shadow-sm">
        <div className="mb-4">
          <i className="fas fa-exclamation-circle text-4xl text-red-500"></i>
        </div>
        <p className="text-red-600 text-lg">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg shadow-sm">
        <div className="mb-4">
          <i className="fas fa-box-open text-4xl text-gray-400"></i>
        </div>
        <p className="text-gray-600 text-lg">No products available.</p>
        <p className="text-gray-500 mt-2">Check back later for new products!</p>
      </div>
    );
  }

  // Grid layout with responsive design
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-fade-in">
        {products.map(product => (
          <div 
            key={product._id} 
            className="transform hover:-translate-y-1 transition-transform duration-200 animate-fade-in"
            style={{
              animationDelay: `${products.indexOf(product) * 0.1}s`
            }}
          >
            <ProductItem product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

ProductList.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      _id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      price: PropTypes.number.isRequired,
      images: PropTypes.arrayOf(PropTypes.string).isRequired,
    })
  ),
  loading: PropTypes.bool,
  error: PropTypes.string,
};

ProductList.defaultProps = {
  loading: false,
  error: null,
};

// Add this to your global CSS or tailwind.config.js
const fadeInAnimation = {
  '.animate-fade-in': {
    opacity: 0,
    animation: 'fadeIn 0.5s ease-in forwards',
  },
  '@keyframes fadeIn': {
    '0%': { opacity: 0, transform: 'translateY(10px)' },
    '100%': { opacity: 1, transform: 'translateY(0)' },
  },
};

export default ProductList;