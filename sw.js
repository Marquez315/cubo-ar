/*
  Service worker del Cubo AR Educativo.
  Objetivo: habilitar el botón "Instalar app" en Chrome/Android/escritorio,
  y que la app abra (aunque sin cámara) incluso sin conexión.
  La cámara y la detección AR siempre necesitan HTTPS y conexión normal del
  navegador: el service worker no cambia eso, sólo cachea el "esqueleto" de
  la app (HTML, íconos, manifest).
*/

const VERSION = 'cubo-ar-v2';
const ARCHIVOS_APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

// Librerías externas (CDN): se guardan la primera vez que cargan con
// internet, así después la app arranca sin conexión también.
const LIBRERIAS_CDN = [
  'https://cdn.jsdelivr.net/npm/aframe@1.6.0/dist/aframe-master.min.js',
  'https://cdn.jsdelivr.net/npm/@ar-js-org/ar.js@3.4.8/aframe/build/aframe-ar.js',
  'https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(VERSION).then(async (cache) => {
      await cache.addAll(ARCHIVOS_APP_SHELL);
      // Las librerías CDN se piden con { mode: 'no-cors' } por si el
      // servidor no manda las cabeceras CORS habituales; igual quedan
      // utilizables como <script src>.
      await Promise.all(
        LIBRERIAS_CDN.map((url) =>
          fetch(url, { mode: 'no-cors' }).then((res) => cache.put(url, res)).catch(() => {})
        )
      );
    })
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
  if (req.method !== 'GET') return;

  // Librerías CDN (A-Frame / AR.js / JSZip): caché primero, para que
  // arranquen sin conexión una vez que se guardaron con internet.
  if (LIBRERIAS_CDN.includes(req.url)) {
    event.respondWith(
      caches.match(req).then((r) => r || fetch(req, { mode: 'no-cors' }))
    );
    return;
  }

  // Cualquier otro pedido de otro origen (YouTube, streams de cámara, APIs)
  // sigue de largo directo a la red, sin pasar por el caché.
  if (new URL(req.url).origin !== self.location.origin) return;

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
