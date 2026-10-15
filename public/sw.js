// Simple service worker: the site's pages and assets are cached on the device,
// so the app also works offline. Map tiles are not cached (that will come with a PMTiles file).
const CACHE = 'pravoslavlje-v1';
const CORE = ['/', '/dobrodosli/', '/kalendar/', '/molitve/', '/slava/', '/podsetnici/', '/planovi/', '/citanja/', '/pismo/', '/pismo/obelezeno/', '/psaltir/', '/prolog/', '/oci/', '/ucenje/', '/hram/', '/mapa/', '/pretraga/', '/maplibre/maplibre-gl-worker.mjs', '/svetinje.geojson'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const request = e.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;
  // Network first (so content stays fresh), and the cached version when offline.
  e.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return response;
      })
      .catch(() => caches.match(request).then((r) => r || caches.match('/'))),
  );
});
