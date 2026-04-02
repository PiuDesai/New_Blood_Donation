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

  if (!recipientIds || recipientIds.length === 0) {
    console.log("⚠️ No recipient IDs provided for notification.");
    return;
  }

  // 1. Prepare FCM Message
  let fcmSuccess = false;
  if (tokens && tokens.length > 0) {
    const message = {
      notification: { title, body },
      data: {
        ...data,
        title,
        body,
        type,
        click_action: "FLUTTER_NOTIFICATION_CLICK",
      },
      tokens: tokens.filter(t => typeof t === 'string' && t.length > 0),
    };

    try {
      if (message.tokens.length > 0) {
        console.log(`🚀 Sending notifications to ${message.tokens.length} tokens...`);
        const response = await admin.messaging().sendEachForMulticast(message);
        console.log(`✅ FCM Results: Success: ${response.successCount}, Failure: ${response.failureCount}`);
        fcmSuccess = true;
      }
    } catch (err) {
      console.error("🔥 Error sending FCM:", err.message);
    }
  }

  // 3. Store in Database for each recipient
  try {
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
  } catch (err) {
    console.error("🔥 Error saving to DB:", err.message);
  }
};

module.exports = sendNotification;