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
        // Don't need to navigate away - stay on the wishlist page
    };

    if (wishlistItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8 min-h-screen">
                <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-8 text-center">
                    <div className="mb-6">
                        <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Wishlist is Empty</h2>
                    <p className="text-gray-600 mb-6">Start saving your favorite items to find them easily later.</p>
                    <Link to="/" className="inline-block bg-indigo-600 hover:bg-indigo-700 transition-colors text-white font-medium rounded-lg px-6 py-3">
                        Discover Products
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 min-h-screen">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">My Wishlist</h1>
                <div className="flex items-center text-sm">
                    <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-gray-600">{wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved</span>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {wishlistItems.map(item => (
                    <div key={item._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                        <Link to={`/product/${item._id}`} className="block relative">
                            <div className="aspect-square overflow-hidden bg-gray-100">
                                <img
                                    src={item.images?.length > 0 
                                        ? getImageUrl(item.images[0]) 
                                        : 'https://placehold.co/60@3x.png'}
                                    alt={item.name}
                                    className="w-full h-full object-contain p-4 transition-transform hover:scale-105"
                                    onError={(e) => {
                                        e.target.src = 'https://placehold.co/60@3x.png';
                                    }}
                                />
                            </div>
                        </Link>
                        <div className="p-4">
                            <Link to={`/product/${item._id}`} className="block">
                                <h3 className="font-medium text-gray-900 hover:text-indigo-600 transition-colors mb-1 line-clamp-2">{item.name}</h3>
                            </Link>
                            
                            <div className="flex items-center mb-4">
                                <span className="font-bold text-lg text-gray-900">${item.price.toFixed(2)}</span>
                                {item.originalPrice && item.originalPrice > item.price && (
                                    <span className="ml-2 text-sm text-gray-500 line-through">${item.originalPrice.toFixed(2)}</span>
                                )}
                            </div>
                            
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleMoveToCart(item)}
                                    className="flex-1 bg-black hover:bg-gray-800 text-white py-2 px-3 rounded-full text-sm font-medium transition-colors"
                                >
                                    Add to Cart
                                </button>
                                <button
                                    onClick={() => removeFromWishlist(item._id)}
                                    className="w-10 h-10 flex items-center justify-center rounded-full border border-gray-300 hover:border-red-500 hover:text-red-500 transition-colors"
                                    aria-label="Remove from wishlist"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-8 text-center">
                <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 transition-colors font-medium">
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