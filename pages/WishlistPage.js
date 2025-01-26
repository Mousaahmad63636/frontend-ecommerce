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
            <div className="container mt-4">
                <div className="text-center">
                    <h2>Your Wishlist is Empty</h2>
                    <Link to="/" className="btn btn-primary mt-3">
                        Continue Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <h2 className="mb-4">My Wishlist</h2>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {wishlistItems.map(item => (
                    <div key={item._id} className="col">
                        <div className="card h-100">
                            <img
                                src={getImageUrl(item.image)}
                                className="card-img-top"
                                alt={item.name}
                                style={{ height: '200px', objectFit: 'cover' }}
                                onError={(e) => {
                                    e.target.src = 'https://placehold.co/60@3x.png';
                                  }}
                            />
                            <div className="card-body d-flex flex-column">
                                <h5 className="card-title">{item.name}</h5>
                                <p className="card-text text-muted">${item.price.toFixed(2)}</p>
                                <div className="mt-auto">
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => handleMoveToCart(item)}
                                    >
                                        Move to Cart
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => removeFromWishlist(item._id)}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default WishlistPage;