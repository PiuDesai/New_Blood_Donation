const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendEmergencyNotification,
  updateFcmToken,
  updateNotificationPreferences
} = require('../controller/NotificationController.js');

// All routes require authentication
router.get('/', auth, getMyNotifications);
router.put('/mark-all-read', auth, markAllAsRead);
router.put('/:id/read', auth, markAsRead);
router.delete('/:id', auth, deleteNotification);

// Emergency notification (typically called by admin, but protected for users too)
router.post('/emergency', auth, sendEmergencyNotification);

// FCM + preferences
router.put('/fcm-token', auth, updateFcmToken);
router.put('/preferences', auth, updateNotificationPreferences);

module.exports = router;
