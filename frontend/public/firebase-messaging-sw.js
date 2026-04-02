importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// 🔥 Replace with your actual Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBCn0t-mozBEZ9VBJBoH0tnhPn-kUKg_aI",
  authDomain: "blood-6bb33.firebaseapp.com",
  projectId: "blood-6bb33",
  storageBucket: "blood-6bb33.firebasestorage.app",
  messagingSenderId: "922808212199",
  appId: "1:922808212199:web:b31fa6367679a86ba82042",
  measurementId: "G-TNFDJ0RG3M"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'New Alert';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'You have a new notification.',
    icon: '/logo192.png',
    badge: '/logo192.png',
    data: payload.data, // Attach data for click handling
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification click Received.');
  event.notification.close();

  // Redirect to dashboard on click
  event.waitUntil(
    clients.openWindow('/') // Customize redirect URL if needed
  );
});