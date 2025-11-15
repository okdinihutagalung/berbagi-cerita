const CACHE_NAME = 'storyshare-shell-v1';
const DATA_CACHE = 'storyshare-data-v1';
const SHELL_ASSETS = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/manifest.webmanifest',
  '/favicon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_ASSETS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => {
        if (!key.startsWith('storyshare-')) return null;
        if (key !== CACHE_NAME && key !== DATA_CACHE) {
          return caches.delete(key);
        }
        return null;
      }))
    )
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.origin === 'https://story-api.dicoding.dev' && url.pathname.startsWith('/v1/stories')) {
    event.respondWith(
      caches.open(DATA_CACHE).then((cache) =>
        fetch(request)
          .then((response) => {
            cache.put(request, response.clone());
            return response;
          })
          .catch(() => cache.match(request))
      )
    );
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (_) {}

  const title = data.title || 'Story baru tersedia';
  const options = {
    body: data.body || data.message || 'Buka aplikasi untuk melihat cerita.',
    icon: data.icon || '/favicon.png',
    data: {
      url: data.url || '/',
      storyId: data.storyId || null
    }
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url
    ? event.notification.data.url
    : '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(location.origin) && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'OPEN_URL', url: targetUrl, storyId: event.notification.data?.storyId || null });
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
      return null;
    })
  );
});
