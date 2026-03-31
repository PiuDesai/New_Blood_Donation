/**
 * Create Test Notification
 * Simple script to create a test notification for debugging
 */

const mongoose = require('mongoose');
const User = require('../models/UserModel.js');
const Notification = require('../models/NotificationModel.js');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation')
  .then(() => console.log('📊 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const createTestNotification = async () => {
  try {
    console.log('🧪 Creating test notification...');

    // Find a test user
    const testUser = await User.findOne({ role: 'donor' });
    
    if (!testUser) {
      console.log('❌ No test user found. Creating one...');
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
        fcmToken: 'test_fcm_token_debug'
      });
    }

    console.log('✅ Found test user:', testUser.email);

    // Create a test notification
    const notification = new Notification({
      recipient: testUser._id,
      type: 'emergency_blood_request',
      title: '🚨 Test Emergency Blood Request',
      message: 'This is a test emergency notification for debugging',
      data: {
        bloodGroup: 'O+',
        hospitalName: 'Test Hospital',
        urgency: 'critical',
        test: true
      },
      isEmergency: true,
      isRead: false
    });

    const savedNotification = await notification.save();
    console.log('✅ Test notification created:', savedNotification._id);
    console.log('📝 Notification details:');
    console.log('   - Title:', savedNotification.title);
    console.log('   - Message:', savedNotification.message);
    console.log('   - Type:', savedNotification.type);
    console.log('   - Emergency:', savedNotification.isEmergency);
    console.log('   - Read:', savedNotification.isRead);
    console.log('   - Created:', savedNotification.createdAt);

    // Test API response format
    const notifications = await Notification.find({ recipient: testUser._id })
      .sort({ createdAt: -1 })
      .populate('sender', 'name')
      .lean();
    
    const unreadCount = await Notification.countDocuments({
      recipient: testUser._id,
      isRead: false
    });

    console.log('\n📊 API Response Test:');
    console.log('   - Total notifications:', notifications.length);
    console.log('   - Unread count:', unreadCount);
    console.log('   - Response format:', {
      notifications: notifications,
      unreadCount: unreadCount
    });

    console.log('\n🎉 Test notification created successfully!');
    console.log('💡 Now check the frontend to see if it appears in the bell icon.');

  } catch (error) {
    console.error('❌ Error creating test notification:', error);
  } finally {
    // Close database connection
    mongoose.connection.close();
    console.log('\n📊 Database connection closed');
  }
};

// Run the test
if (require.main === module) {
  createTestNotification();
}

module.exports = { createTestNotification };
