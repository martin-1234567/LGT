// public/service-worker.js
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// 1️⃣ Installer / activer tout de suite
self.addEventListener('install',  e => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// 2️⃣ Précache tout le manifest injecté (CRA + Workbox)
workbox.precaching.precacheAndRoute(self.__WB_MANIFEST || []);

// 3️⃣ NetworkFirst pour toute navigation (même avec un point)
const pageStrategy = new workbox.strategies.NetworkFirst({
  cacheName: 'page-cache',
  plugins: [
    new workbox.expiration.ExpirationPlugin({ maxEntries: 10 })
  ]
});
const navRoute = new workbox.routing.NavigationRoute(pageStrategy, {
  allowlist: [/.*/]     // on accepte toutes les URLs
});
workbox.routing.registerRoute(navRoute);

// 4️⃣ CacheFirst pour les assets statiques
workbox.routing.registerRoute(
  ({request}) => ['script','style','image','font'].includes(request.destination),
  new workbox.strategies.CacheFirst({
    cacheName: 'asset-cache',
    plugins: [
      new workbox.expiration.ExpirationPlugin({ maxEntries: 60 })
    ]
  })
);
