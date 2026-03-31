const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin SDK
// Note: You should download your service account key from Firebase Console
// Project Settings > Service Accounts > Generate new private key
// Save it as 'firebase-service-account.json' in the backend root or set env variables
try {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : require('../firebase-service-account.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('🔥 Firebase Admin initialized');
} catch (error) {
  console.error('❌ Firebase Admin initialization failed:', error.message);
}

/**
 * Send push notification to a single device or multiple devices
 * @param {string|string[]} tokens - FCM token(s)
 * @param {Object} notification - { title, body }
 * @param {Object} data - Additional data payload
 */
const sendPushNotification = async (tokens, notification, data = {}) => {
  if (!tokens || (Array.isArray(tokens) && tokens.length === 0)) return;

  const message = {
    notification,
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK', // for mobile apps if needed
    },
  };

  try {
    if (Array.isArray(tokens)) {
      // Send to multiple devices
      const response = await admin.messaging().sendEachForMulticast({
        tokens,
        ...message
      });
      console.log(`✅ Sent ${response.successCount} notifications successfully`);
      return response;
    } else {
      // Send to single device
      const response = await admin.messaging().send({
        token: tokens,
        ...message
      });
      console.log('✅ Sent notification successfully:', response);
      return response;
    }
  } catch (error) {
    console.error('❌ Error sending push notification:', error);
  }
};

module.exports = {
  sendPushNotification
};
