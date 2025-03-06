// src/pages/WishlistPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';
import { getImageUrl } from '../utils/imageUtils';

function WishlistPage() {
    const { wishlistItems, removeFromWishlist } = useWishlist();
    const { addToCart } = useCart();

    const handleMoveToCart = (product) => {
        addToCart(product);
        removeFromWishlist(product._id);
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 pt-20 min-h-screen">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Wishlist is Empty</h2>
                    <p className="text-gray-600 mb-6">Start saving your favorite items to find them easily later.</p>
                    <Link to="/" className="inline-block bg-purple-700 hover:bg-purple-800 transition-colors text-white font-medium rounded-lg px-6 py-3">
                        Discover Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 pt-20 min-h-screen">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist</h1>
                <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-gray-600">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</span>
                </div>
            </div>

            {/* Product Grid Layout - matching ProductItem style */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {wishlistItems.map(item => {
                    // Calculate dollar amount saved if there's an original price
                    const savedAmount = item.originalPrice && item.originalPrice > item.price
                        ? item.originalPrice - item.price
                        : 0;
                    
                    return (
                        <div key={item._id} className="group bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all product-card">
                            <Link to={`/product/${item._id}`} className="block relative">
                                <div className="aspect-square overflow-hidden bg-gray-100">
                                    <img
                                        src={item.images?.length > 0 
                                            ? getImageUrl(item.images[0]) 
                                            : 'https://placehold.co/300x300'}
                                        alt={item.name}
                                        className="w-full h-full object-contain p-4 transition-transform group-hover:scale-105"
                                        onError={(e) => {
                                            e.target.src = 'https://placehold.co/300x300';
                                        }}
                                    />
                                </div>
                                
                                {/* Dollar Amount Saved Badge */}
                                {savedAmount > 0 && (
                                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1">
                                        Save ${savedAmount.toFixed(2)}
                                    </div>
                                )}
                                
                                {/* Wishlist Button - Already in wishlist, so show remove option */}
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        removeFromWishlist(item._id);
                                    }}
                                    className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center rounded-full bg-white shadow-md hover:bg-red-50 text-red-500 transition-colors"
                                    aria-label="Remove from wishlist"
                                >
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                                    </svg>
                                </button>
                            </Link>
                            
                            <div className="p-3">
                                <Link to={`/product/${item._id}`} className="block">
                                    <h3 className="font-medium text-gray-900 hover:text-purple-700 transition-colors mb-1 line-clamp-2 text-sm h-10">
                                        {item.name}
                                    </h3>
                                </Link>
                                
                                <div className="flex flex-col mb-2">
                                    <div className="flex items-center">
                                        <span className="font-bold text-gray-900">${item.price.toFixed(2)}</span>
                                        {item.originalPrice && item.originalPrice > item.price && (
                                            <span className="ml-2 text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</span>
                                        )}
                                    </div>
                                    
                                    {/* Rating Stars */}
                                    {item.rating && (
                                        <div className="flex items-center mt-1">
                                            <div className="flex">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <span 
                                                        key={star} 
                                                        className="text-yellow-400 text-sm"
                                                    >
                                                        {star <= item.rating ? '★' : '☆'}
                                                    </span>
                                                ))}
                                            </div>
                                            <span className="text-xs text-gray-500 ml-1">
                                                ({item.reviewCount || 0})
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="w-full bg-black hover:bg-gray-900 text-white text-sm font-medium py-2 rounded-full transition-colors"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            
            <div className="mt-8 text-center">
                <Link to="/" className="inline-flex items-center text-purple-700 hover:text-purple-800 transition-colors font-medium">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}

export default WishlistPage;