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
        // Try to fetch as guest order first
        const response = await api.getOrder(orderId);
        setOrder(response);
      } catch (error) {
        try {
          // If guest order fetch fails, try as authenticated order
          const response = await api.getOrder(orderId);
          setOrder(response);
        } catch (secondError) {
          showNotification('Failed to load order details', 'error');
        }
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
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
          <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Not Found</h2>
          <p className="text-gray-600 mb-8">We couldn't find the order details you're looking for.</p>
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
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

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-white p-3">
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Order Confirmed!</h1>
            <p className="text-green-100 text-lg mb-2">Thank you for your purchase</p>
            <p className="text-white bg-white/20 py-2 px-4 rounded-full inline-block font-medium">
              Order #: {order.orderId}
            </p>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="border-b border-gray-200">
            <div className="px-6 py-5">
              <h2 className="text-lg font-semibold text-gray-900">Order Details</h2>
            </div>
          </div>

          <div className="px-6 py-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Shipping Information</h3>
                <p className="text-gray-900 mb-1"><span className="font-medium">Name:</span> {order.customerName || 'N/A'}</p>
                <p className="text-gray-900 mb-1"><span className="font-medium">Email:</span> {order.customerEmail || 'N/A'}</p>
                <p className="text-gray-900 mb-1"><span className="font-medium">Phone:</span> {order.phoneNumber || 'N/A'}</p>
                <p className="text-gray-900 mb-1"><span className="font-medium">Address:</span> {order.address || 'N/A'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">Order Summary</h3>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Order Date:</span> {formatDate(order.createdAt)}
                </p>
                <p className="text-gray-900 mb-1">
                  <span className="font-medium">Status:</span> 
                  <span className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                      order.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'}`}>
                    {order.status || 'Processing'}
                  </span>
                </p>
                <p className="text-gray-900 mb-1"><span className="font-medium">Payment Method:</span> Cash on Delivery</p>
              </div>
            </div>

            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-4">Ordered Items</h3>
            
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {order.products && order.products.map((item, index) => (
                      item.product && (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-gray-100">
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
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.product.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                            ${Number(item.product.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50">
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-sm text-right font-medium text-gray-500">Subtotal:</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">${Number(order.subtotal).toFixed(2)}</td>
                    </tr>
                    {order.promoDiscount > 0 && (
                      <tr>
                        <td colSpan="3" className="px-6 py-4 text-sm text-right font-medium text-green-600">Discount:</td>
                        <td className="px-6 py-4 text-sm text-right font-medium text-green-600">-${((order.subtotal * order.promoDiscount) / 100).toFixed(2)}</td>
                      </tr>
                    )}
                    <tr>
                      <td colSpan="3" className="px-6 py-4 text-sm text-right font-medium text-gray-500">Shipping:</td>
                      <td className="px-6 py-4 text-sm text-right font-medium text-gray-900">${Number(order.shippingFee).toFixed(2)}</td>
                    </tr>
                    <tr className="bg-gray-100">
                      <td colSpan="3" className="px-6 py-4 text-base text-right font-bold text-gray-900">Total:</td>
                      <td className="px-6 py-4 text-base text-right font-bold text-gray-900">${Number(order.totalAmount).toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {order.specialInstructions && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">Special Instructions</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-700">
                  {order.specialInstructions}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
          <Link to="/" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 sm:w-auto w-full">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
            </svg>
            Continue Shopping
          </Link>
          <Link to="/orders" className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 sm:w-auto w-full">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
            </svg>
            View All Orders
          </Link>
        </div>

        {/* Thank You Message */}
        <div className="text-center">
          <p className="text-sm text-gray-500">
            A confirmation has been sent to {order.customerEmail || 'your phone number'}. 
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmationPage;