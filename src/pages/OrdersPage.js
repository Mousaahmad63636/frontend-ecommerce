// src/pages/OrdersPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import api from '../api/api';
import { getImageUrl } from '../utils/imageUtils';
function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await api.getUserOrders();
        setOrders(response);
      } catch (error) {
        showNotification('Failed to load orders', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [showNotification]);

  if (loading) {
    return (
      <div className="container mt-4 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <h2>No Orders Found</h2>
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn btn-primary mt-3">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Orders</h2>
      <div className="row">
        {orders.map(order => (
          <div key={order._id} className="col-12 mb-4">
            <div className="card">
              <div className="card-header bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Order #{order.orderId}</span>
                  <span className={`badge ${order.status === 'Delivered' ? 'bg-success' :
                      order.status === 'Cancelled' ? 'bg-danger' :
                        order.status === 'Shipped' ? 'bg-info' :
                          'bg-warning'
                    }`}>
                    {order.status}
                  </span>
                </div>
                <small className="text-muted">
                  Placed on: {new Date(order.createdAt).toLocaleDateString()} at{' '}
                  {new Date(order.createdAt).toLocaleTimeString()}
                </small>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    <h5 className="mb-3">Products</h5>
                    {order.products.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <img
                          src={getImageUrl(item.product.image)}
                          alt={item.product.name}
                          style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                          className="me-2 rounded"
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/60@3x.png';
                          }}
                        />
                        <div>
                          <div>{item.product.name}</div>
                          <small className="text-muted">
                            Quantity: {item.quantity} x ${item.product.price}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-4">
                    <h5 className="mb-3">Order Summary</h5>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span>${order.subtotal.toFixed(2)}</span>
                    </div>
                    {order.promoDiscount > 0 && (
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <span>Discount:</span>
                        <span>-${((order.subtotal * order.promoDiscount) / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="d-flex justify-content-between mb-2">
                      <span>delivery:</span>
                      <span>${order.shippingFee.toFixed(2)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold">
                      <span>Total:</span>
                      <span>${order.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="mt-3">
                    <h6>Special Instructions:</h6>
                    <p className="mb-0">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
              <div className="card-footer">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="mb-1">delivery Address:</h6>
                    <p className="mb-0 small">{order.address}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <h6 className="mb-1">Contact:</h6>
                    <p className="mb-0 small">
                      {order.phoneNumber}<br />
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default OrdersPage;