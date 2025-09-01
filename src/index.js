import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import * as serviceWorkerRegistration from './services/serviceWorkerRegistration';

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
 <React.StrictMode>
   <App />
 </React.StrictMode>
);

// Register service worker for caching and offline support
serviceWorkerRegistration.register({
  onSuccess: (registration) => {
    console.log('Service Worker registered successfully for offline caching');
  },
  onUpdate: (registration) => {
    console.log('New app version available! Please refresh the page.');
    // You can show a notification to the user here
    serviceWorkerRegistration.showUpdateAvailableNotification();
  }
});