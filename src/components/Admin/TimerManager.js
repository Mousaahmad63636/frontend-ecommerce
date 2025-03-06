import React, { useState, useEffect } from 'react';
import { useNotification } from '../Notification/NotificationProvider';
import api from '../../api/api';

const TimerManager = () => {
  const [timer, setTimer] = useState(null);
  const [loading, setLoading] = useState(true);
  const { showNotification } = useNotification();

  const [formData, setFormData] = useState({
    title: '',
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('.')[0]
  });

  useEffect(() => {
    fetchTimer();
  }, []);

// TimerManager.js
const fetchTimer = async () => {
  try {
    setLoading(true);
    const response = await api.getTimer();
    setTimer(response);
    if (response) {
      setFormData({
        title: response.title,
        endDate: new Date(response.endDate).toISOString().split('.')[0]
      });
    }
  } catch (error) {
    console.error('Error fetching timer:', error);
    showNotification('Failed to fetch timer', 'error');
  } finally {
    setLoading(false);
  }
};

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api.createTimer(formData);
      showNotification('Timer updated successfully', 'success');
      fetchTimer();
    } catch (error) {
      showNotification(error.message || 'Error updating timer', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!timer || !window.confirm('Are you sure you want to delete this timer?')) {
      return;
    }

    try {
      setLoading(true);
      await api.deleteTimer(timer._id);
      showNotification('Timer deleted successfully', 'success');
      setTimer(null);
      setFormData({
        title: '',
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('.')[0]
      });
    } catch (error) {
      showNotification(error.message || 'Error deleting timer', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header bg-white">
        <h4 className="mb-0">Timer Management</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Timer Title</label>
            <input
              type="text"
              className="form-control"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter timer title"
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">End Date & Time</label>
            <input
              type="datetime-local"
              className="form-control"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              // Remove the min attribute to allow any date/time
              required
            />
          </div>

          <div className="d-flex gap-2">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : timer ? 'Update Timer' : 'Create Timer'}
            </button>
            {timer && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete Timer
              </button>
            )}
          </div>
        </form>

        {timer && (
          <div className="mt-4">
            <h5>Current Timer</h5>
            <div className="card bg-light">
              <div className="card-body">
                <h6>{timer.title}</h6>
                <p className="mb-0">
                  Ends on: {new Date(timer.endDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimerManager;