// Mengubah nama cache akan memaksa browser memperbarui semua file (Update aplikasi)
const CACHE_NAME = 'spj-cam-v4.7.7';

// Daftar file yang akan disimpan di memori HP agar bisa dibuka tanpa internet
const assets = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://cdn.tailwindcss.com'
];

// Proses Instalasi Service Worker
self.addEventListener('install', (evt) => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching aset utama...');
      return cache.addAll(assets);
    })
  );
  // Langsung aktifkan SW tanpa menunggu tab browser ditutup
  self.skipWaiting();
});

// Membersihkan cache versi lama agar tidak memenuhi memori HP
self.addEventListener('activate', (evt) => {
  evt.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

// Strategi Fetch: Ambil dari Cache dulu, jika tidak ada baru ambil dari Internet
self.addEventListener('fetch', (evt) => {
  evt.respondWith(
    caches.match(evt.request).then((cacheRes) => {
      return cacheRes || fetch(evt.request).then((fetchRes) => {
        // Simpan file baru ke cache secara dinamis jika diperlukan
        return caches.open(CACHE_NAME).then((cache) => {
          // Hanya cache request dari asal yang sama (Internal)
          if (evt.request.url.startsWith(self.location.origin)) {
            cache.put(evt.request.url, fetchRes.clone());
          }
          return fetchRes;
        });
      });
    }).catch(() => {
      // Jika benar-benar offline dan file tidak ada di cache, arahkan ke index.html
      if (evt.request.url.indexOf('.html') > -1) {
        return caches.match('./index.html');
      }
    })
  );
});
