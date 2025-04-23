// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

serviceWorkerRegistration.register({
  onSuccess: registration => {
    console.log('✅ Contenu mis en cache pour usage offline');
  },
  onUpdate: registration => {
    console.log('🔄 Nouvelle version dispo, reload...');
    window.location.reload();
  }
});
