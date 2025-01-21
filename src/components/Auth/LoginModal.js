// src/components/Auth/LoginModal.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../Notification/NotificationProvider';
import './LoginModal.css';

function LoginModal({ onClose, onSuccess }) {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
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

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

// src/components/Auth/LoginModal.js
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
      onClose();

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
    <div className="modal-backdrop" onClick={(e) => {
      if (e.target.className === 'modal-backdrop') {
        onClose();
      }
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h5 className="modal-title">{isLogin ? 'Login' : 'Sign Up'}</h5>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          ></button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {/* Email Field */}
            <div className="mb-3">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className={`form-control ${formErrors.email ? 'is-invalid' : ''}`}
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
              {formErrors.email && (
                <div className="invalid-feedback">{formErrors.email}</div>
              )}
            </div>

            {/* Password Field */}
            <div className="mb-3">
              <label className="form-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className={`form-control ${formErrors.password ? 'is-invalid' : ''}`}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder={isLogin ? "Enter your password" : "Create a password (min. 6 characters)"}
                required
                minLength={6}
              />
              {formErrors.password && (
                <div className="invalid-feedback">{formErrors.password}</div>
              )}
            </div>

            {/* Registration Fields */}
            {!isLogin && (
              <>
                <div className="mb-3">
                  <label className="form-label" htmlFor="name">Full Name</label>
                  <input
                    id="name"
                    type="text"
                    className={`form-control ${formErrors.name ? 'is-invalid' : ''}`}
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter your full name"
                    required
                  />
                  {formErrors.name && (
                    <div className="invalid-feedback">{formErrors.name}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="phoneNumber">Phone Number</label>
                  <input
                    id="phoneNumber"
                    type="tel"
                    className={`form-control ${formErrors.phoneNumber ? 'is-invalid' : ''}`}
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    required
                  />
                  {formErrors.phoneNumber && (
                    <div className="invalid-feedback">{formErrors.phoneNumber}</div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label" htmlFor="address">Address</label>
                  <textarea
                    id="address"
                    className={`form-control ${formErrors.address ? 'is-invalid' : ''}`}
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your delivery address"
                    rows="3"
                    required
                  ></textarea>
                  {formErrors.address && (
                    <div className="invalid-feedback">{formErrors.address}</div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="modal-footer flex-column">
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {isLogin ? 'Logging in...' : 'Creating account...'}
                </>
              ) : (
                isLogin ? 'Login' : 'Sign Up'
              )}
            </button>

            <div className="text-center mt-3">
              {isLogin ? (
                <p className="mb-0">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => {
                      setIsLogin(false);
                      setFormErrors({});
                    }}
                  >
                    Sign Up
                  </button>
                </p>
              ) : (
                <p className="mb-0">
                  Already have an account?{' '}
                  <button
                    type="button"
                    className="btn btn-link p-0"
                    onClick={() => {
                      setIsLogin(true);
                      setFormErrors({});
                    }}
                  >
                    Login
                  </button>
                </p>
              )}
            </div>

            {isLogin && (
              <div className="text-center mt-2">
                <button
                  type="button"
                  className="btn btn-link p-0"
                  onClick={() => showNotification('Please contact support to reset your password', 'info')}
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