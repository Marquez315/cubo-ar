/*
  Service worker del Cubo AR Educativo.
  Objetivo: habilitar el botón "Instalar app" en Chrome/Android/escritorio,
  y que la app abra (aunque sin cámara) incluso sin conexión.
  La cámara y la detección AR siempre necesitan HTTPS y conexión normal del
  navegador: el service worker no cambia eso, sólo cachea el "esqueleto" de
  la app (HTML, íconos, manifest).
*/

const VERSION = 'cubo-ar-v1';
const ARCHIVOS_APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then((cache) => cache.addAll(ARCHIVOS_APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nombres) =>
      Promise.all(nombres.filter((n) => n !== VERSION).map((n) => caches.delete(n)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Sólo nos ocupamos de pedidos GET propios; todo lo demás (CDNs de
  // AFRAME/AR.js/JSZip, YouTube, APIs, streams de cámara) sigue de largo
  // directo a la red, sin pasar por el caché.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  // El HTML se pide siempre a la red primero (para no quedar pegado con una
  // versión vieja de la app); si no hay conexión, se sirve la última copia
  // guardada en caché.
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copia = res.clone();
          caches.open(VERSION).then((cache) => cache.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
    );
    return;
  }

  // Íconos y manifest: caché primero (no cambian casi nunca), red como respaldo.
  event.respondWith(
    caches.match(req).then((r) => r || fetch(req))
  );
});
