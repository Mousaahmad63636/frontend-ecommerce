// src/pages/OrderConfirmationPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotification } from '../components/Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import api from '../api/api';
import Loading from '../components/Loading/Loading';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await api.getOrder(orderId);
        setOrder(response);
      } catch (error) {
        showNotification('Failed to load order details', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      fetchOrder();
    }
  }, [orderId, showNotification]);

  if (loading) {
    return <Loading />;
  }

  if (!order) {
    return (
      <div className="container my-5 text-center">
        <div className="alert alert-danger">
          Order not found
        </div>
        <Link to="/" className="btn btn-primary">
          Return to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="container my-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-body text-center">
              <i className="fas fa-check-circle text-success mb-3" style={{ fontSize: '4rem' }}></i>
              <h2 className="card-title mb-4">Order Confirmed!</h2>
              <p className="lead">Thank you for your purchase</p>
              <div className="alert alert-info">
                Your order number is: <strong>{order.orderId}</strong>
              </div>
            </div>
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h4>Order Details</h4>
            </div>
            <div className="card-body">
              <div className="row mb-4">
                <div className="col-md-6">
                  <h5>Shipping Information</h5>
                  <p className="mb-1"><strong>Name:</strong> {order.customerName || 'N/A'}</p>
                  <p className="mb-1"><strong>Email:</strong> {order.customerEmail || 'N/A'}</p>
                  <p className="mb-1"><strong>Phone:</strong> {order.phoneNumber || 'N/A'}</p>
                  <p className="mb-1"><strong>Address:</strong> {order.address || 'N/A'}</p>
                </div>
                <div className="col-md-6">
                  <h5>Order Summary</h5>
                  <p className="mb-1">
                    <strong>Order Date:</strong> {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                  </p>
                  <p className="mb-1"><strong>Status:</strong> {order.status || 'Processing'}</p>
                  <p className="mb-1"><strong>Payment Method:</strong> Cash on Delivery</p>
                </div>
              </div>

              <h5>Ordered Items</h5>
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Quantity</th>
                      <th className="text-end">Price</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.products && order.products.map((item, index) => (
                      item.product && (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              <img
                                src={getImageUrl(item.product.image)}
                                alt={item.product.name}
                                style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                                className="me-2 rounded"
                                onError={(e) => {
                                  e.target.src = 'https://via.placeholder.com/50';
                                }}
                              />
                              <span>{item.product.name}</span>
                            </div>
                          </td>
                          <td>{item.quantity}</td>
                          <td className="text-end">${Number(item.product.price).toFixed(2)}</td>
                          <td className="text-end">${(item.product.price * item.quantity).toFixed(2)}</td>
                        </tr>
                      )
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Subtotal:</strong></td>
                      <td className="text-end">${Number(order.subtotal).toFixed(2)}</td>
                    </tr>
                    {order.promoDiscount > 0 && (
                      <tr>
                        <td colSpan="3" className="text-end"><strong>Discount:</strong></td>
                        <td className="text-end">-${((order.subtotal * order.promoDiscount) / 100).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Shipping:</strong></td>
                      <td className="text-end">${Number(order.shippingFee).toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan="3" className="text-end"><strong>Total:</strong></td>
                      <td className="text-end"><strong>${Number(order.totalAmount).toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {order.specialInstructions && (
                <div className="mt-4">
                  <h5>Special Instructions</h5>
                  <p className="mb-0">{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-4">
            <Link to="/" className="btn btn-primary me-3">
              Continue Shopping
            </Link>
            <Link to="/orders" className="btn btn-outline-primary">
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;