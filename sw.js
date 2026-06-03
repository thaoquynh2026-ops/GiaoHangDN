const CACHE = 'ghn-v4';
const ASSETS = [
  './',
  './index.html',
  './admin.html',
  './driver.html',
  './danh-cho-quan.html',
  './app.js',
  './main.js',
  './style.css',
  './manifest.json',
  './icon-72.png',
  './icon-96.png',
  './icon-128.png',
  './icon-144.png',
  './icon-152.png',
  './icon-192.png',
  './icon-384.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './icon.png',
];

// Cai dat: pre-cache tat ca asset chinh
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS.filter(a => {
        // Bo qua cac file co the khong ton tai
        return true;
      })))
      .catch(() => {})
  );
  self.skipWaiting();
});

// Kich hoat: xoa cache cu
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Cache-first voi network fallback
self.addEventListener('fetch', e => {
  // Bo qua request khong phai GET
  if (e.request.method !== 'GET') return;

  // Bo qua Firebase va external API (can mang de hoat dong)
  const url = e.request.url;
  if (
    url.includes('firebaseio.com') ||
    url.includes('googleapis.com/firebase') ||
    url.includes('gstatic.com/firebasejs') ||
    url.includes('api.qrserver.com') ||
    url.includes('api.telegram.org')
  ) {
    return; // De browser xu ly binh thuong
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      // Neu co trong cache, dung luon (cache-first)
      if (cached) {
        // Ngam hieu-cap nhat trong background
        fetch(e.request)
          .then(res => {
            if (res && res.ok && res.type !== 'opaque') {
              caches.open(CACHE).then(c => c.put(e.request, res.clone()));
            }
          })
          .catch(() => {});
        return cached;
      }

      // Khong co cache, lay tu mang
      return fetch(e.request)
        .then(res => {
          // Cache cac file tinh (js, css, png, html)
          if (res && res.ok && res.type !== 'opaque') {
            const resClone = res.clone();
            caches.open(CACHE).then(c => c.put(e.request, resClone));
          }
          return res;
        })
        .catch(() => {
          // Offline: tra ve trang chinh neu la navigation request
          if (e.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
        });
    })
  );
});

// Nhan thong bao push (co the mo rong sau)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: 'GiaoHangDN', body: 'Ban co thong bao moi' };
  e.waitUntil(
    self.registration.showNotification(data.title || 'GiaoHangDN', {
      body: data.body || '',
      icon: './icon-192.png',
      badge: './icon-96.png',
      vibrate: [200, 100, 200],
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./index.html'));
});
