importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBCn0t-mozBEZ9VBJBoH0tnhPn-kUKg_aI",
  authDomain: "blood-6bb33.firebaseapp.com",
  projectId: "blood-6bb33",
  storageBucket: "blood-6bb33.firebasestorage.app",
  messagingSenderId: "922808212199",
  appId: "1:922808212199:web:b31fa6367679a86ba82042"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/firebase-logo.png' // Replace with your icon path
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
