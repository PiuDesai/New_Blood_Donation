import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";


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

export default messaging;


export const getFCMToken = async (userId) => {
  try {
    const permission = await Notification.requestPermission();

    if (permission !== "granted") {
      console.log("⚠️ Notification permission denied");
      return;
    }

    const token = await getToken(messaging, {
      vapidKey: "BEh47UKUnuUc-7vyh_OH43y5BpBORRdMD8oOYJlFQNJiVi6IwvPys4Y3sgy8GFLlYSpUI_s13a3VPeDTPClEscM" // 🔥 Replace with your actual VAPID key from Firebase Console
    });

    if (token) {
      console.log("✅ FCM Token Generated:", token);

      // Save token to backend
      const response = await fetch("http://localhost:5000/api/save-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ userId, token })
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