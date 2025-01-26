// src/components/Admin/PromoCodeManager.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../Notification/NotificationProvider';
import api from '../../api/api';

function PromoCodeManager() {
    const [promoCodes, setPromoCodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discountType: 'percentage',
        discountValue: '',
        minimumPurchase: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        usageLimit: '',
        isActive: true
    });
    const [editingId, setEditingId] = useState(null);
    const { showNotification } = useNotification();

    useEffect(() => {
        fetchPromoCodes();
    }, []);

    const fetchPromoCodes = async () => {
        try {
            setLoading(true);
            const response = await api.getPromoCodes();
            setPromoCodes(response);
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await api.updatePromoCode(editingId, formData);
                showNotification('Promo code updated successfully', 'success');
            } else {
                await api.createPromoCode(formData);
                showNotification('Promo code created successfully', 'success');
            }
            resetForm();
            fetchPromoCodes();
        } catch (error) {
            showNotification(error.message, 'error');
        }
    };

    const handleEdit = (promoCode) => {
        setEditingId(promoCode._id);
        setFormData({
            code: promoCode.code,
            description: promoCode.description,
            discountType: promoCode.discountType,
            discountValue: promoCode.discountValue,
            minimumPurchase: promoCode.minimumPurchase,
            startDate: new Date(promoCode.startDate).toISOString().split('T')[0],
            endDate: new Date(promoCode.endDate).toISOString().split('T')[0],
            usageLimit: promoCode.usageLimit || '',
            isActive: promoCode.isActive
        });
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this promo code?')) {
            try {
                await api.deletePromoCode(id);
                showNotification('Promo code deleted successfully', 'success');
                fetchPromoCodes();
            } catch (error) {
                showNotification(error.message, 'error');
            }
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setFormData({
            code: '',
            description: '',
            discountType: 'percentage',
            discountValue: '',
            minimumPurchase: 0,
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            usageLimit: '',
            isActive: true
        });
    };

    if (loading) {
        return <div className="text-center">Loading...</div>;
    }

    return (
        <div className="promo-code-manager">
            <h3 className="mb-4">{editingId ? 'Edit Promo Code' : 'Create Promo Code'}</h3>
            
            <form onSubmit={handleSubmit} className="mb-4">
                <div className="row">
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Code</label>
                        <input
                            type="text"
                            className="form-control"
                            name="code"
                            value={formData.code}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="col-md-6 mb-3">
                        <label className="form-label">Description</label>
                        <input
                            type="text"
                            className="form-control"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Discount Type</label>
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
                        <label className="form-label">Discount Value</label>
                        <input
                            type="number"
                            className="form-control"
                            name="discountValue"
                            value={formData.discountValue}
                            onChange={handleInputChange}
                            required
                            min="0"
                            step={formData.discountType === 'percentage' ? '1' : '0.01'}
                        />
                    </div>

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Minimum Purchase</label>
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

                    <div className="col-md-4 mb-3">
                        <label className="form-label">Start Date</label>
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
                        <label className="form-label">End Date</label>
                        <input
                            type="date"
                            className="form-control"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleInputChange}
                            required
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
                        />
                    </div>

                    <div className="col-12 mb-3">
                        <div className="form-check">
                            <input
                                type="checkbox"
                                className="form-check-input"
                                name="isActive"
                                checked={formData.isActive}
                                onChange={handleInputChange}
                                id="isActive"
                            />
                            <label className="form-check-label" htmlFor="isActive">
                                Active
                            </label>
                        </div>
                    </div>
                </div>

                <div className="d-flex gap-2">
                    <button type="submit" className="btn btn-primary">
                        {editingId ? 'Update' : 'Create'} Promo Code
                    </button>
                    {editingId && (
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={resetForm}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>

            <h3 className="mb-3">Promo Codes</h3>
            <div className="table-responsive">
                <table className="table table-striped">
                    <thead>
                        <tr>
                            <th>Code</th>
                            <th>Description</th>
                            <th>Discount</th>
                            <th>Valid Until</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {promoCodes.map(promo => (
                            <tr key={promo._id}>
                                <td>{promo.code}</td>
                                <td>{promo.description}</td>
                                <td>
                                    {promo.discountType === 'percentage' && `${promo.discountValue}%`}
                                    {promo.discountType === 'fixed' && `$${promo.discountValue}`}
                                    {promo.discountType === 'shipping' && 'Free Shipping'}
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
                                            className="btn btn-outline-primary"
                                            onClick={() => handleEdit(promo)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-outline-danger"
                                            onClick={() => handleDelete(promo._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default PromoCodeManager;