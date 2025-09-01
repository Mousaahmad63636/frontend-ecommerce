import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotification } from '../Notification/NotificationProvider';
import { useAsync } from '../../hooks/useAsync';

const SecuritySettings = () => {
  const { loading, execute } = useAsync();
  const { showNotification } = useNotification();
  const { updatePassword } = useAuth();

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    if (formData.newPassword.length < 8) {
      showNotification('Password must be at least 8 characters long', 'error');
      return;
    }

    try {
      await execute(async () => {
        await updatePassword(formData.currentPassword, formData.newPassword);
        showNotification('Password updated successfully', 'success');
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      });
    } catch (error) {
      showNotification(error.message, 'error');
    }
  };

  return (
    <div>
      <h4 className="mb-4">Security Settings</h4>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Current Password</label>
          <input
            type="password"
            className="form-control"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">New Password</label>
          <input
            type="password"
            className="form-control"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            required
            minLength={8}
          />
          <small className="text-muted">
            Password must be at least 8 characters long
          </small>
        </div>

        <div className="mb-3">
          <label className="form-label">Confirm New Password</label>
          <input
            type="password"
            className="form-control"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
        </button>
      </form>
    </div>
  );
};

export default SecuritySettings;