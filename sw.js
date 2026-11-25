// Daily: abre al instante desde la copia guardada y busca la versión nueva por detrás
const CACHE = 'daily-v5';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache:'reload'}))))); self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', e => {
  const req = e.request;
  const u = new URL(req.url);
  if (req.method !== 'GET' || u.origin !== location.origin || u.searchParams.has('chk')) return;
  e.respondWith(caches.open(CACHE).then(async c => {
    const cached = await c.match(req, {ignoreSearch:true});
    const net = fetch(req, {cache:'no-store'}).then(async r => {
      if (r && r.ok) await c.put(req, r.clone());
      return r;
    }).catch(() => cached);
    if (cached){ e.waitUntil(net); return cached; }
    return net.then(r => r || c.match('./index.html'));
  }));
});
