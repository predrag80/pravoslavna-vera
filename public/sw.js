// Једноставан service worker: странице и ресурси сајта се чувају на уређају,
// па апликација ради и без интернета. Подлога мапе се не чува (то долази са PMTiles фајлом).
const KES = 'pravoslavlje-v1';
const OSNOVNO = ['/', '/dobrodosli/', '/kalendar/', '/molitve/', '/pismo/', '/psaltir/', '/prolog/', '/oci/', '/ucenje/', '/hram/', '/mapa/', '/pretraga/', '/maplibre/maplibre-gl-worker.mjs', '/svetinje.geojson'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(KES).then((k) => k.addAll(OSNOVNO)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((kljucevi) => Promise.all(kljucevi.filter((k) => k !== KES).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const zahtev = e.request;
  if (zahtev.method !== 'GET' || new URL(zahtev.url).origin !== self.location.origin) return;
  // Прво мрежа (да садржај буде свеж), а без мреже — сачувана верзија.
  e.respondWith(
    fetch(zahtev)
      .then((odgovor) => {
        const kopija = odgovor.clone();
        caches.open(KES).then((k) => k.put(zahtev, kopija));
        return odgovor;
      })
      .catch(() => caches.match(zahtev).then((r) => r || caches.match('/'))),
  );
});
