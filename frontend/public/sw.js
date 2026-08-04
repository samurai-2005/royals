// 🚀 FORCE IMMEDIATE UPDATE (Bypasses the "Waiting" state trap)
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim()); // Fixed with 'self.' prefix
});

// 🔔 Listen for incoming Push Events from the backend
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch (err) {
    console.error('Push payload parse error:', err);
    data = { body: event.data.text() };
  }

  const options = {
    body: data.body || 'You have a new update from The Royal Tailor.',
    icon: data.icon || '/icon-192.png',
    badge: '/icon-192.png', 
    vibrate: [200, 100, 200, 100, 200, 100, 200], 
    requireInteraction: true, 
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'THE ROYAL TAILOR', options)
  );
});

// 👆 Handle Taps / Clicks on Notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});