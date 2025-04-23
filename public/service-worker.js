// public/service-worker.js

// 1. Charger Workbox depuis le CDN
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 2. Prendre immédiatement le contrôle dès l’install et l’activate
self.addEventListener('install',  event => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

// 3. Précache tout le manifest injecté par CRA
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// 4. Forcer le fallback navigation vers index.html, même pour une URL contenant un “.”
const navigationHandler = async ({event}) => {
  return caches.match('/index.html', { ignoreSearch: true });
};
const navRoute = new workbox.routing.NavigationRoute(navigationHandler, {
  allowlist: [/.*/]  // <— on n’exclut plus rien
});
workbox.routing.registerRoute(navRoute);

// 5. Stratégie Cache-First ou Network-First pour tes assets
workbox.routing.registerRoute(
  ({request}) => ['script', 'style', 'image'].includes(request.destination),
  new workbox.strategies.NetworkFirst({
    cacheName: 'assets',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60 })
    ]
  })
);
