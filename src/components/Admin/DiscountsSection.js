import React, { useState, useEffect, useMemo } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';

function DiscountsSection() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const { showNotification } = useNotification();
    const [searchTerm, setSearchTerm] = useState('');
    const [discountData, setDiscountData] = useState({
        discountType: 'percentage',
        discountValue: '',
        selectedProductId: '',
        category: '',
        enableTimer: false,
        endDate: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [products, searchTerm]);

    const fetchProducts = async () => {
        try {
            const data = await api.getProducts();
            setProducts(data);
            setFilteredProducts(data);
            const uniqueCategories = [...new Set(data.map(product => product.category))];
            setCategories(uniqueCategories);
        } catch (error) {
            showNotification('Failed to load products', 'error');
        }
    };

    const filterProducts = () => {
        if (!searchTerm.trim()) {
            setFilteredProducts(products);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = products.filter(product => 
            product.name.toLowerCase().includes(term) || 
            (product.category && product.category.toLowerCase().includes(term)) ||
            product.price.toString().includes(term)
        );
        setFilteredProducts(filtered);
    };

    const handleDiscountChange = (e) => {
        const { name, value, type, checked } = e.target;
        setDiscountData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
    };

    const handleApplyDiscount = async (type) => {
        try {
            if (!discountData.discountValue) {
                showNotification('Please enter a discount value', 'error');
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

            const discountValue = parseFloat(discountData.discountValue);
            
            if (discountData.discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
                showNotification('Percentage discount must be between 1 and 100', 'error');
                return;
            }
            
            if (discountData.discountType === 'fixed' && discountValue <= 0) {
                showNotification('Fixed discount must be greater than 0', 'error');
                return;
            }

            let endDate = null;
            if (discountData.enableTimer && discountData.endDate) {
                endDate = new Date(discountData.endDate);
            }

            const discountPayload = {
                type,
                discountType: discountData.discountType,
                value: discountValue,
                targetId: type === 'specific' ? discountData.selectedProductId : null,
                category: type === 'category' ? discountData.category : null,
                discountEndDate: endDate ? endDate.toISOString() : null
            };

            await api.applyDiscount(discountPayload);
            showNotification('Discount applied successfully!', 'success');
            fetchProducts();

            setDiscountData({
                discountType: 'percentage',
                discountValue: '',
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

    const formatDiscount = (product) => {
        if (!product.discountPercentage || product.discountPercentage <= 0) {
            return <span className="text-muted">No discount</span>;
        }
        
        if (product.discountType === 'fixed') {
            return <span className="text-success">-${product.discountPercentage.toFixed(2)}</span>;
        } else {
            return <span className="text-success">{product.discountPercentage}% off</span>;
        }
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
                            <label className="form-label">Discount Type</label>
                            <select
                                className="form-select"
                                name="discountType"
                                value={discountData.discountType}
                                onChange={handleDiscountChange}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>

                        <div className="col-md-4 mb-3">
                            <label className="form-label">
                                {discountData.discountType === 'percentage' ? 'Discount Percentage' : 'Discount Amount'}
                            </label>
                            <div className="input-group">
                                {discountData.discountType === 'percentage' && <span className="input-group-text">%</span>}
                                {discountData.discountType === 'fixed' && <span className="input-group-text">$</span>}
                                <input
                                    type="number"
                                    className="form-control"
                                    name="discountValue"
                                    value={discountData.discountValue}
                                    onChange={handleDiscountChange}
                                    min="0"
                                    max={discountData.discountType === 'percentage' ? "100" : undefined}
                                    step="0.01"
                                />
                            </div>
                            {discountData.discountType === 'percentage' && (
                                <small className="text-muted">Enter a value between 1 and 100</small>
                            )}
                            {discountData.discountType === 'fixed' && (
                                <small className="text-muted">Enter the dollar amount to subtract from price</small>
                            )}
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
                                        {product.name} (${product.price.toFixed(2)})
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
                            disabled={!discountData.discountValue || !discountData.selectedProductId}
                        >
                            Apply to Selected Product
                        </button>
                        <button
                            className="btn btn-info"
                            onClick={() => handleApplyDiscount('category')}
                            disabled={!discountData.discountValue || !discountData.category}
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
                <div className="card-header d-flex justify-content-between align-items-center">
                    <h3>Products with Discounts</h3>
                    <div className="input-group" style={{ maxWidth: '300px' }}>
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search products..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                        {searchTerm && (
                            <button 
                                className="btn btn-outline-secondary" 
                                type="button"
                                onClick={handleClearSearch}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        )}
                    </div>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        {filteredProducts.length === 0 ? (
                            <div className="alert alert-info">
                                {searchTerm ? 'No products match your search.' : 'No products with discounts found.'}
                            </div>
                        ) : (
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Category</th>
                                        <th>Original Price</th>
                                        <th>Current Price</th>
                                        <th>Discount</th>
                                        <th>End Date</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredProducts.map(product => (
                                        <tr key={product._id}>
                                            <td>{product.name}</td>
                                            <td>{product.category}</td>
                                            <td>${product.originalPrice ? product.originalPrice.toFixed(2) : product.price.toFixed(2)}</td>
                                            <td>${product.price.toFixed(2)}</td>
                                            <td>
                                                {formatDiscount(product)}
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
                        )}
                    </div>
                    <div className="mt-2 text-muted small">
                        Showing {filteredProducts.length} of {products.length} products
                        {searchTerm && <span> matching "{searchTerm}"</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DiscountsSection;