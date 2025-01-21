// src/pages/PaymentPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import api from '../api/api';

function PaymentPage() {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cartData = localStorage.getItem('cartData');
    if (!cartData) {
      navigate('/cart');
    }
  }, [navigate]);

  const handleCashOnDelivery = async () => {
    try {
      setLoading(true);
      const cartData = JSON.parse(localStorage.getItem('cartData'));
      const deliveryInfo = cartData.deliveryInfo;

      const orderData = {
        ...cartData,
        paymentMethod: 'Cash on Delivery',
        status: 'Pending',
        deliveryAddress: deliveryInfo.address,
        phoneNumber: deliveryInfo.phone
      };

      const response = await api.createOrder(orderData);
      
      // Clear cart and localStorage
      clearCart();
      localStorage.removeItem('cartData');

      showNotification('Order placed successfully!', 'success');
      navigate(`/order-confirmation/${response.order._id}`);
    } catch (error) {
      showNotification('Failed to place order. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-white">
              <h4 className="mb-0">Payment Method</h4>
            </div>
            <div className="card-body">
              <div className="d-grid gap-3">
                <button 
                  className="btn btn-lg btn-primary"
                  onClick={handleCashOnDelivery}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Processing...
                    </>
                  ) : (
                    'Cash on Delivery'
                  )}
                </button>

                <button 
                  className="btn btn-outline-secondary"
                  onClick={() => navigate('/checkout/delivery')}
                >
                  Back to Delivery Information
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentPage;