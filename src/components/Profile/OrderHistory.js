// src/components/Profile/OrderHistory.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotification } from '../../components/Notification/NotificationProvider';
import { useAsync } from '../../hooks/useAsync';
import { formatDate, formatPrice } from '../../utils/formatters';
import Loading from '../Loading/Loading';
import api from '../../api/api';

function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const { showNotification } = useNotification();
  const { loading, execute } = useAsync();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      await execute(async () => {
        const response = await api.getUserOrders();
        setOrders(response);
      });
    } catch (error) {
      showNotification('Failed to load orders', 'error');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered':
        return 'bg-success';
      case 'Cancelled':
        return 'bg-danger';
      case 'Shipped':
        return 'bg-info';
      case 'Processing':
        return 'bg-warning';
      case 'Pending':
        return 'bg-secondary';
      default:
        return 'bg-primary';
    }
  };

  const sortOrders = (ordersToSort) => {
    return [...ordersToSort].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt) - new Date(a.createdAt);
          break;
        case 'total':
          comparison = a.totalAmount - b.totalAmount;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        default:
          comparison = 0;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  };

  const filterOrders = () => {
    return orders.filter(order => {
      const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
      const matchesSearch = searchTerm === '' || 
        order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.products.some(item => 
          item.product.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      return matchesStatus && matchesSearch;
    });
  };

  // Pagination
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const filteredOrders = filterOrders();
  const sortedOrders = sortOrders(filteredOrders);
  const currentOrders = sortedOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="order-history">
      {/* Controls Section */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-4">
              <select
                className="form-select"
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Orders</option>
                <option value="Pending">Pending</option>
                <option value="Processing">Processing</option>
                <option value="Shipped">Shipped</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}
              >
                <option value="date-desc">Oldest First</option>
                <option value="date-asc">Newest First</option>
                <option value="total-desc">Highest Amount</option>
                <option value="total-asc">Lowest Amount</option>
                <option value="status-asc">Status (A-Z)</option>
                <option value="status-desc">Status (Z-A)</option>
              </select>
            </div>
            <div className="col-md-4">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setSearchTerm('');
                      setCurrentPage(1);
                    }}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Orders List */}
      {currentOrders.length === 0 ? (
        <div className="text-center py-5">
          <i className="fas fa-shopping-bag fa-3x text-muted mb-3"></i>
          <h5>No Orders Found</h5>
          <p className="text-muted mb-3">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your filters'
              : 'You haven\'t placed any orders yet'}
          </p>
          <Link to="/" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-3">
            <small className="text-muted">
              Showing {indexOfFirstOrder + 1} - {Math.min(indexOfLastOrder, filteredOrders.length)} of {filteredOrders.length} orders
            </small>
          </div>

          {currentOrders.map(order => (
            <div key={order._id} className="card mb-3">
              <div className="card-header bg-light">
                <div className="row align-items-center">
                  <div className="col">
                    <span className="fw-bold">Order #{order.orderId}</span>
                    <br />
                    <small className="text-muted">
                      Placed on {formatDate(order.createdAt)}
                    </small>
                  </div>
                  <div className="col-auto">
                    <span className={`badge ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="card-body">
                <div className="row">
                  <div className="col-md-8">
                    {order.products.map((item, index) => (
                      <div key={index} className="d-flex align-items-center mb-2">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="me-3 rounded"
                          style={{
                            width: '60px',
                            height: '60px',
                            objectFit: 'cover'
                          }}
                          onError={(e) => {
                            e.target.src = 'https://placehold.co/60@3x.png';
                          }}
                        />
                        <div className="flex-grow-1">
                          <Link 
                            to={`/product/${item.product._id}`}
                            className="text-decoration-none"
                          >
                            <h6 className="mb-0">{item.product.name}</h6>
                          </Link>
                          <small className="text-muted">
                            Quantity: {item.quantity} × {formatPrice(item.product.price)}
                          </small>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="col-md-4">
                    <div className="text-md-end">
                      <div className="mb-2">
                        <small className="text-muted">Subtotal:</small>
                        <br />
                        {formatPrice(order.subtotal)}
                      </div>
                      {order.promoDiscount > 0 && (
                        <div className="mb-2 text-success">
                          <small className="text-muted">Discount:</small>
                          <br />
                          -{formatPrice((order.subtotal * order.promoDiscount) / 100)}
                        </div>
                      )}
                      <div className="mb-2">
                        <small className="text-muted">delivery:</small>
                        <br />
                        {formatPrice(order.shippingFee)}
                      </div>
                      <div className="fw-bold">
                        <small className="text-muted">Total:</small>
                        <br />
                        {formatPrice(order.totalAmount)}
                      </div>
                    </div>
                  </div>
                </div>

                {order.specialInstructions && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <small className="text-muted">Special Instructions:</small>
                    <p className="mb-0">{order.specialInstructions}</p>
                  </div>
                )}
              </div>

              <div className="card-footer">
                <div className="row">
                  <div className="col-md-6">
                    <small className="text-muted">delivery Address:</small>
                    <p className="mb-0 small">{order.address}</p>
                  </div>
                  <div className="col-md-6 text-md-end">
                    <small className="text-muted">Contact:</small>
                    <p className="mb-0 small">
                      {order.phoneNumber}<br />
                      {order.customerEmail}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Order history pagination">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                </li>
                {[...Array(totalPages)].map((_, index) => (
                  <li
                    key={index}
                    className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => setCurrentPage(index + 1)}
                    >
                      {index + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </li>
              </ul>
            </nav>
          )}
        </>
      )}
    </div>
  );
}

export default OrderHistory;