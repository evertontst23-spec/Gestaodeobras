// CAD Engenharia e SST — Service Worker limpo
// Remove cache antigo e não interfere no carregamento

self.addEventListener('install', e => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Sem interceptação — deixa o navegador carregar normalmente
self.addEventListener('fetch', e => {
  // Passa direto sem cache
  return;
});
