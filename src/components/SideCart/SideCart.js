// src/components/SideCart/SideCart.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../Notification/NotificationProvider';
import LoginModal from '../Auth/LoginModal';
import api from '../../api/api';
import './SideCart.css';
import { getImageUrl } from '../../utils/imageUtils';

const SideCart = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { cartItems, removeFromCart, updateQuantity, clearCart } = useCart();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const [promoCode, setPromoCode] = useState('');
  const [promoDiscount, setPromoDiscount] = useState(null);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);
  const shippingFee = 4;

  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      showNotification('Please enter a promo code', 'error');
      return;
    }

    try {
      setIsSubmittingPromo(true);
      const response = await api.validatePromoCode(promoCode, calculateSubtotal());

      if (response.success) {
        const { type, value } = response.discount;
        setPromoDiscount({
          type,
          value,
          display: type === 'percentage' ? `${value}%` : `$${value}`
        });
        showNotification(`Promo code applied! ${type === 'percentage' ? value + '%' : '$' + value} off`, 'success');
      }
    } catch (error) {
      setPromoDiscount(null);
      showNotification(error.message || 'Invalid promo code', 'error');
    } finally {
      setIsSubmittingPromo(false);
    }
  };
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const calculateOriginalTotal = () => {
    return calculateSubtotal() + shippingFee;
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    if (!promoDiscount) return subtotal + shippingFee;

    const discountAmount = promoDiscount.type === 'percentage'
      ? (subtotal * promoDiscount.value) / 100
      : promoDiscount.value;

    return subtotal - discountAmount + shippingFee;
  };

  // src/components/SideCart/SideCart.js
  // Replace the handleCheckout function with:

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }

    // Prepare cart data
    const cartData = {
      items: cartItems,
      subtotal: calculateSubtotal(),
      shipping: shippingFee,
      discount: promoDiscount ? {
        type: promoDiscount.type,
        value: promoDiscount.value
      } : null,
      promoCode: promoCode,
      total: calculateTotal(),
      originalTotal: calculateOriginalTotal(),
      savedAmount: calculateOriginalTotal() - calculateTotal(),
      specialInstructions
    };

    // Store in localStorage
    localStorage.setItem('cartData', JSON.stringify(cartData));
    onClose();
    navigate('/checkout');
  };

  if (!isOpen) return null;

  return (
    <div className="side-cart-overlay" onClick={onClose}>
      <div className="side-cart" onClick={e => e.stopPropagation()}>
        <div className="side-cart-header">
          <h5>Shopping Cart ({cartItems.length})</h5>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        <div className="side-cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <p className="text-muted">Your cart is empty</p>
            </div>
          ) : (
            <>
              <div className="cart-items">
                {cartItems.map(item => (
            <div className="cart-item">
            <img
              src={getImageUrl(item.image)}
              alt={item.name}
              className="cart-item-image"
              style={{ 
                width: '60px', 
                height: '60px', 
                objectFit: 'cover',
                borderRadius: '4px' 
              }}
              onError={(e) => {
                e.target.src = 'https://placehold.co/60@3x.png';
              }}
            />
                    <div className="cart-item-details">
                      <h6>{item.name}</h6>
                      <div className="price">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="quantity-controls">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <button
                      className="btn btn-link text-danger remove-item"
                      onClick={() => {
                        removeFromCart(item._id);
                        showNotification('Item removed from cart', 'success');
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>

              <div className="special-instructions">
                <textarea
                  className="form-control"
                  placeholder="Add special instructions"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                ></textarea>
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="side-cart-footer">
            <div className="promo-code-section mb-3">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter promo code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                />
                <button
                  className="btn btn-outline-primary"
                  onClick={handleApplyPromo}
                  disabled={isSubmittingPromo}
                >
                  {isSubmittingPromo ? (
                    <span className="spinner-border spinner-border-sm" />
                  ) : (
                    'Apply'
                  )}
                </button>
              </div>
            </div>

            <div className="price-summary">
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${calculateSubtotal().toFixed(2)}</span>
              </div>

              {promoDiscount && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>
                    <i className="fas fa-tag me-1"></i>
                    Promo Discount {promoDiscount.display}
                  </span>
                  <span>
                    -${(promoDiscount.type === 'percentage'
                      ? (calculateSubtotal() * promoDiscount.value / 100)
                      : promoDiscount.value).toFixed(2)}
                  </span>
                </div>
              )}

              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>${shippingFee.toFixed(2)}</span>
              </div>

              <hr />

              {promoDiscount && (
                <div className="d-flex justify-content-between mb-2">
                  <span>Original Total</span>
                  <span className="text-decoration-line-through text-muted">
                    ${calculateOriginalTotal().toFixed(2)}
                  </span>
                </div>
              )}

              <div className="d-flex justify-content-between">
                <span className="fw-bold">Final Total</span>
                <span className="fw-bold">
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              {promoCode && promoDiscount && (
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <i className="fas fa-ticket-alt me-1"></i>
                    Promo code applied: {promoCode}
                  </small>
                </div>
              )}
            </div>

            <button
              className="btn btn-primary w-100 mb-2"
              onClick={handleCheckout}
            >
              Proceed to Checkout
            </button>
            <button
              className="btn btn-outline-secondary w-100"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SideCart;