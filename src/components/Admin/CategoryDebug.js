// src/components/Admin/CategoryDebug.js
import React from 'react';

const CategoryDebug = ({ product }) => {
  if (!product) return null;
  
  return (
    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-sm font-bold mb-2">Category Debug Information</h3>
      <p className="text-xs mb-1"><strong>Category (primary):</strong> {product.category || 'Not set'}</p>
      <p className="text-xs mb-1"><strong>Categories array:</strong> {Array.isArray(product.categories) 
        ? (product.categories.length > 0 ? product.categories.join(', ') : '(empty array)') 
        : 'Not an array'}</p>
      <p className="text-xs mb-1"><strong>Categories type:</strong> {typeof product.categories}</p>
      <p className="text-xs"><strong>Raw data:</strong> {JSON.stringify(product.categories)}</p>
    </div>
  );
};

export default CategoryDebug;