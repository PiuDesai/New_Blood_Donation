const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },

    type: {
      type: String,
      enum: [
        'emergency_blood_request',
        'blood_request_fulfilled',
        'donation_reminder',
        'booking_confirmed',
        'booking_cancelled',
        'report_ready',
        'nearby_donor_found',
        'system_alert',
        'general'
      ],
      required: true
    },

    title: {
      type: String,
      required: true,
      maxlength: 100
    },

    message: {
      type: String,
      required: true,
      maxlength: 500
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },

    isRead: {
      type: Boolean,
      default: false
    },

    isEmergency: {
      type: Boolean,
      default: false
    },

    readAt: {
      type: Date
    }
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ isEmergency: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
