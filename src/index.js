import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
// On enregistre le SW en passant un onUpdate
serviceWorkerRegistration.register({
    onUpdate: registration => {
      // ici, on force le reload pour que l'utilisateur voit la nouvelle version
      window.location.reload();
    }
  });


