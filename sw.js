const CACHE_NAME = 'kairon-v5';
const CACHE = 'kairon-sst-v4';
const ASSETS = [
  './kairon_sst.html',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/tiny_face_detector_model-shard1',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_tiny_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_landmark_68_tiny_model-shard1',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-weights_manifest.json',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-shard1',
  'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/weights/face_recognition_model-shard2'
];

// Instalação: cacheia tudo
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log('[SW] Cacheando assets...');
      return Promise.allSettled(
        ASSETS.map(url => cache.add(url).catch(err => console.warn('[SW] Falhou cache:', url, err)))
      );
    }).then(() => self.skipWaiting())
  );
});

// Ativação: limpa caches antigos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache first, network fallback
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        if (!resp || resp.status !== 200 || resp.type === 'opaque') return resp;
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return resp;
      }).catch(() => {
        // Offline fallback para o HTML principal
        if (e.request.destination === 'document') {
          return caches.match('./kairon_sst.html');
        }
      });
    })
  );
});

// Mensagens do app
self.addEventListener('message', e => {
  if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
