// src/components/Admin/SettingsSection.js
import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';

function SettingsSection() {
  const [settings, setSettings] = useState({
    whatsappMessageTemplate: {
      english: `🛍️ *New Order*
──────────────
Hello \{{customerName}}! 👋

Your order has been received ✅
Order #\{{orderId}}

──────────────
*Order Details:*

\{{orderDetails}}

──────────────
*Order Summary:*
💰 Subtotal: $\{{subtotal}}
\{{discount}}
🚚 Delivery Fee: $\{{deliveryFee}}
*Total Amount: $\{{total}}*

──────────────
We'll notify you when your order is confirmed 🚀

Thank you for your trust! 🙏`,

      arabic: `🛍️ *طلب جديد*
──────────────
مرحباً \{{customerName}}! 👋

تم استلام طلبك بنجاح ✅
رقم الطلب: #\{{orderId}}

──────────────
*تفاصيل الطلب:*

\{{orderDetails}}

──────────────
*ملخص الطلب:*
💰 المجموع الفرعي: $\{{subtotal}}
\{{discount}}
🚚 رسوم التوصيل: $\{{deliveryFee}}
*المجموع الكلي: $\{{total}}*

──────────────
سنقوم بإعلامك عندما يتم تأكيد طلبك 🚀

شكراً لثقتك بنا! 🙏`
    }
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="settings-section">
      <form onSubmit={handleSubmit}>
        <div className="card mb-4">
          <div className="card-header">
            <h4>WhatsApp Message Templates</h4>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <h5>English Template</h5>
              <textarea
                className="form-control font-monospace"
                rows="15"
                value={settings.whatsappMessageTemplate.english}
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
                value={settings.whatsappMessageTemplate.arabic}
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
              {loading ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

export default SettingsSection;