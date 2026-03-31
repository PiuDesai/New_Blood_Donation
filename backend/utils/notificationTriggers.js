const { createNotification } = require('../controller/NotificationController.js');
const User = require('../models/UserModel.js');

/**
 * Trigger notification when a blood request is created
 */
const notifyBloodRequestCreated = async (bloodRequest) => {
  try {
    console.log('🚨 Creating notifications for blood request:', bloodRequest._id);
    
    // 1. Notify nearby donors with matching blood group
    const donors = await User.find({
      role: 'donor',
      bloodGroup: bloodRequest.bloodGroup,
      isActive: true,
      isApproved: true,
      'donorInfo.isEligible': true,
      'donorInfo.isDonorAvailable': true,
      location: {
        $near: {
          $geometry: bloodRequest.location,
          $maxDistance: 50000 // 50km radius
        }
      }
    }).select('_id name email fcmToken notificationPreferences');

    console.log(`Found ${donors.length} eligible donors`);

    // Create notifications for each donor
    const donorNotifications = donors.map(donor => ({
      recipient: donor._id,
      type: 'emergency_blood_request',
      title: `🚨 Urgent: ${bloodRequest.bloodGroup} blood needed`,
      message: `Blood needed at ${bloodRequest.hospitalName || 'Local Hospital'}. Your blood type matches!`,
      data: {
        bloodRequestId: bloodRequest._id,
        bloodGroup: bloodRequest.bloodGroup,
        hospitalName: bloodRequest.hospitalName,
        urgency: bloodRequest.urgency
      },
      isEmergency: bloodRequest.urgency === 'critical'
    }));

    // 2. Notify all blood banks in the same city
    const bloodBanks = await User.find({
      role: 'bloodbank',
      isActive: true,
      'location.city': bloodRequest.location?.city || { $exists: true }
    }).select('_id name email fcmToken notificationPreferences');

    console.log(`Found ${bloodBanks.length} blood banks`);

    // Create notifications for each blood bank
    const bloodBankNotifications = bloodBanks.map(bloodBank => ({
      recipient: bloodBank._id,
      sender: bloodRequest.requester,
      type: 'emergency_blood_request',
      title: `🚨 New Blood Request: ${bloodRequest.bloodGroup}`,
      message: `${bloodRequest.patientName} needs ${bloodRequest.units} units at ${bloodRequest.hospitalName}`,
      data: {
        bloodRequestId: bloodRequest._id,
        bloodGroup: bloodRequest.bloodGroup,
        patientName: bloodRequest.patientName,
        units: bloodRequest.units,
        hospitalName: bloodRequest.hospitalName,
        urgency: bloodRequest.urgency
      },
      isEmergency: bloodRequest.urgency === 'critical'
    }));

    // Send all notifications
    const allNotifications = [...donorNotifications, ...bloodBankNotifications];
    
    if (allNotifications.length > 0) {
      const promises = allNotifications.map(notification => 
        createNotification(notification.recipient, notification, notification.sender)
      );
      
      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`✅ Notifications sent: ${successful} successful, ${failed} failed`);
      console.log(`   - Donors notified: ${donorNotifications.length}`);
      console.log(`   - Blood banks notified: ${bloodBankNotifications.length}`);
    } else {
      console.log('⚠️ No eligible recipients found for notification');
    }
    
  } catch (error) {
    console.error('Error notifying blood request created:', error);
  }
};

/**
 * Trigger notification when blood request is fulfilled
 */
const notifyBloodRequestFulfilled = async (bloodRequest, donorId) => {
  try {
    // Notify the patient who made the request
    await createNotification(bloodRequest.patientId, {
      type: 'blood_request_fulfilled',
      title: 'Blood Request Fulfilled!',
      message: `A donor has been found for your ${bloodRequest.bloodGroup} blood request.`,
      data: {
        bloodRequestId: bloodRequest._id,
        donorId: donorId
      }
    });

    console.log('✅ Notified patient about fulfilled blood request');
  } catch (error) {
    console.error('Error notifying blood request fulfilled:', error);
  }
};

/**
 * Trigger notification for donation reminder
 */
const notifyDonationReminder = async (donorId) => {
  try {
    const donor = await User.findById(donorId);
    if (!donor || donor.role !== 'donor') return;

    await createNotification(donorId, {
      type: 'donation_reminder',
      title: 'Time to Donate Again!',
      message: 'You are eligible to donate blood again. Schedule your donation today!',
      data: {
        lastDonatedAt: donor.donorInfo.lastDonatedAt
      }
    });

    console.log('✅ Sent donation reminder to donor');
  } catch (error) {
    console.error('Error sending donation reminder:', error);
  }
};

/**
 * Trigger notification when blood test booking is confirmed
 */
const notifyBookingConfirmed = async (bookingId, userId) => {
  try {
    await createNotification(userId, {
      type: 'booking_confirmed',
      title: 'Blood Test Booking Confirmed',
      message: 'Your blood test appointment has been confirmed. Please arrive on time.',
      data: {
        bookingId: bookingId
      }
    });

    console.log('✅ Notified user about booking confirmation');
  } catch (error) {
    console.error('Error notifying booking confirmed:', error);
  }
};

/**
 * Trigger notification when blood test report is ready
 */
const notifyReportReady = async (bookingId, userId) => {
  try {
    await createNotification(userId, {
      type: 'report_ready',
      title: 'Blood Test Report Ready',
      message: 'Your blood test report is now available for viewing.',
      data: {
        bookingId: bookingId
      }
    });

    console.log('✅ Notified user about report readiness');
  } catch (error) {
    console.error('Error notifying report ready:', error);
  }
};

/**
 * Trigger notification when nearby donor is found
 */
const notifyNearbyDonorFound = async (patientId, donorCount, bloodGroup) => {
  try {
    await createNotification(patientId, {
      type: 'nearby_donor_found',
      title: 'Nearby Donors Available',
      message: `${donorCount} donors with ${bloodGroup} blood group found near your location.`,
      data: {
        donorCount: donorCount,
        bloodGroup: bloodGroup
      }
    });

    console.log('✅ Notified patient about nearby donors');
  } catch (error) {
    console.error('Error notifying nearby donor found:', error);
  }
};

module.exports = {
  notifyBloodRequestCreated,
  notifyBloodRequestFulfilled,
  notifyDonationReminder,
  notifyBookingConfirmed,
  notifyReportReady,
  notifyNearbyDonorFound
};
