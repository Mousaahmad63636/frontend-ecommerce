import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../components/Notification/NotificationProvider';
import { useAsync } from '../hooks/useAsync';
import AddressBook from '../components/Profile/AddressBook';
import SecuritySettings from '../components/Profile/SecuritySettings';
import OrderHistory from '../components/Profile/OrderHistory';
import Loading from '../components/Loading/Loading';
import api from '../api/api';

function ProfilePage() {
  const { user, updateProfile, logout } = useAuth();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const { loading: asyncLoading, execute } = useAsync();
  const [activeTab, setActiveTab] = useState('profile');
  const [imagePreview, setImagePreview] = useState(user?.profileImage || '');
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    profileImage: null,
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        profileImage: file
      }));
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await execute(async () => {
        const formDataToSend = new FormData();
        Object.keys(formData).forEach(key => {
          if (formData[key] !== null) {
            formDataToSend.append(key, formData[key]);
          }
        });

        await updateProfile(formDataToSend);
        showNotification('Profile updated successfully!', 'success');
        setIsEditing(false);
      });
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await execute(async () => {
        await api.deleteAccount();
        showNotification('Account deleted successfully', 'success');
        logout();
        navigate('/');
      });
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      showNotification('Error logging out', 'error');
    }
  };

  if (asyncLoading) {
    return <Loading />;
  }

  return (
    <div className="container my-5">
      <div className="row">
        {/* Sidebar Navigation */}
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex flex-column align-items-center text-center mb-4">
                <div className="position-relative">
                  <img
                    src={imagePreview || 'https://placehold.co/60@3x.png'}
                    alt="Profile"
                    className="rounded-circle"
                    width="150"
                    height="150"
                    style={{ objectFit: 'cover' }}
                  />
                  {isEditing && (
                    <label 
                      className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 cursor-pointer"
                      style={{ cursor: 'pointer' }}
                    >
                      <input
                        type="file"
                        className="d-none"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                      <i className="fas fa-camera"></i>
                    </label>
                  )}
                </div>
                <h4 className="mt-3">{user.name}</h4>
                <p className="text-secondary mb-1">{user.email}</p>
              </div>

              <ul className="nav nav-pills flex-column">
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`}
                    onClick={() => setActiveTab('profile')}
                  >
                    <i className="fas fa-user me-2"></i>
                    Profile Information
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'security' ? 'active' : ''}`}
                    onClick={() => setActiveTab('security')}
                  >
                    <i className="fas fa-lock me-2"></i>
                    Security Settings
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('addresses')}
                  >
                    <i className="fas fa-map-marker-alt me-2"></i>
                    Address Book
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('orders')}
                  >
                    <i className="fas fa-shopping-bag me-2"></i>
                    Order History
                  </button>
                </li>
              </ul>

              <div className="mt-4">
                <button
                  className="btn btn-warning w-100 mb-2"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt me-2"></i>
                  Logout
                </button>
                <button
                  className="btn btn-outline-danger w-100"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <i className="fas fa-trash-alt me-2"></i>
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-md-9">
          <div className="card">
            <div className="card-body">
              {/* Profile Information Tab */}
              {activeTab === 'profile' && (
                <form onSubmit={handleSubmit}>
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h4 className="mb-0">Profile Information</h4>
                    {!isEditing ? (
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={() => setIsEditing(true)}
                      >
                        <i className="fas fa-edit me-2"></i>
                        Edit Profile
                      </button>
                    ) : (
                      <div>
                        <button
                          type="submit"
                          className="btn btn-success me-2"
                          disabled={asyncLoading}
                        >
                          {asyncLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <i className="fas fa-save me-2"></i>
                              Save Changes
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => {
                            setIsEditing(false);
                            setFormData({
                              name: user.name,
                              email: user.email,
                              phoneNumber: user.phoneNumber
                            });
                            setImagePreview(user.profileImage);
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Full Name</label>
                      <input
                        type="text"
                        className="form-control"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        required
                      />
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Email</label>
                      <input
                        type="email"
                        className="form-control"
                        value={formData.email}
                        disabled
                      />
                      <small className="text-muted">
                        Email cannot be changed
                      </small>
                    </div>

                    <div className="col-md-6 mb-3">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        className="form-control"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </form>
              )}

              {/* Security Settings Tab */}
              {activeTab === 'security' && (
                <SecuritySettings />
              )}

              {/* Address Book Tab */}
              {activeTab === 'addresses' && (
                <AddressBook 
                  addresses={addresses}
                  onAddressUpdate={setAddresses}
                />
              )}

              {/* Order History Tab */}
              {activeTab === 'orders' && (
                <OrderHistory />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="modal fade show" style={{ display: 'block' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Account</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setDeleteModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete your account? This action cannot be undone.</p>
                <p className="text-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  All your data will be permanently deleted.
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteAccount}
                  disabled={asyncLoading}
                >
                  {asyncLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show"></div>
        </div>
      )}
    </div>
  );
}

export default ProfilePage;