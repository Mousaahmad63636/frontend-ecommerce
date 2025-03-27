// src/components/SideCart/SideCart.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../Notification/NotificationProvider';
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
  const shippingFee = 3;

  // Update the global window variable when the isOpen prop changes
  useEffect(() => {
    // Set a global variable to track cart state
    window.isSideCartOpen = isOpen;
    
    // Dispatch custom event for components that need to react
    const event = new CustomEvent('sideCartStateChange', { detail: { isOpen } });
    document.dispatchEvent(event);
    
    // Cleanup when component unmounts
    return () => {
      window.isSideCartOpen = false;
    };
  }, [isOpen]);

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

  // Get CSS class based on number of items
  const getCartItemsClass = () => {
    const itemCount = cartItems.length;
    if (itemCount === 0) return 'empty-cart-container';
    if (itemCount === 1) return 'single-item-container';
    if (itemCount === 2) return 'two-items-container';
    if (itemCount === 3) return 'three-items-container';
    return 'multi-items-container';
  };

  if (!isOpen) return null;

  return (
    <div className="side-cart-overlay" onClick={onClose}>
      <div className="side-cart" onClick={e => e.stopPropagation()}>
        <div className="side-cart-header">
          <h5>Shopping Cart({cartItems.length})</h5>
          <button 
            className="btn-close" 
            onClick={onClose} 
            aria-label="Close cart"
          ></button>
        </div>
        
        {/* Cart body */}
        <div className="side-cart-body">
          {cartItems.length === 0 ? (
            <div className="empty-cart">
              <i className="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
              <p className="text-muted">Your cart is empty</p>
            </div>
          ) : (
            <>
              {/* Cart items - scrollable area */}
              <div className={`cart-items ${getCartItemsClass()}`}>
                {cartItems.map(item => (
                  <div className="cart-item" key={item.itemId || item._id}>
                    <img
                      src={item.images?.length > 0
                        ? getImageUrl(item.images[0])
                        : 'https://placehold.co/60@3x.png'}
                      alt={item.name}
                      className="cart-item-image"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/60@3x.png';
                      }}
                    />
                    <div className="cart-item-details">
                      <h6 className="item-name">{item.name}</h6>
                      
                      {/* Display selected color and size if available */}
                      {(item.selectedColor || item.selectedSize) && (
                        <div className="item-variants text-xs text-gray-600 mb-1">
                          {item.selectedColor && (
                            <div className="flex items-center">
                              <span className="variant-label">Color:</span>
                              <div 
                                className="color-dot ml-1 w-3 h-3 rounded-full inline-block" 
                                style={{backgroundColor: item.selectedColor}}
                                title={item.selectedColor}
                              ></div>
                            </div>
                          )}
                          {item.selectedSize && (
                            <div className="flex items-center mt-0.5">
                              <span className="variant-label">Size:</span>
                              <span className="font-medium ml-1">{item.selectedSize}</span>
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="price">${(item.price * item.quantity).toFixed(2)}</div>
                      <div className="quantity-controls">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item.itemId || item._id, Math.max(1, item.quantity - 1))}
                        >
                          <i className="fas fa-minus"></i>
                        </button>
                        <span className="quantity">{item.quantity}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => updateQuantity(item.itemId || item._id, item.quantity + 1)}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    </div>
                    <button
                      className="btn btn-link text-danger remove-item"
                      onClick={() => {
                        removeFromCart(item.itemId || item._id);
                      }}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                ))}
              </div>

              {/* Special instructions - if needed */}
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

        {/* Footer - always visible */}
        <div className="side-cart-footer">
          {/* Promo code input section */}
          <div className="promo-code-section">
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
                disabled={isSubmittingPromo || cartItems.length === 0}
              >
                {isSubmittingPromo ? (
                  <span className="spinner-border spinner-border-sm" />
                ) : (
                  'Apply'
                )}
              </button>
            </div>
          </div>

          {/* Price summary */}
          <div className="price-summary">
            <div className="d-flex justify-content-between summary-row">
              <span>Subtotal</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>

            {promoDiscount && (
              <div className="d-flex justify-content-between summary-row text-success">
                <span>
                  <i className="fas fa-tag me-1"></i>
                  Discount {promoDiscount.display}
                </span>
                <span>
                  -${(promoDiscount.type === 'percentage'
                    ? (calculateSubtotal() * promoDiscount.value / 100)
                    : promoDiscount.value).toFixed(2)}
                </span>
              </div>
            )}

            <div className="d-flex justify-content-between summary-row">
              <span>delivery</span>
              <span>${shippingFee.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between total-row">
              <span className="fw-bold">Total</span>
              <span className="fw-bold">
                ${calculateTotal().toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout button - always at bottom */}
          <div className="checkout-buttons">
            <button
              className="btn btn-primary checkout-btn"
              onClick={handleCheckout}
              disabled={cartItems.length === 0}
            >
              Buy Now
            </button>
            <button
              className="btn btn-outline-secondary continue-btn"
              onClick={onClose}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideCart;