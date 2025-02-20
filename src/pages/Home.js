import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import api from '../api/api';

function Home() {
  const [heroSettings, setHeroSettings] = useState({
    type: 'image',
    mediaUrl: '/hero.jpg',
    title: 'Welcome to Our Store',
    subtitle: 'Discover Amazing Products'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.getSettings();
        console.log('Settings Response:', response);
        if (response?.heroSection) {
          setHeroSettings(response.heroSection);
          console.log('Hero Image URL:', getImageUrl(response.heroSection.mediaUrl));
        }
      } catch (error) {
        console.error('Error fetching hero settings:', error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <div>
      <div style={{ position: 'relative', width: '100%', height: '400px' }}>
        <div 
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage: `url(${getImageUrl(heroSettings.mediaUrl)})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
            zIndex: 1
          }}
        >
          <h1>{heroSettings.title}</h1>
          <p>{heroSettings.subtitle}</p>
        </div>
      </div>
    </div>
  );
}

export default Home;