// src/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from '../components/Auth/LoginModal';
import api from '../api/api';

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  // Initialize form data from localStorage or user data
  const [formData, setFormData] = useState(() => {
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    if (savedCustomerInfo) {
      return JSON.parse(savedCustomerInfo);
    }

    if (isAuthenticated) {
      return {
        customerName: user?.name || '',
        customerEmail: user?.email || '',
        phoneNumber: user?.phoneNumber || '',
        address: user?.address || '',
        specialInstructions: ''
      };
    }

    return {
      customerName: '',
      customerEmail: '',
      phoneNumber: '',
      address: '',
      specialInstructions: ''
    };
  });
  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^\d{8}$/;  // Exactly 8 digits
    return phoneRegex.test(phone);
  };
  useEffect(() => {
    const savedCartData = localStorage.getItem('cartData');
    if (savedCartData) {
      setCartData(JSON.parse(savedCartData));
    } else {
      navigate('/cart');
    }
  }, [navigate]);

  useEffect(() => {
    if (formData.customerName || formData.customerEmail) {
      localStorage.setItem('customerInfo', JSON.stringify(formData));
    }
  }, [formData]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setFormData(prev => ({
        ...prev,
        customerName: user.name || prev.customerName,
        customerEmail: user.email || prev.customerEmail,
        phoneNumber: user.phoneNumber || prev.phoneNumber,
        address: user.address || prev.address
      }));
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.customerName?.trim()) {
      errors.customerName = 'Full name is required';
    }

    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber.trim())) {
      errors.phoneNumber = 'Phone number must be exactly 8 digits';
    }

    if (!formData.address?.trim()) {
      errors.address = 'Delivery address is required';
    }

    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }

    if (cartItems.length === 0) {
      showNotification('Your cart is empty', 'error');
      return;
    }

    try {
      setLoading(true);
      const orderData = {
        products: cartItems.map(item => ({
          product: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        subtotal: cartData.subtotal,
        shippingFee: cartData.shipping,
        totalAmount: cartData.total,
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        specialInstructions: formData.specialInstructions
      };

      // Add email if exists
      if (formData.customerEmail?.trim()) {
        orderData.customerEmail = formData.customerEmail.trim();
      }

      // Add promo code if exists
      if (cartData.promoCode) {
        orderData.promoCode = cartData.promoCode;
      }

      // Only add promoDiscount if there is an actual discount
      if (cartData.discount && cartData.discount > 0) {
        orderData.promoDiscount = {
          type: 'percentage', // or whatever type you're using
          value: Number(cartData.discount)
        };
      }

      const response = isAuthenticated
        ? await api.createOrder(orderData)
        : await api.createGuestOrder(orderData);

      clearCart();
      localStorage.removeItem('cartData');

      showNotification('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${response.order._id}`);
    } catch (error) {
      console.error('Order creation error:', error);
      showNotification(
        error.response?.data?.message || 'Error placing order. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  if (!cartData) {
    return null;
  }

  return (
    <div className="container my-4">
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Checkout Information</h4>
              {!isAuthenticated && (
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={handleLoginClick}
                >
                  Login to autofill
                </button>
              )}
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Full Name*</label>
                  <input
                    type="text"
                    className={`form-control ${formErrors.customerName ? 'is-invalid' : ''}`}
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                  />
                  {formErrors.customerName && (
                    <div className="invalid-feedback">{formErrors.customerName}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Email (Optional)</label>
                  <input
                    type="email"
                    className={`form-control ${formErrors.customerEmail ? 'is-invalid' : ''}`}
                    name="customerEmail"
                    value={formData.customerEmail}
                    onChange={handleInputChange}
                    placeholder="Enter your email for order updates"
                  />
                  {formErrors.customerEmail && (
                    <div className="invalid-feedback">{formErrors.customerEmail}</div>
                  )}
                  <small className="text-muted">
                    Enter your email to receive order updates (optional)
                  </small>
                </div>

                <div className="mb-3">
    <label className="form-label">Phone Number*</label>
    <input
        type="tel"
        className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
        name="phoneNumber"
        value={formData.phoneNumber}
        onChange={(e) => {
            // Only allow digits and limit to 8 characters
            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
            handleInputChange({
                target: {
                    name: 'phoneNumber',
                    value
                }
            });
        }}
        placeholder="Enter 8 digit phone number"
        required
        pattern="\d{8}"
        maxLength="8"
    />
    {formErrors.phoneNumber && (
        <div className="invalid-feedback">{formErrors.phoneNumber}</div>
    )}
</div>

                <div className="mb-3">
                  <label className="form-label">Delivery Address*</label>
                  <textarea
                    className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                  ></textarea>
                  {formErrors.address && (
                    <div className="invalid-feedback">{formErrors.address}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Special Instructions (Optional)</label>
                  <textarea
                    className="form-control"
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    rows="2"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    `Place Order ($${cartData.total.toFixed(2)})`
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h4>Order Summary</h4>
            </div>
            <div className="card-body">
              {cartItems.map(item => (
                <div key={item._id} className="d-flex justify-content-between mb-2">
                  <span>{item.name} x {item.quantity}</span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <hr />
              <div className="d-flex justify-content-between mb-2">
                <span>Subtotal</span>
                <span>${cartData.subtotal.toFixed(2)}</span>
              </div>
              {cartData.discount > 0 && (
                <div className="d-flex justify-content-between mb-2 text-success">
                  <span>
                    <i className="fas fa-tag me-1"></i>
                    Promo Discount ({cartData.discount}%)
                  </span>
                  <span>-${((cartData.subtotal * cartData.discount) / 100).toFixed(2)}</span>
                </div>
              )}
              <div className="d-flex justify-content-between mb-2">
                <span>Shipping</span>
                <span>${cartData.shipping.toFixed(2)}</span>
              </div>
              <hr />
              {cartData.discount > 0 ? (
                <>
                  <div className="d-flex justify-content-between mb-2">
                    <span>Original Total</span>
                    <span className="text-decoration-line-through text-muted">
                      ${cartData.originalTotal.toFixed(2)}
                    </span>
                  </div>
                </>
              ) : null}
              <div className="d-flex justify-content-between">
                <span className="fw-bold">Final Total</span>
                <span className="fw-bold">
                  ${cartData.total.toFixed(2)}
                </span>
              </div>
              {cartData.promoCode && (
                <div className="mt-3 p-2 bg-light rounded">
                  <small className="text-muted">
                    <i className="fas fa-ticket-alt me-1"></i>
                    Promo code applied: {cartData.promoCode}
                  </small>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => {
            setShowLoginModal(false);
            showNotification('Logged in successfully!', 'success');
          }}
        />
      )}
    </div>
  );
}

export default CheckoutPage;