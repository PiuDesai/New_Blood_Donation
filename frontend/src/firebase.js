import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Replace with your Firebase config from Firebase Console
// Project Settings > General > Web apps
const firebaseConfig = {
  apiKey: "AIzaSyBCn0t-mozBEZ9VBJBoH0tnhPn-kUKg_aI",
  authDomain: "blood-6bb33.firebaseapp.com",
  projectId: "blood-6bb33",
  storageBucket: "blood-6bb33.firebasestorage.app",
  messagingSenderId: "922808212199",
  appId: "1:922808212199:web:b31fa6367679a86ba82042",
  measurementId: "G-TNFDJ0RG3M"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestForToken = async () => {
  try {
    // Check if notifications are supported
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return null;
    }

    // Check current permission status
    const currentPermission = Notification.permission;
    console.log("Current notification permission:", currentPermission);

    if (currentPermission === 'denied') {
      console.warn("Notification permission was denied. User must manually enable in browser settings.");
      return null;
    }

    if (currentPermission === 'granted') {
      // Ensure service worker is registered
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        console.log("Service Worker registered with scope:", registration.scope);
        
        const currentToken = await getToken(messaging, {
          vapidKey: "BEh47UKUnuUc-7vyh_OH43y5BpBORRdMD8oOYJlFQNJiVi6IwvPys4Y3sgy8GFLlYSpUI_s13a3VPeDTPClEscM",
          serviceWorkerRegistration: registration
        });

        if (currentToken) {
          console.log("FCM Token:", currentToken);
          return currentToken;
        } else {
          console.log("No registration token available.");
        }
      }
    } else {
      // Permission is 'default' - request it
      console.log("Requesting notification permission...");
      const permission = await Notification.requestPermission();
      console.log("Permission request result:", permission);
      
      if (permission === 'granted') {
        return await requestForToken(); // Retry after permission granted
      } else {
        console.warn("Notification permission denied");
        return null;
      }
    }
  } catch (err) {
    console.error("An error occurred while retrieving token. ", err);
    return null;
  }
};

export const onMessageListener = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log("Payload received: ", payload);
    callback(payload);
  });
};
