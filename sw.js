/* 提詞器 Service Worker — 離線可用 */
const CACHE = 'teleprompter-v1';
const ASSETS = ['./', './es.html', './apple-touch-icon.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if(req.method !== 'GET') return;
  const isDoc = req.mode === 'navigate' ||
                (req.headers.get('accept') || '').includes('text/html');
  if(isDoc){
    // 頁面：優先拿新版，沒網路才用快取
    e.respondWith(
      fetch(req)
        .then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match('./')))
    );
  } else {
    // 其他資源：快取優先
    e.respondWith(caches.match(req).then(r => r || fetch(req)));
  }
});
