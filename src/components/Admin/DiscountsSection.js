import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';

function DiscountsSection() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const { showNotification } = useNotification();
    const [discountData, setDiscountData] = useState({
        discountPercentage: '',
        selectedProductId: '',
        category: '',
        enableTimer: false,
        endDate: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const data = await api.getProducts();
            setProducts(data);
            const uniqueCategories = [...new Set(data.map(product => product.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            showNotification('Failed to load products', 'error');
        }
    };

    const handleDiscountChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDiscountData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleApplyDiscount = async (type) => {
        try {
            if (!discountData.discountPercentage) {
                showNotification('Please enter a discount percentage', 'error');
                return;
            }

            if (type === 'specific' && !discountData.selectedProductId) {
                showNotification('Please select a product', 'error');
                return;
            }

            if (type === 'category' && !discountData.category) {
                showNotification('Please select a category', 'error');
                return;
            }

            // Set default end date to 7 days from now if no end date is specified
            let endDate = null;
            if (discountData.enableTimer && discountData.endDate) {
                endDate = new Date(discountData.endDate);
            } else {
                endDate = new Date();
                endDate.setDate(endDate.getDate() + 7); // Default 7 days
            }

            // Create the discount payload
            const discountPayload = {
                type,
                value: parseFloat(discountData.discountPercentage),
                targetId: type === 'specific' ? discountData.selectedProductId : null,
                category: type === 'category' ? discountData.category : null,
                discountEndDate: endDate.toISOString() // Always include an end date
            };

            // Call API to apply discount
            await api.applyDiscount(discountPayload);
            showNotification('Discount applied successfully!', 'success');
            fetchProducts(); // Refresh the products list

            // Reset the form
            setDiscountData({
                discountPercentage: '',
                selectedProductId: '',
                category: '',
                enableTimer: false,
                endDate: ''
            });
        } catch (error) {
            showNotification(error.message || 'Error applying discount', 'error');
        }
    };
    const handleResetDiscount = async (productId = null) => {
        try {
            await api.resetDiscount(productId);
            showNotification('Discount reset successfully!', 'success');
            fetchProducts();
        } catch (error) {
            showNotification(error.message || 'Error resetting discount', 'error');
        }
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return 'No end date';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="discounts-section">
            <div className="card mb-4">
                <div className="card-header">
                    <h3>Discount Management</h3>
                </div>
                <div className="card-body">
                    <div className="row">
                        <div className="col-md-4 mb-3">
                            <label className="form-label">Discount Percentage</label>
                            <input
                                type="number"
                                className="form-control"
                                name="discountPercentage"
                                value={discountData.discountPercentage}
                                onChange={handleDiscountChange}
                                min="0"
                                max="100"
                            />
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Select Product</label>
                            <select
                                className="form-select"
                                name="selectedProductId"
                                value={discountData.selectedProductId}
                                onChange={handleDiscountChange}
                            >
                                <option value="">Select a product...</option>
                                {products.map(product => (
                                    <option key={product._id} value={product._id}>
                                        {product.name} (${product.price})
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">Select Category</label>
                            <select
                                className="form-select"
                                name="category"
                                value={discountData.category}
                                onChange={handleDiscountChange}
                            >
                                <option value="">Select a category...</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="col-12 mb-3">
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="enableTimer"
                                    name="enableTimer"
                                    checked={discountData.enableTimer}
                                    onChange={handleDiscountChange}
                                />
                                <label className="form-check-label" htmlFor="enableTimer">
                                    Show Countdown Timer
                                </label>
                            </div>
                        </div>

                        {discountData.enableTimer && (
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Discount End Date & Time</label>
                                <input
                                    type="datetime-local"
                                    className="form-control"
                                    name="endDate"
                                    value={discountData.endDate}
                                    onChange={handleDiscountChange}
                                    min={new Date().toISOString().slice(0, 16)}
                                />
                            </div>
                        )}
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-primary"
                            onClick={() => handleApplyDiscount('specific')}
                            disabled={!discountData.discountPercentage || !discountData.selectedProductId}
                        >
                            Apply to Selected Product
                        </button>
                        <button
                            className="btn btn-info"
                            onClick={() => handleApplyDiscount('category')}
                            disabled={!discountData.discountPercentage || !discountData.category}
                        >
                            Apply to Category
                        </button>
                        <button
                            className="btn btn-warning"
                            onClick={() => handleResetDiscount()}
                        >
                            Reset All Discounts
                        </button>
                    </div>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3>Products with Discounts</h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Original Price</th>
                                    <th>Current Price</th>
                                    <th>Savings</th>
                                    <th>End Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map(product => (
                                    <tr key={product._id}>
                                        <td>{product.name}</td>
                                        <td>{product.category}</td>
                                        <td>${product.originalPrice ? product.originalPrice.toFixed(2) : product.price.toFixed(2)}</td>
                                        <td>${product.price.toFixed(2)}</td>
                                        <td>
                                            {product.discountPercentage > 0 ? (
                                                <span className="text-success">
                                                    Save ${(product.originalPrice - product.price).toFixed(2)}
                                                </span>
                                            ) : (
                                                <span className="text-muted">No discount</span>
                                            )}
                                        </td>
                                        <td>
                                            {product.discountEndDate ?
                                                new Date(product.discountEndDate).toLocaleString() :
                                                '-'
                                            }
                                        </td>
                                        <td>
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleResetDiscount(product._id)}
                                                disabled={product.discountPercentage === 0}
                                            >
                                                Reset Discount
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscountsSection;