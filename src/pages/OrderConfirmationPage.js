// src/pages/OrderConfirmationPage.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useNotification } from '../components/Notification/NotificationProvider';
import { getImageUrl } from '../utils/imageUtils';
import api from '../api/api';

function OrderConfirmationPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        // Try to fetch the order
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
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 className="text-xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-6">We couldn't find the order details you're looking for.</p>
          <Link to="/" className="inline-flex items-center justify-center px-5 py-2 border border-transparent text-base font-medium rounded-md text-white bg-purple-700 hover:bg-purple-800 transition-colors">
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Format date to a readable string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate totals
  const subtotal = Number(order.subtotal || 0);
  const shippingFee = Number(order.shippingFee || 0);
  const discountAmount = order.promoDiscount 
    ? ((subtotal * order.promoDiscount) / 100)
    : 0;
  const total = Number(order.totalAmount || 0);

  return (
    <div className="min-h-screen bg-gray-50 pt-6 pb-12">
      <div className="max-w-3xl mx-auto px-4">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="p-5 bg-gradient-to-r from-purple-600 to-purple-800 text-center">
            <div className="flex justify-center mb-3">
              <div className="rounded-full bg-white p-2">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-purple-100 text-base mb-2">Thank you for your purchase</p>
            <p className="text-white bg-white/20 py-1 px-3 rounded-full inline-block text-sm font-medium">
              Order #: {order.orderId}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-4 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-purple-800">Order Details</h2>
          </div>

          <div className="px-4 py-4">
            {/* Customer Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">delivery Information</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {order.customerName || 'N/A'}</p>
                  <p><span className="font-medium">Email:</span> {order.customerEmail || 'N/A'}</p>
                  <p><span className="font-medium">Phone:</span> {order.phoneNumber || 'N/A'}</p>
                  <p><span className="font-medium">Address:</span> {order.address || 'N/A'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Order Summary</h3>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}</p>
                  <p className="flex items-center">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                      ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                        order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                        order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'}`}>
                      {order.status || 'Processing'}
                    </span>
                  </p>
                  <p><span className="font-medium">Payment Method:</span> Cash on Delivery</p>
                </div>
              </div>
            </div>

            {/* Ordered Items */}
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Ordered Items</h3>
            
            <div className="border rounded-lg overflow-hidden mb-4">
              {/* Mobile view for products (shows on small screens) */}
              <div className="block md:hidden">
                {order.products && order.products.map((item, index) => 
                  item.product && (
                    <div key={index} className="p-4 border-b last:border-b-0">
                      <div className="flex items-start">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                          <img
                            src={item.product.images && item.product.images.length > 0
                              ? getImageUrl(item.product.images[0])
                              : 'https://placehold.co/60@3x.png'}
                            alt={item.product.name}
                            className="h-full w-full object-contain p-1"
                            onError={(e) => {
                              e.target.src = 'https://placehold.co/60@3x.png';
                            }}
                          />
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <div className="flex justify-between mt-1">
                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            <p className="text-sm font-medium">${(item.product.price * item.quantity).toFixed(2)}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Price: ${Number(item.product.price).toFixed(2)} each</p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>

              {/* Desktop view for products (shows on medium screens and up) */}
              <div className="hidden md:block">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.products && order.products.map((item, index) => (
                      item.product && (
                        <tr key={index}>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-gray-100">
                                <img
                                  src={item.product.images && item.product.images.length > 0
                                    ? getImageUrl(item.product.images[0])
                                    : 'https://placehold.co/60@3x.png'}
                                  alt={item.product.name}
                                  className="h-full w-full object-contain p-1"
                                  onError={(e) => {
                                    e.target.src = 'https://placehold.co/60@3x.png';
                                  }}
                                />
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">
                            {item.quantity}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-right">
                            ${Number(item.product.price).toFixed(2)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Order Totals */}
            <div className="bg-gray-50 rounded-lg overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium">${subtotal.toFixed(2)}</span>
                </div>
              </div>

              {order.promoDiscount > 0 && (
                <div className="px-4 py-3 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-green-600">Discount</span>
                    <span className="text-sm font-medium text-green-600">-${discountAmount.toFixed(2)}</span>
                  </div>
                </div>
              )}

              <div className="px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">delivery</span>
                  <span className="text-sm font-medium">${shippingFee.toFixed(2)}</span>
                </div>
              </div>

              <div className="px-4 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Special Instructions (if any) */}
            {order.specialInstructions && (
              <div className="mt-6">
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Special Instructions</h3>
                <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  {order.specialInstructions}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mb-6">
          <Link 
            to="/" 
            className="w-full sm:w-auto px-6 py-3 bg-purple-700 hover:bg-purple-800 text-white font-medium rounded-md shadow-sm transition-colors flex items-center justify-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Continue Shopping
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            {order.customerEmail 
              ? `A confirmation message will be sent to ${order.phoneNumber}.` 
              : `Your order information has been sent to ${order.phoneNumber}.`}
            <br />
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;