import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export default messaging;


export const getFCMToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("⚠️ Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY // 🔥 Use VITE_FIREBASE_VAPID_KEY from .env
    });

    if (token) {
      console.log("✅ FCM Token Generated:", token);

      // Save token to backend using relative path or base URL
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/notifications/fcm-token`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({ fcmToken: token })
      });

      if (response.ok) {
        console.log("✅ FCM Token saved to DB successfully");
      } else {
        console.error("❌ Failed to save FCM token to DB");
      }
    } else {
      console.log("❌ No FCM token received");
    }
  } catch (err) {
    console.error("🔥 FCM Error:", err);
  }
};

// Handle foreground notifications
onMessage(messaging, (payload) => {
  console.log("📩 Foreground Message received:", payload);

  // Extract data
  const { title, body } = payload.notification || payload.data;
  
  // 1. Show browser notification
  // We use a custom notification if the browser supports it
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification(title, {
      body: body,
      icon: "/logo192.png", // Replace with your app logo path
      badge: "/logo192.png",
      tag: "blood-donation-alert", // Prevents multiple notifications for the same thing
    });
  }

  // 2. You can also trigger a custom event or use a state manager (Redux/Context)
  // to update the UI bell icon instantly without waiting for polling.
  const event = new CustomEvent('new-notification', { detail: payload });
  window.dispatchEvent(event);
});