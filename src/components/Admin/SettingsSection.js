// src/components/Admin/SettingsSection.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';

function SettingsSection() {
  const [settings, setSettings] = useState({
    whatsappMessageTemplate: {
      english: '',
      arabic: ''
    },
    bannerText: '' // Added banner text field
  });
  
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response) {
        setSettings(response);
      }
    } catch (error) {
      showNotification('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.updateSettings(settings);
      showNotification('Settings updated successfully', 'success');
    } catch (error) {
      showNotification('Failed to update settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e, language) => {
    setSettings(prev => ({
      ...prev,
      whatsappMessageTemplate: {
        ...prev.whatsappMessageTemplate,
        [language]: e.target.value
      }
    }));
  };

  // New handler for banner text
  const handleBannerTextChange = (e) => {
    setSettings(prev => ({
      ...prev,
      bannerText: e.target.value
    }));
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-section">
      <form onSubmit={handleSubmit}>
        {/* Banner Settings Card */}
        <div className="card mb-4">
          <div className="card-header bg-white">
            <h4 className="mb-0">Banner Settings</h4>
          </div>
          <div className="card-body">
            <div className="mb-3">
              <label className="form-label">Top Banner Text</label>
              <input
                type="text"
                className="form-control"
                value={settings.bannerText || ''}
                onChange={handleBannerTextChange}
                placeholder="Enter banner text"
              />
              <small className="text-muted d-block mt-1">
                This text appears at the top of all pages. Use "ShopNow" in your text to automatically create a clickable link.
              </small>
            </div>
            
            <div className="mt-3 p-3 bg-light rounded">
              <div className="d-flex align-items-center mb-2">
                <i className="fas fa-eye me-2 text-primary"></i>
                <strong>Preview:</strong>
              </div>
              <div className="bg-dark text-white p-2 text-center rounded">
                <p className="mb-0 small">{settings.bannerText || ''}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-4">
          <div className="card-header bg-white">
            <h4 className="mb-0">WhatsApp Message Templates</h4>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <h5>English Template</h5>
              <textarea
                className="form-control font-monospace"
                rows="15"
                value={settings.whatsappMessageTemplate?.english || ''}
                onChange={(e) => handleInputChange(e, 'english')}
              />
              <small className="text-muted d-block mt-2">
                Available variables: {'{customerName}, {orderId}, {orderDetails}, {subtotal}, {discount}, {deliveryFee}, {total}'}
              </small>
            </div>

            <div className="mb-4">
              <h5>Arabic Template</h5>
              <textarea
                className="form-control font-monospace"
                dir="rtl"
                rows="15"
                value={settings.whatsappMessageTemplate?.arabic || ''}
                onChange={(e) => handleInputChange(e, 'arabic')}
              />
              <small className="text-muted d-block mt-2">
                Available variables: {'{customerName}, {orderId}, {orderDetails}, {subtotal}, {discount}, {deliveryFee}, {total}'}
              </small>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Saving...
                </>
              ) : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SettingsSection;