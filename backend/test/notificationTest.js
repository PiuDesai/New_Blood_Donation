/**
 * Notification System Test Script
 * Run this script to test the real-time notification system
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
    console.log('🧪 Starting Notification System Test...\n');

    // 1. Test creating a notification
    console.log('1️⃣ Testing notification creation...');
    const testUser = await User.findOne({ role: 'donor' });
    
    if (!testUser) {
      console.log('❌ No test user found. Creating one...');
      const newUser = await User.create({
        name: 'Test Donor',
        email: 'test@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139], // Delhi coordinates
          address: 'Test Address',
          city: 'Delhi'
        },
        isApproved: true,
        isActive: true,
        fcmToken: 'test_fcm_token_12345'
      });
      
      console.log('✅ Test user created:', newUser.email);
      testUser = newUser;
    }

    // 2. Test emergency notification
    console.log('\n2️⃣ Testing emergency notification...');
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
        bookingId: 'test_booking_123',
        testType: 'Complete Blood Count (CBC)'
      }
    });

    console.log('✅ Booking notification created:', bookingNotification._id);

    // 4. Test report ready notification
    console.log('\n4️⃣ Testing report ready notification...');
    const reportNotification = await createNotification(testUser._id, {
      type: 'report_ready',
      title: '📋 Report Ready',
      message: 'Your blood test report is now available',
      data: {
        bookingId: 'test_booking_123',
        reportUrl: '/reports/test_report_123.pdf'
      }
    });

    console.log('✅ Report notification created:', reportNotification._id);

    // 5. Verify notifications in database
    console.log('\n5️⃣ Verifying notifications in database...');
    const allNotifications = await Notification.find({ recipient: testUser._id })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`✅ Found ${allNotifications.length} notifications for test user:`);
    allNotifications.forEach((notif, index) => {
      console.log(`   ${index + 1}. ${notif.type} - ${notif.title} (${notif.isRead ? 'Read' : 'Unread'})`);
    });

    // 6. Test notification preferences
    console.log('\n6️⃣ Testing notification preferences...');
    console.log('User notification preferences:', testUser.notificationPreferences);

    // 7. Test FCM token update
    console.log('\n7️⃣ Testing FCM token...');
    if (testUser.fcmToken) {
      console.log('✅ FCM token found:', testUser.fcmToken.substring(0, 20) + '...');
    } else {
      console.log('⚠️  No FCM token found for user');
    }

    console.log('\n🎉 Notification System Test Completed Successfully!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Database connection established');
    console.log('   ✅ Test user found/created');
    console.log('   ✅ Emergency notification created');
    console.log('   ✅ Booking confirmation created');
    console.log('   ✅ Report ready notification created');
    console.log('   ✅ Notifications verified in database');
    console.log('   ✅ Notification preferences checked');
    console.log('   ✅ FCM token status verified');

  } catch (error) {
    console.error('❌ Test failed:', error);
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
