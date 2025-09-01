import React, { useState, useEffect } from 'react';
import { useNotification } from '../../components/Notification/NotificationProvider';
import api from '../../api/api';
import styled from 'styled-components';
import { getImageUrl } from '../../utils/imageUtils';
const HeroMedia = styled.div`
  width: 100%;
  height: 300px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 8px;
`;
function HeroSection() {
  const [settings, setSettings] = useState({
    type: 'image',
    title: '',
    subtitle: '',
    mediaUrl: ''
  });
  const [loading, setLoading] = useState(false);
  const [mediaFile, setMediaFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.getSettings();
      if (response?.heroSection) {
        setSettings(response.heroSection);
        setPreviewUrl(response.heroSection.mediaUrl);
      }
    } catch (error) {
      showNotification('Failed to load hero settings', 'error');
    }
  };

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setMediaFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };


const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    const formData = new FormData();
    
    // Append all form data
    formData.append('type', settings.type);
    formData.append('title', settings.title);
    formData.append('subtitle', settings.subtitle);
    
    if (mediaFile) {
      formData.append('media', mediaFile);
    }

    const response = await api.updateHeroSettings(formData);
    
    if (response.heroSection) {
      setSettings(response.heroSection);
      setPreviewUrl(response.heroSection.mediaUrl);
      showNotification('Hero section updated successfully', 'success');
    }
  } catch (error) {
    showNotification(error.message || 'Error updating hero section', 'error');
  } finally {
    setLoading(false);
  }
};
  return (
    <div className="card">
      <div className="card-header">
        <h4 className="mb-0">Hero Section Settings</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Media Type</label>
            <select
              className="form-select"
              value={settings.type}
              onChange={(e) => setSettings(prev => ({ ...prev, type: e.target.value }))}
            >
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label">Upload {settings.type}</label>
            <input
              type="file"
              className="form-control"
              accept={settings.type === 'image' ? 'image/*' : 'video/*'}
              onChange={handleMediaChange}
            />
          </div>

          {previewUrl && (
  <div className="mb-3">
    <label className="form-label">Preview</label>
    <div className="preview-container">
      {settings.type === 'image' ? (
        <HeroMedia
          style={{
            backgroundImage: `url(${getImageUrl(previewUrl)})`
          }}
        />
      ) : (
        <video
          src={previewUrl}
          controls
          className="img-fluid rounded"
          style={{ maxHeight: '200px' }}
        />
      )}
    </div>
  </div>
)}

          <div className="mb-3">
            <label className="form-label">Title</label>
            <input
              type="text"
              className="form-control"
              value={settings.title}
              onChange={(e) => setSettings(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter hero title"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Subtitle</label>
            <textarea
              className="form-control"
              value={settings.subtitle}
              onChange={(e) => setSettings(prev => ({ ...prev, subtitle: e.target.value }))}
              placeholder="Enter hero subtitle"
              rows="2"
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
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default HeroSection;