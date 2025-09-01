// src/pages/CheckoutPage.js
import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from '../components/Auth/LoginModal';
import api from '../api/api';
import { getImageUrl } from '../utils/imageUtils';

function CheckoutPage() {
  const { cartItems, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [cartData, setCartData] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formErrors, setFormErrors] = useState({});

  const placeholderStyles = `
  .faded-placeholder::placeholder {
    color: #9ca3af !important; /* Light grey color */
    opacity: 0.6 !important;
    font-style: italic;
  }
`;
  // Form state
  const [formData, setFormData] = useState({
    customerName: '',
    // customerEmail: '', // Commented out email field
    phoneNumber: '',
    address: '',
    specialInstructions: ''
  });

  // Load cart data
  useEffect(() => {
    const savedCartData = localStorage.getItem('cartData');
    if (savedCartData) {
      setCartData(JSON.parse(savedCartData));
    } else {
      navigate('/cart');
    }
    
    // Load saved customer info if available
    const savedCustomerInfo = localStorage.getItem('customerInfo');
    if (savedCustomerInfo) {
      setFormData(JSON.parse(savedCustomerInfo));
    } else if (isAuthenticated && user) {
      setFormData({
        customerName: user.name || '',
        // customerEmail: user.email || '', // Commented out email field
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        specialInstructions: ''
      });
    }
  }, [navigate, isAuthenticated, user]);

  // Save customer info when it changes
  useEffect(() => {
    if (formData.customerName) { // Removed email check
      localStorage.setItem('customerInfo', JSON.stringify(formData));
    }
  }, [formData]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      // Only allow digits and limit to 8 characters
      const sanitizedValue = value.replace(/\D/g, '').substring(0, 8);
      setFormData(prev => ({ ...prev, [name]: sanitizedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear error when field is modified
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};

    // Required fields
    if (!formData.customerName?.trim()) {
      errors.customerName = 'Full name is required';
    }

    if (!formData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    } else if (formData.phoneNumber.length !== 8) {
      errors.phoneNumber = 'Phone number must be exactly 8 digits';
    }

    if (!formData.address?.trim()) {
      errors.address = 'Delivery address is required';
    }

    // Email validation removed

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification('Please fill in all required fields correctly', 'error');
      return;
    }

    try {
      setLoading(true);
      
      // Updated mapping to include selectedColor and selectedSize
      const orderData = {
        products: cartItems.map(item => ({
          product: item.product?._id || item._id, // Handle both possible structures
          quantity: item.quantity,
          price: item.price,
          selectedColor: item.selectedColor || '', // Add color selection
          selectedSize: item.selectedSize || ''    // Add size selection
        })),
        subtotal: cartData.subtotal,
        shippingFee: cartData.shipping,
        totalAmount: cartData.total,
        customerName: formData.customerName.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        address: formData.address.trim(),
        specialInstructions: formData.specialInstructions,
        customerEmail: '', // Empty string instead of formData.customerEmail
        promoCode: cartData.promoCode || null,
        promoDiscount: cartData.discount ? {
          type: 'percentage',
          value: Number(cartData.discount)
        } : null
      };

      console.log('Sending order with products:', orderData.products);
      const response = await api.createGuestOrder(orderData);

      clearCart();
      localStorage.removeItem('cartData');

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

  // Show login modal
  const handleLoginClick = () => {
    setShowLoginModal(true);
  };

  // Loading state
  if (!cartData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
       <style>{placeholderStyles}</style>
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <button 
            onClick={() => navigate('/cart')}
            className="mb-2 inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800"
          >
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
            </svg>
            Back to Cart
          </button>
          <h1 className="text-2xl font-bold text-purple-800">Checkout</h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Order Summary - First on mobile */}
          <div className="w-full lg:w-1/3 order-1 lg:order-2">
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h2 className="text-lg font-bold text-purple-800 pb-3 border-b border-gray-100">
                Order Summary
              </h2>
              
              <div className="mt-4 space-y-3">
                {cartItems.map((item) => (
                  <div key={item._id || item.product?._id} className="flex items-center">
                    <div className="h-16 w-16 flex-shrink-0 rounded-md border border-gray-200 overflow-hidden">
                      <img
                        src={item.images && item.images.length > 0 
                          ? getImageUrl(item.images[0]) 
                          : (item.product?.images && item.product.images.length > 0
                              ? getImageUrl(item.product.images[0])
                              : 'https://placehold.co/60x60')}
                        alt={item.name || item.product?.name}
                        className="h-full w-full object-cover"
                        onError={(e) => { e.target.src = 'https://placehold.co/60x60'; }}
                      />
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{item.name || item.product?.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      {/* Display selected color and size if available */}
                      {item.selectedColor && (
                        <p className="text-xs text-gray-500">Color: {item.selectedColor}</p>
                      )}
                      {item.selectedSize && (
                        <p className="text-xs text-gray-500">Size: {item.selectedSize}</p>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${cartData.subtotal.toFixed(2)}</span>
                </div>
                
                {cartData.discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                      </svg>
                      Discount ({cartData.discount}%)
                    </span>
                    <span>-${((cartData.subtotal * cartData.discount) / 100).toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">delivery</span>
                  <span>${cartData.shipping.toFixed(2)}</span>
                </div>
                
                {cartData.promoCode && (
                  <div className="bg-purple-50 text-purple-700 p-2 rounded-md text-xs mt-3">
                    <span className="font-medium">Promo code applied:</span> {cartData.promoCode}
                  </div>
                )}
                
                <div className="pt-4 mt-2 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-gray-900">${cartData.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-100 p-3 rounded-lg text-xs text-gray-600 flex items-center">
              <svg className="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
              </svg>
              Secure checkout powered by our trusted payment processor
            </div>
          </div>

          {/* Customer Information - Second on mobile */}
          <div className="w-full lg:w-2/3 order-2 lg:order-1">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <h2 className="text-lg font-bold text-purple-800">Customer Information</h2>
              </div>

              <form onSubmit={handleSubmit} className="mt-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.customerName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 faded-placeholder`}
                      placeholder="Enter your full name"
                    />
                    {formErrors.customerName && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.customerName}</p>
                    )}
                  </div>

                  {/* Email field removed */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number<span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border ${formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 faded-placeholder`}
                      placeholder="8-digit phone number"
                    />
                    {formErrors.phoneNumber && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Delivery Address<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows="3"
                      className={`w-full px-3 py-2 border ${formErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 faded-placeholder`}
                      placeholder="Enter your complete delivery address"
                    ></textarea>
                    {formErrors.address && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Special Instructions (Optional)
                    </label>
                    <textarea
                      name="specialInstructions"
                      value={formData.specialInstructions}
                      onChange={handleInputChange}
                      rows="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 faded-placeholder"
                      placeholder="Any special delivery instructions"
                    ></textarea>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={`w-full py-3 px-4 ${loading ? 'bg-purple-400' : 'bg-purple-700 hover:bg-purple-800'} text-white font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors`}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing Order...
                        </span>
                      ) : (
                        `Place Order - $${cartData.total.toFixed(2)}`
                      )}
                    </button>
                  </div>

                  <div className="text-center text-xs text-gray-500">
                    By placing your order, you agree to our
                    <a href="#" className="text-purple-600"> Terms of Service </a>
                    and
                    <a href="#" className="text-purple-600"> Privacy Policy</a>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Login Modal */}
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