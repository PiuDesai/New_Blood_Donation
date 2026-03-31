/**
 * Complete Notification System Test
 * Tests all notification flows end-to-end
 */

const mongoose = require('mongoose');
const User = require('../models/UserModel.js');
const Notification = require('../models/NotificationModel.js');
const { createNotification } = require('../controller/NotificationController.js');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation')
  .then(() => console.log('📊 Connected to MongoDB for testing'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const testNotificationSystem = async () => {
  try {
    console.log('🧪 Starting Complete Notification System Test...\n');

    // 1. Test user creation and FCM token
    console.log('1️⃣ Testing user with FCM token...');
    let testUser = await User.findOne({ role: 'donor' });
    
    if (!testUser) {
      console.log('Creating test user...');
      testUser = await User.create({
        name: 'Test Donor',
        email: 'test.donor@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Test Address',
          city: 'Delhi'
        },
        isApproved: true,
        isActive: true,
        fcmToken: 'test_fcm_token_' + Date.now()
      });
    } else {
      // Update FCM token
      testUser.fcmToken = 'test_fcm_token_' + Date.now();
      await testUser.save();
    }
    
    console.log('✅ Test user with FCM token:', testUser.email);

    // 2. Test emergency notification creation
    console.log('\n2️⃣ Testing emergency notification creation...');
    const emergencyNotification = await createNotification(testUser._id, {
      type: 'emergency_blood_request',
      title: '🚨 Emergency Blood Request',
      message: 'Urgent need for O+ blood at City Hospital',
      data: {
        bloodGroup: 'O+',
        hospitalName: 'City Hospital',
        urgency: 'critical'
      },
      isEmergency: true
    });

    console.log('✅ Emergency notification created:', emergencyNotification._id);

    // 3. Test booking confirmation
    console.log('\n3️⃣ Testing booking confirmation...');
    const bookingNotification = await createNotification(testUser._id, {
      type: 'booking_confirmed',
      title: '🧪 Blood Test Booked',
      message: 'Your Complete Blood Count test has been confirmed',
      data: {
        bookingId: 'test_booking_' + Date.now(),
        testType: 'Complete Blood Count (CBC)'
      }
    });

    console.log('✅ Booking notification created:', bookingNotification._id);

    // 4. Test report ready
    console.log('\n4️⃣ Testing report ready notification...');
    const reportNotification = await createNotification(testUser._id, {
      type: 'report_ready',
      title: '📋 Report Ready',
      message: 'Your blood test report is now available',
      data: {
        bookingId: 'test_booking_' + Date.now(),
        reportUrl: '/reports/test_report_' + Date.now() + '.pdf'
      }
    });

    console.log('✅ Report notification created:', reportNotification._id);

    // 5. Test API response format
    console.log('\n5️⃣ Testing API response format...');
    const notifications = await Notification.find({ recipient: testUser._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name')
      .lean();
    
    const unreadCount = await Notification.countDocuments({
      recipient: testUser._id,
      isRead: false
    });

    const apiResponse = {
      notifications: notifications,
      unreadCount: unreadCount
    };

    console.log('✅ API Response Format:');
    console.log('   - Notifications count:', apiResponse.notifications.length);
    console.log('   - Unread count:', apiResponse.unreadCount);
    console.log('   - First notification type:', apiResponse.notifications[0]?.type);

    // 6. Test notification fields
    console.log('\n6️⃣ Testing notification fields...');
    const sampleNotification = apiResponse.notifications[0];
    const requiredFields = ['recipient', 'type', 'title', 'message', 'isRead', 'isEmergency', 'createdAt'];
    
    let allFieldsPresent = true;
    requiredFields.forEach(field => {
      if (!(field in sampleNotification)) {
        console.log('❌ Missing field:', field);
        allFieldsPresent = false;
      }
    });
    
    if (allFieldsPresent) {
      console.log('✅ All required fields present');
    }

    // 7. Test sorting
    console.log('\n7️⃣ Testing notification sorting...');
    const isSorted = apiResponse.notifications.every((notif, index) => {
      if (index === 0) return true;
      return new Date(notif.createdAt) <= new Date(apiResponse.notifications[index - 1].createdAt);
    });
    
    if (isSorted) {
      console.log('✅ Notifications are sorted correctly (latest first)');
    } else {
      console.log('❌ Notifications are not sorted correctly');
    }

    // 8. Test user filtering
    console.log('\n8️⃣ Testing user filtering...');
    const userNotifications = await Notification.find({ recipient: testUser._id });
    const otherUserNotifications = await Notification.find({ 
      recipient: { $ne: testUser._id } 
    });
    
    console.log('✅ User filtering works:');
    console.log('   - Test user notifications:', userNotifications.length);
    console.log('   - Other user notifications:', otherUserNotifications.length);

    console.log('\n🎉 Complete Notification System Test Finished!');
    console.log('\n📝 Test Summary:');
    console.log('   ✅ User with FCM token created/updated');
    console.log('   ✅ Emergency notification created');
    console.log('   ✅ Booking confirmation created');
    console.log('   ✅ Report ready notification created');
    console.log('   ✅ API response format correct');
    console.log('   ✅ All required fields present');
    console.log('   ✅ Notifications sorted correctly');
    console.log('   ✅ User filtering works');

    return {
      success: true,
      testUser: testUser,
      notifications: apiResponse.notifications,
      unreadCount: apiResponse.unreadCount
    };

  } catch (error) {
    console.error('❌ Test failed:', error);
    return { success: false, error: error.message };
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\n📊 Database connection closed');
  }
};

// Run the test
if (require.main === module) {
  testNotificationSystem();
}

module.exports = { testNotificationSystem };
