import React, { useState, useEffect } from 'react';
import { useNotification } from '../components/Notification/NotificationProvider';
import api from '../api/api';
import { getImageUrl } from '../utils/imageUtils';
import { formatPhoneForWhatsApp } from '../utils/formatters';

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
  // Add this function in the same file, before the handleWhatsAppMessage function

const showWhatsAppModal = (phoneNumber, messageContent) => {
  // Create modal elements
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
  
  const modalContent = document.createElement('div');
  modalContent.className = 'bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4';
  
  // Modal header
  const header = document.createElement('div');
  header.className = 'mb-4';
  header.innerHTML = `
    <h3 class="text-lg font-bold text-gray-900 flex items-center">
      <svg class="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
      WhatsApp Contact Options
    </h3>
  `;
  
  // Modal body
  const body = document.createElement('div');
  body.className = 'mb-5';
  body.innerHTML = `
    <p class="text-gray-700 mb-3">How would you like to contact this customer?</p>
    <div class="p-3 bg-yellow-50 rounded-lg border border-yellow-200 text-sm text-yellow-800 mb-3">
      <p><strong>Note:</strong> For first-time contacts, choose "Open Chat" option, then paste the message manually.</p>
    </div>
    <div class="p-3 bg-gray-50 rounded-lg border border-gray-200 max-h-32 overflow-y-auto text-xs text-gray-600">
      <pre class="whitespace-pre-wrap">${messageContent}</pre>
    </div>
  `;
  
  // Modal footer with buttons
  const footer = document.createElement('div');
  footer.className = 'flex flex-col sm:flex-row gap-2 justify-end';
  
  const sendButton = document.createElement('button');
  sendButton.className = 'w-full sm:w-auto bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg flex items-center justify-center';
  sendButton.innerHTML = `
    <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
    Send Direct Message
  `;
  
  const openChatButton = document.createElement('button');
  openChatButton.className = 'w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center';
  openChatButton.innerHTML = `
    <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
    </svg>
    Open Chat & Copy Message
  `;
  
  const cancelButton = document.createElement('button');
  cancelButton.className = 'w-full sm:w-auto bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-lg';
  cancelButton.textContent = 'Cancel';
  
  footer.appendChild(openChatButton);
  footer.appendChild(sendButton);
  footer.appendChild(cancelButton);
  
  // Assemble modal
  modalContent.appendChild(header);
  modalContent.appendChild(body);
  modalContent.appendChild(footer);
  modalOverlay.appendChild(modalContent);
  
  // Add modal to body
  document.body.appendChild(modalOverlay);
  
  return new Promise((resolve) => {
    // Button click handlers
    sendButton.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
      resolve('send');
    });
    
    openChatButton.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
      resolve('open');
    });
    
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(modalOverlay);
      resolve('cancel');
    });
    
    // Close on outside click
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) {
        document.body.removeChild(modalOverlay);
        resolve('cancel');
      }
    });
  });
};



const handleWhatsAppMessage = (order, type = 'pending') => {
  // Get templates from settings or use defaults
  const templates = settings.whatsappMessageTemplate || {};

  // Calculate the subtotal properly
  const subtotal = order.products.reduce((sum, item) =>
    sum + (item.product?.price || 0) * item.quantity, 0
  );

  // Format order details
  const orderDetailsArabic = order.products.map(item =>
    `📦 ${item.product?.name || ''}
      القيمة: ${safeToFixed(item.product?.price)}$ × ${item.quantity}
      المجموع: ${safeToFixed((item.product?.price || 0) * item.quantity)}$`
  ).join('\n');

  // Calculate final values
  const deliveryFee = order.shippingFee || 0;
  const discount = order.promoDiscount ? (subtotal * order.promoDiscount) / 100 : 0;
  const finalTotal = subtotal + deliveryFee - discount;

  // Generate message content (either from template or default)
  let messageContent;
  if (!templates.arabic) {
    messageContent = getDefaultMessage(
      order,
      type,
      orderDetailsArabic,
      deliveryFee,
      finalTotal,
      discount
    );
  } else {
    messageContent = templates.arabic
      .replace('{{customerName}}', order.customerName)
      .replace('{{orderId}}', order.orderId)
      .replace('{{orderDetails}}', orderDetailsArabic)
      .replace('{{subtotal}}', safeToFixed(subtotal))
      .replace('{{deliveryFee}}', safeToFixed(deliveryFee))
      .replace('{{total}}', safeToFixed(finalTotal))
      .replace('{{address}}', order.address || '')
      .replace('{{discount}}', discount ? `💎 الخصم: -${safeToFixed(discount)}$\n` : '');
  }

  // Format phone number correctly
  const phoneNumber = formatPhoneForWhatsApp(order.phoneNumber);
  
  // Show modal with two options
  if (window.confirm('Do you have an existing chat with this customer?\n\nClick OK to send message directly.\nClick Cancel to just open chat (then copy-paste message).')) {
    // Option 1: Try direct message (works if previous chat exists)
    const whatsappURI = `whatsapp://send?phone=${phoneNumber}&text=${encodeURIComponent(messageContent)}`;
    const webWhatsappURL = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(messageContent)}`;
    
    // Try app first, fall back to web
    const appWindow = window.open(whatsappURI);
    
    setTimeout(() => {
      if (!appWindow || appWindow.closed) {
        window.open(webWhatsappURL, '_blank');
      }
    }, 500);
  } else {
    // Option 2: Just open the chat without message (works for new contacts)
    const chatOnlyURI = `whatsapp://send?phone=${phoneNumber}`;
    const webChatOnlyURL = `https://web.whatsapp.com/send?phone=${phoneNumber}`;
    
    // Try opening the chat-only URL
    const chatWindow = window.open(chatOnlyURI);
    
    // Copy message to clipboard for easy pasting
    navigator.clipboard.writeText(messageContent)
      .then(() => {
        showNotification('Message copied to clipboard! Paste it in WhatsApp chat.', 'success');
      })
      .catch(err => {
        console.error('Failed to copy message:', err);
        // Show message in a modal as fallback if clipboard fails
        alert('Copy this message to send to the customer:\n\n' + messageContent);
      });
      
    // Fallback to web version if app didn't open
    setTimeout(() => {
      if (!chatWindow || chatWindow.closed) {
        window.open(webChatOnlyURL, '_blank');
      }
    }, 500);
  }
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
                                    src={item.product?.images?.length > 0
                                      ? getImageUrl(item.product.images[0])
                                      : 'https://placehold.co/60@3x.png'}
                                    alt={item.product?.name || 'Product image'}
                                    className="me-2 rounded"
                                    style={{ width: '40px', height: '40px', objectFit: 'cover' }}
                                    onError={(e) => {
                                      e.target.src = 'https://placehold.co/60@3x.png';
                                    }}
                                  />
                                  <div>
                                    <div className="small fw-bold">
                                      {item.product?.name || 'Unknown Product'} {!item.product && '(Deleted)'}
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