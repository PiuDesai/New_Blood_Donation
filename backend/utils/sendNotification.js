const admin = require("../config/firebaseAdmin");
const Notification = require("../models/NotificationModel");

/**
 * Sends FCM notifications to multiple tokens and stores them in the database.
 * @param {string[]} tokens - Array of FCM tokens.
 * @param {string[]} recipientIds - Array of MongoDB User IDs corresponding to the tokens.
 * @param {Object} payload - Notification data { title, body, type, data, isEmergency }
 */
const sendNotification = async (tokens, recipientIds, payload) => {
  const { title, body, type = 'general', data = {}, isEmergency = false } = payload;

  if (!tokens || tokens.length === 0) {
    console.log("⚠️ No FCM tokens provided for notification.");
    return;
  }

  // 1. Prepare FCM Message
  // Note: We use 'data' for foreground handling and 'notification' for background.
  const message = {
    notification: { title, body },
    data: {
      ...data,
      title,
      body,
      type,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for some SDKs, but good for web too
    },
    tokens: tokens.filter(t => typeof t === 'string' && t.length > 0),
  };

  try {
    // 2. Send FCM Notifications
    console.log(`🚀 Sending notifications to ${message.tokens.length} tokens...`);
    const response = await admin.messaging().sendEachForMulticast(message);
    
    console.log(`✅ FCM Results: Success: ${response.successCount}, Failure: ${response.failureCount}`);

    // Log failures for debugging
    if (response.failureCount > 0) {
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          console.error(`❌ Token ${tokens[idx]} failed with error:`, resp.error);
        }
      });
    }

    // 3. Store in Database for each recipient
    if (recipientIds && recipientIds.length > 0) {
      const dbNotifications = recipientIds.map(id => ({
        recipient: id,
        title,
        message: body,
        type,
        data,
        isEmergency,
      }));

      await Notification.insertMany(dbNotifications);
      console.log(`💾 Saved ${dbNotifications.length} notifications to MongoDB.`);
    }

  } catch (err) {
    console.error("🔥 Error in sendNotification utility:", err);
  }
};

module.exports = sendNotification;