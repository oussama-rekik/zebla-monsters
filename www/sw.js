/* Service worker : met l'application en cache pour un lancement rapide et hors-ligne */
const CACHE='zebla-v1';
const FILES=['./','./index.html','./manifest.json','./lib/three.min.js','./lib/maplibre-gl.js','./lib/maplibre-gl.css','./js/data.js','./js/models.js','./js/scenes.js','./js/map.js','./js/app.js','./icons/icon-192.png','./icons/icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{const u=new URL(e.request.url);if(u.origin!==location.origin)return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request)));});
