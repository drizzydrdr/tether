importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// Must match src/lib/firebase.js — service workers can't import from src,
// so this config is duplicated here.
firebase.initializeApp({
  apiKey: "AIzaSyDRCDF9q2sRxm0wWF1uXxRyGZ1hJKJwvZ4",
  authDomain: "tether-b171c.firebaseapp.com",
  projectId: "tether-b171c",
  storageBucket: "tether-b171c.firebasestorage.app",
  messagingSenderId: "779714006487",
  appId: "1:779714006487:web:ea4b370c389b16917e8f92",
  measurementId: "G-E668RDZ266",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Tether';
  const options = {
    body: payload.notification?.body || 'Where are you right now?',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data: { url: '/tether/#/checkin?source=ping' },
  };
  self.registration.showNotification(title, options);
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
