// src/pages/DeliveryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import { CheckoutStepsContext } from '../App';

function DeliveryPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showNotification } = useNotification();
  const { setCurrentStep, steps } = useContext(CheckoutStepsContext);
  
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    phone: '',
    deliveryNotes: ''
  });

  useEffect(() => {
    const cartData = localStorage.getItem('cartData');
    if (!cartData) {
      navigate('/cart');
      return;
    }

    if (user) {
      setFormData(prev => ({
        ...prev,
        address: user.address || '',
        phone: user.phoneNumber || ''
      }));
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save delivery information
    const cartData = JSON.parse(localStorage.getItem('cartData'));
    localStorage.setItem('cartData', JSON.stringify({
      ...cartData,
      deliveryInfo: formData
    }));

    setCurrentStep(steps.CHECKOUT);
    navigate('/checkout');
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-white">
              <h4 className="mb-0">Delivery Information</h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Delivery Address</label>
                  <textarea 
                    className="form-control"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows="3"
                    required
                  />
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">City</label>
                    <input 
                      type="text"
                      className="form-control"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Postal Code</label>
                    <input 
                      type="text"
                      className="form-control"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Phone Number</label>
                  <input 
                    type="tel"
                    className="form-control"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Delivery Notes (Optional)</label>
                  <textarea 
                    className="form-control"
                    name="deliveryNotes"
                    value={formData.deliveryNotes}
                    onChange={handleInputChange}
                    rows="2"
                    placeholder="Any specific delivery instructions?"
                  />
                </div>

                <div className="d-grid gap-2">
                  <button type="submit" className="btn btn-primary">
                    Continue to Checkout
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-outline-secondary"
                    onClick={() => navigate('/cart')}
                  >
                    Back to Cart
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeliveryPage;