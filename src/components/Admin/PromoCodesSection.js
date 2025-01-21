import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';

function PromoCodesSection() {
    const [promoCodes, setPromoCodes] = useState([]);
    const { showNotification } = useNotification();
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumPurchase: '0',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        usageLimit: '',
        isActive: true
    });

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const data = await api.getPromoCodes();
            setPromoCodes(data);
        } catch (error) {
            showNotification('Failed to load promo codes', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const validateForm = () => {
        const requiredFields = ['code', 'description', 'discountValue', 'endDate'];
        const missingFields = requiredFields.filter(field => !formData[field]);
        
        if (missingFields.length > 0) {
            showNotification(`Please fill in: ${missingFields.join(', ')}`, 'error');
            return false;
        }
        
        const discountValue = Number(formData.discountValue);
        if (formData.discountType === 'percentage' && discountValue > 100) {
            showNotification('Percentage discount cannot exceed 100%', 'error');
            return false;
        }
    
        if (formData.discountType === 'fixed' && discountValue > 1000000) {
            showNotification('Fixed discount cannot exceed $1,000,000', 'error');
            return false;
        }
    
        return true;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
            
        if (!validateForm()) return;
    
        try {
            setLoading(true);
    
            const promoData = {
                code: formData.code.toUpperCase(),
                description: formData.description,
                discountType: formData.discountType,
                discountValue: Number(formData.discountValue),
                minimumPurchase: Number(formData.minimumPurchase),
                startDate: formData.startDate,
                endDate: formData.endDate,
                usageLimit: formData.usageLimit ? Number(formData.usageLimit) : undefined,
                isActive: formData.isActive
            };
    
            console.log('Submitting promo data:', promoData); // For debugging
    
            if (editingId) {
                await api.updatePromoCode(editingId, promoData);
                showNotification('Promo code updated successfully', 'success');
            } else {
                await api.createPromoCode(promoData);
                showNotification('Promo code created successfully', 'success');
            }
    
            clearForm();
            fetchPromoCodes();
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Error saving promo code';
            showNotification(errorMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (promo) => {
        setEditingId(promo._id);
        setFormData({
            code: promo.code,
            description: promo.description,
            discountType: promo.discountType,
            discountValue: promo.discountValue.toString(),
            minimumPurchase: promo.minimumPurchase.toString(),
            startDate: new Date(promo.startDate).toISOString().split('T')[0],
            endDate: new Date(promo.endDate).toISOString().split('T')[0],
            usageLimit: promo.usageLimit?.toString() || '',
            isActive: promo.isActive
        });
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this promo code?')) return;

        try {
            setLoading(true);
            await api.deletePromoCode(id);
            showNotification('Promo code deleted successfully', 'success');
            fetchPromoCodes();
        } catch (error) {
            showNotification('Failed to delete promo code', 'error');
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setEditingId(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            minimumPurchase: '0',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            usageLimit: '',
            isActive: true
        });
    };
    return (
        <div className="promo-codes-section">
            <div className="card mb-4">
                <div className="card-header">
                    <h3>{editingId ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Promo Code *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="code"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    placeholder="e.g., SUMMER2024"
                                    required
                                    disabled={editingId}
                                />
                            </div>
    
                            <div className="col-md-6 mb-3">
                                <label className="form-label">Description *</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Summer Sale Discount"
                                    required
                                />
                            </div>
    
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Discount Type *</label>
                                <select
                                    className="form-select"
                                    name="discountType"
                                    value={formData.discountType}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="percentage">Percentage</option>
                                    <option value="fixed">Fixed Amount</option>
                                    <option value="shipping">Free Shipping</option>
                                </select>
                            </div>
    
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Discount Value *</label>
                                <div className="input-group">
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="discountValue"
                                        value={formData.discountValue}
                                        onChange={handleInputChange}
                                        required
                                        min="0"
                                        max={formData.discountType === 'percentage' ? "100" : undefined}
                                        step={formData.discountType === 'percentage' ? "1" : "0.01"}
                                    />
                                    <span className="input-group-text">
                                        {formData.discountType === 'percentage' ? '%' : '$'}
                                    </span>
                                </div>
                            </div>
    
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Minimum Purchase</label>
                                <div className="input-group">
                                    <span className="input-group-text">$</span>
                                    <input
                                        type="number"
                                        className="form-control"
                                        name="minimumPurchase"
                                        value={formData.minimumPurchase}
                                        onChange={handleInputChange}
                                        min="0"
                                        step="0.01"
                                    />
                                </div>
                            </div>
    
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Start Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
    
                            <div className="col-md-4 mb-3">
                                <label className="form-label">End Date *</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                    min={formData.startDate}
                                />
                            </div>
    
                            <div className="col-md-4 mb-3">
                                <label className="form-label">Usage Limit</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="usageLimit"
                                    value={formData.usageLimit}
                                    onChange={handleInputChange}
                                    min="0"
                                    placeholder="Leave empty for unlimited"
                                />
                            </div>
                        </div>
    
                        <div className="form-check mb-3">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                            />
                            <label className="form-check-label" htmlFor="isActive">
                                Active
                            </label>
                        </div>
    
                        <div className="d-flex gap-2">
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" />
                                        {editingId ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    editingId ? 'Update Promo Code' : 'Create Promo Code'
                                )}
                            </button>
                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={clearForm}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
    
            {/* Promo Codes List */}
            <div className="card">
                <div className="card-header">
                    <h3>Promo Codes List</h3>
                </div>
                <div className="card-body">
                    <div className="table-responsive">
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Description</th>
                                    <th>Type</th>
                                    <th>Value</th>
                                    <th>Usage</th>
                                    <th>Valid Until</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {promoCodes.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-4">
                                            No promo codes found
                                        </td>
                                    </tr>
                                ) : (
                                    promoCodes.map(promo => (
                                        <tr key={promo._id}>
                                            <td>{promo.code}</td>
                                            <td>{promo.description}</td>
                                            <td>{promo.discountType}</td>
                                            <td>
                                                {promo.discountType === 'percentage'
                                                    ? `${promo.discountValue}%`
                                                    : promo.discountType === 'fixed'
                                                        ? `$${promo.discountValue}`
                                                        : 'Free Shipping'
                                                }
                                            </td>
                                            <td>
                                                {promo.usageLimit 
                                                    ? `${promo.usedCount || 0}/${promo.usageLimit}`
                                                    : 'Unlimited'
                                                }
                                            </td>
                                            <td>{new Date(promo.endDate).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`badge ${promo.isActive ? 'bg-success' : 'bg-danger'}`}>
                                                    {promo.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="btn-group btn-group-sm">
                                                    <button
                                                        className="btn btn-primary"
                                                        onClick={() => handleEdit(promo)}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="btn btn-danger"
                                                        onClick={() => handleDelete(promo._id)}
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
    }
    
    export default PromoCodesSection;