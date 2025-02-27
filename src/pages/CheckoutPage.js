import React, { useState, useEffect } from 'react';
import { useCart } from '../contexts/CartContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import LoginModal from '../components/Auth/LoginModal';
import api from '../api/api';
import { getImageUrl } from '../utils/imageUtils';

// Validation function
const validatePhoneNumber = (phone) => {
  const phoneRegex = /^\d{8}$/;  // Exactly 8 digits
  return phoneRegex.test(phone);
};

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
        specialInstructions: formData.specialInstructions,
        customerEmail: formData.customerEmail?.trim() || '',
        promoCode: cartData.promoCode || null,
        promoDiscount: cartData.discount ? {
          type: 'percentage',
          value: Number(cartData.discount)
        } : null
      };

      // Use guest order API endpoint
      const response = await api.createGuestOrder(orderData);

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
    <div className="bg-gray-50 min-h-screen pt-6 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Checkout Header */}
        <div className="max-w-3xl mx-auto mb-8">
          <h1 className="text-3xl font-bold text-gray-900 text-center">Checkout</h1>
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
              </svg>
              Back to Cart
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Customer Information */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Shipping Information</h2>
                  {!isAuthenticated && (
                    <button
                      onClick={handleLoginClick}
                      className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-800"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                      </svg>
                      Sign in for faster checkout
                    </button>
                  )}
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="col-span-2">
                      <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formErrors.customerName ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        placeholder="Enter your full name"
                      />
                      {formErrors.customerName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.customerName}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        id="customerEmail"
                        name="customerEmail"
                        value={formData.customerEmail}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formErrors.customerEmail ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        placeholder="Enter your email address"
                      />
                      {formErrors.customerEmail && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.customerEmail}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">For order confirmation and updates</p>
                    </div>

                    <div>
                      <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number<span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        id="phoneNumber"
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
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        placeholder="Enter 8-digit phone number"
                        maxLength="8"
                      />
                      {formErrors.phoneNumber && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.phoneNumber}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">For delivery coordination</p>
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                        Delivery Address<span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows="3"
                        className={`w-full px-4 py-3 rounded-lg border ${
                          formErrors.address ? 'border-red-500' : 'border-gray-300'
                        } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                        placeholder="Enter your complete delivery address"
                      ></textarea>
                      {formErrors.address && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.address}</p>
                      )}
                    </div>

                    <div className="col-span-2">
                      <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-700 mb-1">
                        Special Instructions (Optional)
                      </label>
                      <textarea
                        id="specialInstructions"
                        name="specialInstructions"
                        value={formData.specialInstructions}
                        onChange={handleInputChange}
                        rows="2"
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="Any special instructions for delivery or order"
                      ></textarea>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-6 rounded-lg text-white font-medium ${
                      loading ? 'bg-gray-500 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
                    } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing Order...
                      </div>
                    ) : (
                      `Place Order - $${cartData.total.toFixed(2)}`
                    )}
                  </button>

                  <p className="mt-4 text-center text-sm text-gray-500">
                    By placing your order, you agree to our 
                    <a href="#" className="text-indigo-600 hover:text-indigo-800"> Terms of Service </a> 
                    and 
                    <a href="#" className="text-indigo-600 hover:text-indigo-800"> Privacy Policy</a>
                  </p>
                </form>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-6 sticky top-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
                
                <div className="flow-root">
                  <ul className="-my-6 divide-y divide-gray-200">
                    {cartItems.map((item) => (
                      <li key={item._id} className="py-4 flex">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-100">
                          <img
                            src={item.images && item.images.length > 0 
                              ? getImageUrl(item.images[0]) 
                              : 'https://placehold.co/60@3x.png'}
                            alt={item.name}
                            className="h-full w-full object-contain p-1"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/60@3x.png';
                            }}
                          />
                        </div>
                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-sm font-medium text-gray-900">
                              <h3 className="line-clamp-1">{item.name}</h3>
                              <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                            </div>
                            <p className="mt-1 text-sm text-gray-500">Qty: {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <div className="flex justify-between text-sm mb-2">
                    <p className="text-gray-600">Subtotal</p>
                    <p className="font-medium text-gray-900">${cartData.subtotal.toFixed(2)}</p>
                  </div>
                  
                  {cartData.discount > 0 && (
                    <div className="flex justify-between text-sm mb-2 text-green-600">
                      <p className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                        </svg>
                        Discount ({cartData.discount}%)
                      </p>
                      <p className="font-medium">-${((cartData.subtotal * cartData.discount) / 100).toFixed(2)}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm mb-2">
                    <p className="text-gray-600">Shipping</p>
                    <p className="font-medium text-gray-900">${cartData.shipping.toFixed(2)}</p>
                  </div>

                  {cartData.promoCode && (
                    <div className="flex items-center mt-4 p-2 bg-indigo-50 rounded-md text-xs text-indigo-700">
                      <svg className="w-4 h-4 mr-1 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      Promo code <span className="font-semibold mx-1">{cartData.promoCode}</span> applied
                    </div>
                  )}

                  <div className="flex justify-between text-base font-medium text-gray-900 mt-4 pt-4 border-t border-gray-200">
                    <p>Total</p>
                    <p>${cartData.total.toFixed(2)}</p>
                  </div>
                </div>

                {cartData.discount > 0 && (
                  <div className="mt-6 rounded-md bg-green-50 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-green-800">
                          You saved ${((cartData.subtotal * cartData.discount) / 100).toFixed(2)}!
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6">
                  <div className="flex items-center justify-center bg-gray-50 rounded-md p-3">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                    </svg>
                    <span className="text-xs text-gray-500">Secure checkout powered by our payment processor</span>
                  </div>
                </div>
              </div>
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