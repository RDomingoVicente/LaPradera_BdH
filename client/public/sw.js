import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// PUSH NOTIFICATIONS
self.addEventListener('push', (event) => {
  let data = { title: 'La Pradera', message: 'Nueva notificación' };
  
  if (event.data) {
    try {
      const payload = event.data.json();
      data = { ...data, ...payload };
    } catch (e) {
      data.message = event.data.text();
    }
  }

  const options = {
    body: data.message,
    icon: '/pwa-192x192.png', // Ensure this exists or use logo
    badge: '/pwa-192x192.png', // Small monochrome icon ideally
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
       // If a window is open, focus it
       for (let i = 0; i < windowClients.length; i++) {
         const client = windowClients[i];
         if (client.url === '/' && 'focus' in client) {
           return client.focus();
         }
       }
       // If no window is open, open a new one
       if (clients.openWindow) {
         return clients.openWindow(event.notification.data.url);
       }
    })
  );
});
