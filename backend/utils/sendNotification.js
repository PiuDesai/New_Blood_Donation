const admin = require("../config/firebaseAdmin");
const Notification = require("../models/NotificationModel");

/**
 * Push + in-app notifications.
 * @param {string[]} fcmTokens - Device tokens to try for FCM (may be empty).
 * @param {import('mongoose').Types.ObjectId[]|string[]} dbRecipientIds - Every user who should get an in-app notification row (web/mobile inbox).
 * @param {{ title: string, body: string, type?: string, data?: object, isEmergency?: boolean }} payload
 */
const sendNotification = async (fcmTokens = [], dbRecipientIds = [], payload) => {
  const { title, body, type = "general", data = {}, isEmergency = false } = payload;

  const validTokens = [...new Set((fcmTokens || []).filter((t) => typeof t === "string" && t.length > 0))];

  const seen = new Set();
  const uniqueRecipientIds = [];
  for (const id of dbRecipientIds || []) {
    if (id == null) continue;
    const key = String(id);
    if (seen.has(key)) continue;
    seen.add(key);
    uniqueRecipientIds.push(id);
  }

  if (validTokens.length === 0 && uniqueRecipientIds.length === 0) {
    if (process.env.NODE_ENV !== "production") {
      console.log("⚠️ No FCM tokens and no DB recipients; skipping notification.");
    }
    return;
  }

  const fcmData = Object.fromEntries(
    Object.entries({ ...data, title, body, type }).map(([k, v]) => [
      k,
      v === undefined || v === null ? "" : String(v),
    ])
  );

  // ── 1. FCM (optional) ─────────────────────────
  if (validTokens.length > 0) {
    // Only proceed if admin is initialized
    if (admin && admin.apps.length > 0) {
      const message = {
        notification: { title, body },
        data: { ...fcmData, click_action: "FLUTTER_NOTIFICATION_CLICK" },
        tokens: validTokens,
      };

      try {
        if (process.env.NODE_ENV !== "production") console.log(`🚀 Sending FCM to ${validTokens.length} token(s)...`);
        const response = await admin.messaging().sendEachForMulticast(message);
        if (process.env.NODE_ENV !== "production") console.log(`✅ FCM: success ${response.successCount}, failure ${response.failureCount}`);
        if (response.failureCount > 0) {
          response.responses.forEach((resp, idx) => {
            if (!resp.success && process.env.NODE_ENV !== "production") console.error("❌ FCM token failed:", validTokens[idx], resp.error?.message);
          });
        }
      } catch (err) {
        if (process.env.NODE_ENV !== "production") console.error("🔥 FCM error:", err.message);
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        console.warn("⚠️ Firebase Admin not initialized; skipping FCM notification.");
      }
    }
  }

  // ── 2. In-app notification records ──────────
  if (uniqueRecipientIds.length > 0) {
    try {
      const dbNotifications = uniqueRecipientIds.map((id) => ({
        recipient: id,
        title,
        message: body,
        type,
        data,
        isEmergency,
      }));
      await Notification.insertMany(dbNotifications);
      if (process.env.NODE_ENV !== "production") console.log(`💾 Saved ${dbNotifications.length} notification(s) to MongoDB.`);
    } catch (err) {
      if (process.env.NODE_ENV !== "production") console.error("🔥 Error saving notifications:", err.message);
    }
  }
};

module.exports = sendNotification;