const admin = require("../config/firebaseAdmin");
const Notification = require("../models/NotificationModel");

/**
 * Sends FCM notifications and stores them in DB
 */
const sendNotification = async (tokens = [], recipientIds = [], payload) => {
  const { title, body, type = 'general', data = {}, isEmergency = false } = payload;

  // ✅ If nothing to send at all
  if ((!tokens || tokens.length === 0) && (!recipientIds || recipientIds.length === 0)) {
    console.log("⚠️ No tokens or recipients provided.");
    return;
  }

  // ── 1. SEND FCM ─────────────────────────────
  if (tokens && tokens.length > 0) {
    const validTokens = tokens.filter(t => typeof t === 'string' && t.length > 0);

    if (validTokens.length > 0) {
      const message = {
        notification: { title, body },
        data: {
          ...data,
          title,
          body,
          type,
          click_action: "FLUTTER_NOTIFICATION_CLICK",
        },
        tokens: validTokens,
      };

      try {
        console.log(`🚀 Sending notifications to ${validTokens.length} tokens...`);

        const response = await admin.messaging().sendEachForMulticast(message);

        console.log(`✅ FCM Results: Success: ${response.successCount}, Failure: ${response.failureCount}`);

        // 🔍 Debug failed tokens
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success) {
              console.error(`❌ Token failed:`, validTokens[idx], resp.error);
            }
          });
        }

      } catch (err) {
        console.error("🔥 Error sending FCM:", err.message);
      }
    }
  }

  // ── 2. SAVE TO DATABASE ─────────────────────
  if (recipientIds && recipientIds.length > 0) {
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
      console.error("🔥 Error saving notifications:", err.message);
    }
  }
};

module.exports = sendNotification;