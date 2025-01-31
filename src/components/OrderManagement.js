import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';
import api from '../api/api';
import { getImageUrl } from '../utils/imageUtils';

function OrderManagement() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showNotification } = useNotification();

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [searchBy, setSearchBy] = useState('orderId');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFilter, setDateFilter] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [settings, setSettings] = useState({
    whatsappMessageTemplate: {
      english: '',
      arabic: ''
    }
  });

  const statusColors = {
    Pending: 'bg-warning',
    Confirmed: 'bg-info',
    Shipped: 'bg-primary',
    Delivered: 'bg-success',
    Cancelled: 'bg-danger'
  };

  // Helper function for number formatting
  const safeToFixed = (number, decimals = 2) => {
    if (!number || isNaN(number)) return '0.00';
    return Number(number).toFixed(decimals);
  };

  useEffect(() => {
    fetchSettings();
    fetchOrders();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.getSettings();
      setSettings(response);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getOrders();
      setOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders');
      showNotification('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByDate = (orders) => {
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    switch (dateFilter) {
      case 'day':
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'month':
        start.setDate(1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(end.getMonth() + 1);
        end.setDate(0);
        end.setHours(23, 59, 59, 999);
        break;
      case 'year':
        start.setMonth(0, 1);
        start.setHours(0, 0, 0, 0);
        end.setMonth(11, 31);
        end.setHours(23, 59, 59, 999);
        break;
      default:
        return orders;
    }

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= start && orderDate <= end;
    });
  };

  const sortOrders = (orders) => {
    return [...orders].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
          break;
        case 'total':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = new Date(a.createdAt) - new Date(b.createdAt);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showNotification('Order status updated successfully', 'success');

      if (newStatus === 'Confirmed') {
        const order = orders.find(o => o._id === orderId);
        if (order) {
          handleWhatsAppMessage(order, 'confirmed');
        }
      }

      fetchOrders();
    } catch (err) {
      console.error('Error updating order status:', err);
      showNotification('Failed to update order status', 'error');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await api.deleteOrder(orderId);
        showNotification('Order deleted successfully', 'success');
        fetchOrders();
      } catch (err) {
        console.error('Error deleting order:', err);
        showNotification('Failed to delete order', 'error');
      }
    }
  };

  const getDefaultMessage = (order, type, orderDetails, deliveryFee, totalWithDelivery, discount) => {
    const headerDivider = '──────────────';
    const footerDivider = '──────────────';

    switch (type) {
      case 'pending':
        return `🛍️ *طلب جديد*
${headerDivider}

مرحباً ${order.customerName}! 👋

تم استلام طلبك بنجاح ✅
رقم الطلب: #${order.orderId}

${headerDivider}
*تفاصيل الطلب:*

${orderDetails}

${footerDivider}
*ملخص الطلب:*
💰 المجموع الفرعي: ${safeToFixed(order.subtotal)}$
${discount ? `💎 الخصم: -${safeToFixed(discount)}$\n` : ''}
🚚 رسوم التوصيل: ${safeToFixed(deliveryFee)}$
*المجموع النهائي: ${safeToFixed(totalWithDelivery)}$*

${headerDivider}
${order.address ? `📍 عنوان التوصيل:\n${order.address}\n\n` : ''}
سنقوم بإعلامك عندما يتم تأكيد طلبك 🚀

شكراً لثقتك بنا! 🙏`;

      case 'confirmed':
        return `✨ *تم تأكيد الطلب*
${headerDivider}

مرحباً ${order.customerName}! 👋

يسعدنا إخبارك بأنه تم تأكيد طلبك ✅
رقم الطلب: #${order.orderId}

${headerDivider}
*تفاصيل الطلب:*

${orderDetails}

${footerDivider}
*المجموع النهائي مع التوصيل: ${safeToFixed(totalWithDelivery)}$*

${order.address ? `📍 عنوان التوصيل:\n${order.address}\n\n` : ''}
سنبدأ بتجهيز طلبك للشحن 📦
نقدر ثقتك بنا 🙏`;

      case 'shipped':
        return `🚚 *تم شحن الطلب*
${headerDivider}

مرحباً ${order.customerName}! 👋

نود إعلامك بأنه تم شحن طلبك 📦
رقم الطلب: #${order.orderId}

${headerDivider}
*تفاصيل الطلب:*

${orderDetails}

${footerDivider}
*المجموع النهائي مع التوصيل: ${safeToFixed(totalWithDelivery)}$*

${order.address ? `📍 عنوان التوصيل:\n${order.address}\n\n` : ''}
طلبك في الطريق إليك! 🚀
شكراً لصبرك وثقتك بنا 🙏`;

      default:
        return `📝 *تحديث الطلب*
${headerDivider}

مرحباً ${order.customerName}! 👋

هذا تحديث بخصوص طلبك:
رقم الطلب: #${order.orderId}
الحالة: ${order.status}

${headerDivider}
*تفاصيل الطلب:*

${orderDetails}

${footerDivider}
*المجموع النهائي مع التوصيل: ${safeToFixed(totalWithDelivery)}$*

${order.address ? `📍 عنوان التوصيل:\n${order.address}\n\n` : ''}
شكراً لتسوقك معنا! 🙏`;
    }
  };

  const handleWhatsAppMessage = (order, type = 'pending') => {
    // Calculate the subtotal directly from products
    const subtotal = order.products.reduce((sum, item) => 
      sum + (item.product?.price || 0) * item.quantity, 0
    );
  
    // Format order details for both languages
    const orderDetailsEnglish = order.products.map(item =>
      `📦 ${item.product?.name || ''}
        Price: $${safeToFixed(item.product?.price)} × ${item.quantity}
        Total: $${safeToFixed((item.product?.price || 0) * item.quantity)}`
    ).join('\n');
  
    const orderDetailsArabic = order.products.map(item =>
      `📦 ${item.product?.name || ''}
        القيمة: ${safeToFixed(item.product?.price)}$ × ${item.quantity}
        المجموع: ${safeToFixed((item.product?.price || 0) * item.quantity)}$`
    ).join('\n');
  
    // Calculate final values
    const deliveryFee = order.shippingFee;
    const totalWithDelivery = subtotal + deliveryFee; // Correct total calculation
    const discount = order.promoDiscount ? (subtotal * order.promoDiscount) / 100 : 0;
    const finalTotal = totalWithDelivery - discount; // Final total with discount
  
    // Replace variables in English template
    let englishMessage = englishTemplate
      .replace('{{customerName}}', order.customerName)
      .replace('{{orderId}}', order.orderId)
      .replace('{{orderDetails}}', orderDetailsEnglish)
      .replace('{{subtotal}}', safeToFixed(subtotal))
      .replace('{{deliveryFee}}', safeToFixed(deliveryFee))
      .replace('{{total}}', safeToFixed(finalTotal)) // Use final total
      .replace('{{address}}', order.address || '')
      .replace('{{discount}}', discount ? `💎 Discount: -$${safeToFixed(discount)}\n` : '');
  
    // Replace variables in Arabic template
    let arabicMessage = arabicTemplate
      .replace('{{customerName}}', order.customerName)
      .replace('{{orderId}}', order.orderId)
      .replace('{{orderDetails}}', orderDetailsArabic)
      .replace('{{subtotal}}', safeToFixed(subtotal))
      .replace('{{deliveryFee}}', safeToFixed(deliveryFee))
      .replace('{{total}}', safeToFixed(finalTotal)) // Use final total
      .replace('{{address}}', order.address || '')
      .replace('{{discount}}', discount ? `💎 الخصم: -${safeToFixed(discount)}$\n` : '');
  
    // Combine messages and send
    const combinedMessage = englishTemplate ? 
      `${englishMessage}\n\n${arabicMessage}` : 
      arabicMessage;
  
    const phoneNumber = order.phoneNumber.replace(/\D/g, '');
    const whatsappURL = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(combinedMessage)}`;
    window.open(whatsappURL, '_blank', 'noopener,noreferrer');
  };
  const filteredOrders = sortOrders(
    filterOrdersByDate(orders).filter(order => {
      const matchesStatus = statusFilter === 'all' ? true : order.status.toLowerCase() === statusFilter;
      const matchesSearch = searchTerm === '' || (
        searchBy === 'orderId' ? String(order.orderId).toLowerCase().includes(searchTerm.toLowerCase()) :
          searchBy === 'name' ? String(order.customerName).toLowerCase().includes(searchTerm.toLowerCase()) :
            searchBy === 'phone' ? String(order.phoneNumber).includes(searchTerm) : true
      );
      return matchesStatus && matchesSearch;
    })
  );

  if (loading) {
    return (
      <div className="text-center my-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-management">
      <div className="card mb-4">
        <div className="card-header bg-white">
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Order Management</h4>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary"
                onClick={fetchOrders}
              >
                <i className="fas fa-sync-alt me-1"></i> Refresh
              </button>
            </div>
          </div>
        </div>
        <div className="card-body">
          <div className="row g-3">
            {/* Search Controls */}
            <div className="col-md-4">
              <div className="input-group">
                <select
                  className="form-select flex-shrink-1"
                  style={{ maxWidth: '120px' }}
                  value={searchBy}
                  onChange={(e) => setSearchBy(e.target.value)}
                >
                  <option value="orderId">Order ID</option>
                  <option value="name">Customer</option>
                  <option value="phone">Phone</option>
                </select>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search by ${searchBy}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setSearchTerm('')}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="col-md-3">
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="col-md-3">
              <div className="input-group">
                <select
                  className="form-select flex-shrink-1"
                  style={{ maxWidth: '120px' }}
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="day">Daily</option>
                  <option value="month">Monthly</option>
                  <option value="year">Yearly</option>
                </select>

                {dateFilter === 'day' && (
                  <input
                    type="date"
                    className="form-control"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                  />
                )}

                {dateFilter === 'month' && (
                  <input
                    type="month"
                    className="form-control"
                    value={`${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}`}
                    onChange={(e) => setSelectedDate(new Date(e.target.value + '-01'))}
                  />
                )}

                {dateFilter === 'year' && (
                  <input
                    type="number"
                    className="form-control"
                    value={selectedDate.getFullYear()}
                    onChange={(e) => setSelectedDate(new Date(e.target.value, 0, 1))}
                    min="2000"
                    max="2100"
                  />
                )}
              </div>
            </div>

            {/* Sort Controls */}
            <div className="col-md-2">
              <select
                className="form-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="total-desc">Highest Amount</option>
                <option value="total-asc">Lowest Amount</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>

            {/* Date Range Display */}
            <div className="col-12">
              <small className="text-muted">
                {dateFilter === 'day' && `Showing orders for ${selectedDate.toLocaleDateString()}`}
                {dateFilter === 'month' && `Showing orders for ${selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}`}
                {dateFilter === 'year' && `Showing orders for ${selectedDate.getFullYear()}`}
                {` - ${filteredOrders.length} of ${orders.length} orders`}
              </small>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card">
        <div className="card-body">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
              <h5>No Orders Found</h5>
              <p className="text-muted">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'No orders have been placed yet'}
              </p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order._id}>
                      <td>
                        <div className="fw-bold">{order.orderId || 'N/A'}</div>
                        <small className="text-muted">
                          {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                        </small>
                      </td>
                      <td>
                        <div className="fw-bold">{order.customerName || 'N/A'}</div>
                        <small className="text-muted d-block">{order.customerEmail || 'N/A'}</small>
                        <small className="text-muted d-block">{order.phoneNumber || 'N/A'}</small>
                        <small className="text-muted d-block">{order.address || 'N/A'}</small>
                      </td>
                      <td>
                        <div className="products-list">
                          {order.products && order.products.length > 0 ? (
                            order.products.map((item, index) => (
                              <div key={index} className="product-item mb-1">
                                <div className="d-flex align-items-center">
                                  <img
                                    src={item.product ? getImageUrl(item.product.image) : '/images/placeholder.png'} // Use local placeholder
                                    alt={item.product?.name || ''}
                                    className="me-2 rounded"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = 'https://placehold.co/60@3x.png';
                                    }}
                                  />
                                  <div>
                                    <div className="small fw-bold">
                                      {item.product?.name || 'Unknown Product'}
                                    </div>
                                    <small className="text-muted">
                                      Qty: {item.quantity || 0} × ${safeToFixed(item.product?.price)}
                                    </small>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-muted">No products</div>
                          )}
                        </div>
                        {order.specialInstructions && (
                          <div className="mt-2 p-2 bg-light rounded">
                            <small className="text-muted d-block">
                              <i className="fas fa-info-circle me-1"></i>
                              Note: {order.specialInstructions}
                            </small>
                          </div>
                        )}
                      </td>
                      <td>
                        <div className="fw-bold">${safeToFixed(order.totalAmount)}</div>
                        <div className="small text-muted">
                          Subtotal: ${safeToFixed(order.subtotal)}
                        </div>
                        {order.promoDiscount > 0 && (
                          <div className="small text-success">
                            Discount: ${safeToFixed((order.subtotal * order.promoDiscount) / 100)}
                          </div>
                        )}
                        <div className="small text-muted">
                          Shipping: ${safeToFixed(order.shippingFee)}
                        </div>
                      </td>
                      <td>
                        <select
                          className={`form-select form-select-sm ${statusColors[order.status]}`}
                          value={order.status}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          style={{ color: 'white', fontWeight: 'bold' }}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                        <small className="text-muted d-block mt-1">
                          {new Date(order.createdAt).toLocaleTimeString()}
                        </small>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-success"
                            onClick={() => handleWhatsAppMessage(order, order.status.toLowerCase())}
                            title="Send WhatsApp message"
                          >
                            <i className="fab fa-whatsapp"></i>
                          </button>
                          <button
                            className="btn btn-outline-primary"
                            onClick={() => {
                              window.print();
                            }}
                            title="Print order"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                          <button
                            className="btn btn-danger"
                            onClick={() => handleDeleteOrder(order._id)}
                            title="Delete order"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OrderManagement;