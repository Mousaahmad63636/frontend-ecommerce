import React, { useState } from 'react';
import { useNotification } from '../Notification/NotificationProvider';
import { useAsync } from '../../hooks/useAsync';
import api from '../../api/api';

const AddressBook = ({ addresses = [], onAddressUpdate }) => {
  const { loading, execute } = useAsync();
  const { showNotification } = useNotification();
  const [isEditing, setIsEditing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);

  const [formData, setFormData] = useState({
    label: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    isDefault: false
  });

  const resetForm = () => {
    setFormData({
      label: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      isDefault: false
    });
    setEditingAddress(null);
    setIsEditing(false);
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
      await execute(async () => {
        const response = editingAddress
          ? await api.updateAddress(editingAddress._id, formData)
          : await api.addAddress(formData);

        onAddressUpdate(response.addresses);
        showNotification(
          `Address ${editingAddress ? 'updated' : 'added'} successfully`,
          'success'
        );
        resetForm();
      });
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;

    try {
      await execute(async () => {
        const response = await api.deleteAddress(addressId);
        onAddressUpdate(response.addresses);
        showNotification('Address deleted successfully', 'success');
      });
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      isDefault: address.isDefault
    });
    setIsEditing(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Address Book</h4>
        {!isEditing && (
          <button
            className="btn btn-primary"
            onClick={() => setIsEditing(true)}
          >
            <i className="fas fa-plus me-2"></i>
            Add New Address
          </button>
        )}
      </div>

      {/* Address List */}
      {!isEditing && (
        <div className="row">
          {addresses.map(address => (
            <div key={address._id} className="col-md-6 mb-3">
              <div className="card h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title">{address.label}</h5>
                    {address.isDefault && (
                      <span className="badge bg-primary">Default</span>
                    )}
                  </div>
                  <p className="card-text">
                    {address.street}<br />
                    {address.city}, {address.state} {address.postalCode}<br />
                    {address.country}
                  </p>
                  <div className="mt-3">
                    <button
                      className="btn btn-sm btn-outline-primary me-2"
                      onClick={() => handleEdit(address)}
                    >
                      Edit
                    </button>
                    {!address.isDefault && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(address._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form */}
      {isEditing && (
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-4">
              {editingAddress ? 'Edit Address' : 'Add New Address'}
            </h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-12 mb-3">
                  <label className="form-label">Address Label</label>
                  <input
                    type="text"
                    className="form-control"
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    placeholder="e.g., Home, Office"
                    required
                  />
                </div>

                <div className="col-12 mb-3">
                  <label className="form-label">Street Address</label>
                  <input
                    type="text"
                    className="form-control"
                    name="street"
                    value={formData.street}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    className="form-control"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">State/Province</label>
                  <input
                    type="text"
                    className="form-control"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Postal Code</label>
                  <input
                    type="text"
                    className="form-control"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Country</label>
                  <input
                    type="text"
                    className="form-control"
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="col-12 mb-3">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="isDefault"
                      name="isDefault"
                      checked={formData.isDefault}
                      onChange={handleInputChange}
                    />
                    <label className="form-check-label" htmlFor="isDefault">
                      Set as default address
                    </label>
                  </div>
                </div>
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
                      Saving...
                    </>
                  ) : (
                    'Save Address'
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressBook;