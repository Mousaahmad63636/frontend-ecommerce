// src/components/Auth/LoginModal.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../Notification/NotificationProvider';

function LoginModal({ onClose = () => {}, onSuccess = () => {}, initialMode = 'login' }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    phoneNumber: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const { login, register } = useAuth();
  const { showNotification } = useNotification();
  const [showPassword, setShowPassword] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email) && !isLogin) {
      // Only strictly validate email format on registration
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        errors.name = 'Name is required';
      }
      if (!formData.phoneNumber) {
        errors.phoneNumber = 'Phone number is required';
      } else if (!/^\d{8}$/.test(formData.phoneNumber)) {
        errors.phoneNumber = 'Phone number must be exactly 8 digits';
      }
      if (!formData.address) {
        errors.address = 'Address is required';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phoneNumber') {
      const sanitizedValue = value.replace(/\D/g, '').slice(0, 8);
      setFormData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      let user = isLogin ? 
          await login(formData.email, formData.password) :
          await register(formData);

      if (onSuccess) onSuccess();
      navigate('/');
      if (onClose) onClose();

    } catch (error) {
      console.error('Auth error:', error);
      showNotification(
          error.response?.data?.message || error.message || 'Authentication failed',
          'error'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    // Modal overlay - fixed position covering entire viewport with semi-transparent background
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Modal content */}
      <div 
        className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto relative animate-[fadeIn_0.3s]"
        role="dialog" 
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex justify-between items-center p-5 border-b border-gray-200">
          <h3 
            id="modal-title" 
            className="text-xl font-semibold text-purple-800"
          >
            {isLogin ? 'Log in to Exclusive' : 'Sign Up for Exclusive'}
          </h3>
          <button 
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-purple-700 transition-colors text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5" noValidate>
          {/* Email field */}
          <div className="mb-4">
            <label 
              htmlFor="email" 
              className="block text-sm font-medium text-purple-800 mb-1"
            >
              {isLogin ? 'Email or Phone Number *' : 'Email *'}
            </label>
            <input
              id="email"
              type={isLogin ? "text" : "email"}
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder={isLogin ? "Enter your email or phone number" : "Enter your email"}
              required
              aria-describedby={formErrors.email ? "email-error" : undefined}
              autoComplete={isLogin ? "username" : "email"}
              className={`w-full px-4 py-3 rounded-lg border ${
                formErrors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
            />
            {formErrors.email && (
              <p id="email-error" className="mt-1 text-sm text-red-500">
                {formErrors.email}
              </p>
            )}
          </div>

          {/* Password field */}
          <div className="mb-4">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-purple-800 mb-1"
            >
              Password *
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
                required
                minLength={6}
                aria-describedby={formErrors.password ? "password-error" : undefined}
                autoComplete={isLogin ? "current-password" : "new-password"}
                className={`w-full px-4 py-3 rounded-lg border ${
                  formErrors.password ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-purple-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
              </button>
            </div>
            {formErrors.password && (
              <p id="password-error" className="mt-1 text-sm text-red-500">
                {formErrors.password}
              </p>
            )}
          </div>

          {/* Registration fields */}
          {!isLogin && (
            <div className="space-y-4 animate-[fadeIn_0.3s]">
              <div>
                <label 
                  htmlFor="name" 
                  className="block text-sm font-medium text-purple-800 mb-1"
                >
                  Full Name *
                </label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                  aria-describedby={formErrors.name ? "name-error" : undefined}
                  autoComplete="name"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.name ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                {formErrors.name && (
                  <p id="name-error" className="mt-1 text-sm text-red-500">
                    {formErrors.name}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="phoneNumber" 
                  className="block text-sm font-medium text-purple-800 mb-1"
                >
                  Phone Number *
                </label>
                <input
                  id="phoneNumber"
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 8-digit phone number"
                  required
                  aria-describedby={formErrors.phoneNumber ? "phone-error" : undefined}
                  autoComplete="tel"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                {formErrors.phoneNumber && (
                  <p id="phone-error" className="mt-1 text-sm text-red-500">
                    {formErrors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label 
                  htmlFor="address" 
                  className="block text-sm font-medium text-purple-800 mb-1"
                >
                  Address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Enter your delivery address"
                  rows="3"
                  required
                  aria-describedby={formErrors.address ? "address-error" : undefined}
                  autoComplete="street-address"
                  className={`w-full px-4 py-3 rounded-lg border ${
                    formErrors.address ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                ></textarea>
                {formErrors.address && (
                  <p id="address-error" className="mt-1 text-sm text-red-500">
                    {formErrors.address}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-6 flex flex-col items-center border-t border-gray-200 pt-5">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-full font-medium text-white 
                ${loading 
                  ? 'bg-purple-400 cursor-not-allowed' 
                  : 'bg-purple-700 hover:bg-purple-800 hover:shadow-lg transform hover:-translate-y-0.5'
                } 
                transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Log In' : 'Sign Up'
              )}
            </button>

            <div className="mt-4 text-center">
              {isLogin ? (
                <p className="text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(false);
                      setFormErrors({});
                    }}
                    className="text-purple-700 font-medium hover:text-purple-900 hover:underline focus:outline-none"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(true);
                      setFormErrors({});
                    }}
                    className="text-purple-700 font-medium hover:text-purple-900 hover:underline focus:outline-none"
                  >
                    Login
                  </button>
                </p>
              )}
            </div>

            {isLogin && (
              <div className="mt-2 text-center">
                <button
                  type="button"
                  onClick={() => showNotification('Please contact support to reset your password', 'info')}
                  className="text-purple-700 text-sm hover:text-purple-900 hover:underline focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default LoginModal;