const Notification = require('../models/NotificationModel.js');
const User = require('../models/UserModel.js');

// ── Get My Notifications ────────────────────────────────────────
const getMyNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;

    const filter = { recipient: req.user.id };
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const unreadCount = await Notification.countDocuments({
      recipient: req.user.id,
      isRead: false
    });

    res.json({ notifications, unreadCount });

  } catch (err) {
    next(err);
  }
};

// ── Mark Single as Read ─────────────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.json({ message: 'Marked as read', notification });

  } catch (err) {
    next(err);
  }
};

// ── Mark All as Read ────────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });

  } catch (err) {
    next(err);
  }
};

// ── Delete Notification ─────────────────────────────────────────
const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user.id
    });

    if (!notification) return res.status(404).json({ message: 'Notification not found' });

    res.json({ message: 'Notification deleted' });

  } catch (err) {
    next(err);
  }
};

// ── Send Emergency Notification (Admin or System) ───────────────
const sendEmergencyNotification = async (req, res, next) => {
  try {
    const { title, message, bloodGroup, targetRoles, city } = req.body;

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    // Find target users
    const filter = { isActive: true };
    if (targetRoles && targetRoles.length > 0) filter.role = { $in: targetRoles };
    if (bloodGroup) filter.bloodGroup = bloodGroup;
    if (city) filter['location.city'] = new RegExp(city, 'i');

    const users = await User.find(filter).select('_id notificationPreferences');

    // Only notify users who have push notifications enabled or haven't disabled emergency alerts
    const eligibleUsers = users.filter(u =>
      u.notificationPreferences?.pushEnabled !== false ||
      u.notificationPreferences?.emergencyAlertsOnly === false
    );

    if (eligibleUsers.length === 0) {
      return res.status(400).json({ message: 'No eligible users found for this notification' });
    }

    const notifications = eligibleUsers.map(u => ({
      recipient: u._id,
      sender: req.user.id,
      type: 'emergency_blood_request',
      title,
      message,
      data: { bloodGroup, city },
      isEmergency: true
    }));

    await Notification.insertMany(notifications);

    res.json({
      message: `Emergency notification sent to ${eligibleUsers.length} users`,
      count: eligibleUsers.length
    });

  } catch (err) {
    next(err);
  }
};

// ── Update FCM Token ────────────────────────────────────────────
const updateFcmToken = async (req, res, next) => {
  try {
    const { fcmToken } = req.body;

    if (!fcmToken) return res.status(400).json({ message: 'FCM token is required' });

    await User.findByIdAndUpdate(req.user.id, { fcmToken });

    res.json({ message: 'FCM token updated' });

  } catch (err) {
    next(err);
  }
};

// ── Update Notification Preferences ────────────────────────────
const updateNotificationPreferences = async (req, res, next) => {
  try {
    const { pushEnabled, smsEnabled, emailEnabled, emergencyAlertsOnly } = req.body;

    const prefs = {};
    if (pushEnabled !== undefined) prefs['notificationPreferences.pushEnabled'] = pushEnabled;
    if (smsEnabled !== undefined) prefs['notificationPreferences.smsEnabled'] = smsEnabled;
    if (emailEnabled !== undefined) prefs['notificationPreferences.emailEnabled'] = emailEnabled;
    if (emergencyAlertsOnly !== undefined) prefs['notificationPreferences.emergencyAlertsOnly'] = emergencyAlertsOnly;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: prefs },
      { new: true }
    );

    res.json({ message: 'Preferences updated', notificationPreferences: user.notificationPreferences });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  sendEmergencyNotification,
  updateFcmToken,
  updateNotificationPreferences
};
