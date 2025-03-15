// src/components/ProductList.js
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import ProductItem from './ProductItem';
import { Link } from 'react-router-dom';

function ProductList({
  title,
  products,
  loading,
  error,
  scrollable = true,
  mobileColumns = 2,
  filterCategory = null,
  viewAllUrl = null,
  viewAllText = "View All Products"
}) {
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

  // Filter products by category if provided
  const filteredProducts = filterCategory && filterCategory !== 'all'
    ? products.filter(product => {
      // Check primary category
      if (product.category === filterCategory) return true;

      // Check secondary categories
      if (Array.isArray(product.categories) && product.categories.includes(filterCategory)) {
        return true;
      }

      return false;
    })
    : products;

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

  if (!filteredProducts?.length) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-xl">
        <p className="text-gray-600 text-lg font-medium">No products available.</p>
      </div>
    );
  }

  // Determine appropriate View All URL
  const defaultViewAllUrl = filterCategory && filterCategory !== 'all'
    ? `/?category=${encodeURIComponent(filterCategory)}`
    : '/?scrollToProducts=true';

  const finalViewAllUrl = viewAllUrl || defaultViewAllUrl;

  return (
    <div className="mb-10">
      {title && (
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          {scrollable && (
            <div className="flex gap-2">
              <button onClick={() => scroll('left')} className="bg-white shadow-sm rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                <i className="fas fa-chevron-left text-sm"></i>
              </button>
              <button onClick={() => scroll('right')} className="bg-white shadow-sm rounded-full w-8 h-8 flex items-center justify-center hover:bg-gray-50">
                <i className="fas fa-chevron-right text-sm"></i>
              </button>
            </div>
          )}
        </div>
      )}

      {scrollable ? (
        <div
          ref={scrollContainerRef}
          className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide scroll-smooth pl-2 pr-2"
          style={{ scrollbarWidth: 'none' }}
        >
          {filteredProducts.map(product => (
            <div key={product._id} className="min-w-[200px] max-w-[200px]">
              <ProductItem product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className={mobileColumns === 1
          ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
          : "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3"
        }>
          {filteredProducts.map(product => (
            <ProductItem key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Show count if filtering is active */}
      {filterCategory && filterCategory !== 'all' && (
        <div className="text-sm text-gray-500 mt-2">
          Showing {filteredProducts.length} of {products.length} products in {filterCategory}
        </div>
      )}

      {/* "View All" button */}
      {scrollable && filteredProducts.length > 0 && (
        <div className="flex justify-center mt-8 mb-4">
          <Link
            to={finalViewAllUrl}
            className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-8 rounded transition-colors duration-200 text-center min-w-[240px]"
          >
            {viewAllText}
          </Link>
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
  mobileColumns: PropTypes.number,
  filterCategory: PropTypes.string,
  viewAllUrl: PropTypes.string,
  viewAllText: PropTypes.string
};

export default ProductList;