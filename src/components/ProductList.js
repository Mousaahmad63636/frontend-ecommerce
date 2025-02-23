// components/ProductList.js
import React from 'react';
import PropTypes from 'prop-types';
import ProductItem from './ProductItem';
import ScrollableSection from './ScrollableSection/ScrollableSection';

function ProductList({ title, products, loading, error, scrollable = false }) {
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8 bg-red-50 rounded-xl">
        <div className="mb-4">
          <i className="fas fa-exclamation-circle text-4xl text-red-500"></i>
        </div>
        <p className="text-red-600 text-lg font-medium">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-2 bg-red-500 text-white rounded-lg 
            hover:bg-red-600 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <div className="mb-4">
          <i className="fas fa-box-open text-4xl text-gray-400"></i>
        </div>
        <p className="text-gray-600 text-lg font-medium">No products available.</p>
        <p className="text-gray-500 mt-2">Check back later for new products!</p>
      </div>
    );
  }

  if (scrollable) {
    return (
      <ScrollableSection title={title}>
        {products.map(product => (
          <ProductItem key={product._id} product={product} />
        ))}
      </ScrollableSection>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductItem key={product._id} product={product} />
      ))}
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