// src/serviceWorkerRegistration.js

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  // 127.0.0.1/8
  window.location.hostname.match(
    /^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/
  )
);

export function register(config) {
  if (process.env.NODE_ENV === 'production' && 'serviceWorker' in navigator) {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      // En local, on vérifie que le SW existe réellement
      checkValidServiceWorker(swUrl, config);
      navigator.serviceWorker.ready.then(() => {
        console.log('✅ Service Worker actif (mode localhost)');
      });
    } else {
      // En prod, on enregistre directement
      registerValidSW(swUrl, config);
    }
  }
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      console.log('📦 Service Worker enregistré :', registration);

      // 🔔 Si un SW est déjà “waiting” au moment de l'enregistrement, on déclenche tout de suite onUpdate()
      if (registration.waiting && config && config.onUpdate) {
        config.onUpdate(registration);
      }

      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (!installingWorker) return;

        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // Nouvelle version dispo
              console.log('🆕 Nouveau contenu dispo, rechargez la page.');
              if (config && config.onUpdate) {
                config.onUpdate(registration);
              }
            } else {
              // Première installation
              console.log('🔹 Contenu mis en cache pour usage offline.');
              if (config && config.onSuccess) {
                config.onSuccess(registration);
              }
            }
          }
        };
      };
    })
    .catch((error) => {
      console.error('❌ Erreur enregistrement Service Worker:', error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // Vérifie que le fichier sw existe bien
  fetch(swUrl, { headers: { 'Service-Worker': 'script' } })
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (
        response.status === 404 ||
        (contentType && contentType.indexOf('javascript') === -1)
      ) {
        // Pas de SW valide sur le serveur, on désenregistre l'actuel
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => {
            window.location.reload();
          });
        });
      } else {
        // SW trouvé, on l'enregistre
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      console.log('🔌 Pas de connexion Internet. Mode hors-ligne activé.');
    });
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error(error.message);
      });
  }
}
