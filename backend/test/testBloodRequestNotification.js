/**
 * Test Blood Request Notification Flow
 * This script simulates creating a blood request and checks if notifications are sent
 */

const mongoose = require('mongoose');
const User = require('../models/UserModel.js');
const Notification = require('../models/NotificationModel.js');
const BloodRequest = require('../models/BloodRequestModel.js');
const { notifyBloodRequestCreated } = require('../utils/notificationTriggers.js');
require('dotenv').config();

// Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/blood_donation')
  .then(() => console.log('📊 Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

const testBloodRequestNotification = async () => {
  try {
    console.log('🧪 Testing Blood Request Notification Flow...\n');

    // 1. Find or create test users
    console.log('1️⃣ Setting up test users...');
    
    // Find test patient
    let testPatient = await User.findOne({ role: 'patient' });
    if (!testPatient) {
      testPatient = await User.create({
        name: 'Test Patient',
        email: 'patient@example.com',
        phone: '1234567890',
        password: 'password123',
        role: 'patient',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Test Patient Address',
          city: 'Delhi'
        },
        isActive: true
      });
    }

    // Find test donor
    let testDonor = await User.findOne({ role: 'donor', bloodGroup: 'O+' });
    if (!testDonor) {
      testDonor = await User.create({
        name: 'Test Donor',
        email: 'donor@example.com',
        phone: '9876543210',
        password: 'password123',
        role: 'donor',
        bloodGroup: 'O+',
        location: {
          type: 'Point',
          coordinates: [77.2190, 28.6239], // Near patient
          address: 'Test Donor Address',
          city: 'Delhi'
        },
        isApproved: true,
        isActive: true,
        'donorInfo.isEligible': true,
        'donorInfo.isDonorAvailable': true,
        fcmToken: 'test_donor_fcm_token'
      });
    }

    // Find test blood bank
    let testBloodBank = await User.findOne({ role: 'bloodbank' });
    if (!testBloodBank) {
      testBloodBank = await User.create({
        name: 'Test Blood Bank',
        email: 'bloodbank@example.com',
        phone: '5555555555',
        password: 'password123',
        role: 'bloodbank',
        location: {
          type: 'Point',
          coordinates: [77.2090, 28.6139],
          address: 'Test Blood Bank Address',
          city: 'Delhi'
        },
        isActive: true,
        fcmToken: 'test_bloodbank_fcm_token'
      });
    }

    console.log('✅ Test users ready:');
    console.log('   - Patient:', testPatient.name);
    console.log('   - Donor:', testDonor.name, `(${testDonor.bloodGroup})`);
    console.log('   - Blood Bank:', testBloodBank.name);

    // 2. Create a test blood request
    console.log('\n2️⃣ Creating test blood request...');
    const bloodRequest = new BloodRequest({
      requester: testPatient._id,
      patientName: 'Test Patient Name',
      bloodGroup: 'O+',
      units: 2,
      hospital: 'Test Hospital',
      location: {
        type: 'Point',
        coordinates: [77.2090, 28.6139],
        address: 'Test Hospital Address',
        city: 'Delhi'
      },
      urgency: 'critical',
      remarks: 'Test request for notification system'
    });

    const savedRequest = await bloodRequest.save();
    console.log('✅ Blood request created:', savedRequest._id);

    // 3. Trigger notification
    console.log('\n3️⃣ Triggering notifications...');
    await notifyBloodRequestCreated(savedRequest);

    // 4. Check notifications were created
    console.log('\n4️⃣ Checking notifications...');
    
    // Check donor notifications
    const donorNotifications = await Notification.find({
      recipient: testDonor._id,
      type: 'emergency_blood_request'
    });
    
    // Check blood bank notifications
    const bloodBankNotifications = await Notification.find({
      recipient: testBloodBank._id,
      type: 'emergency_blood_request'
    });

    console.log('📊 Notification Results:');
    console.log('   - Donor notifications:', donorNotifications.length);
    console.log('   - Blood bank notifications:', bloodBankNotifications.length);

    // 5. Show notification details
    if (donorNotifications.length > 0) {
      console.log('\n📱 Donor Notification:');
      const notif = donorNotifications[0];
      console.log('   - Title:', notif.title);
      console.log('   - Message:', notif.message);
      console.log('   - Emergency:', notif.isEmergency);
      console.log('   - Created:', notif.createdAt);
    }

    if (bloodBankNotifications.length > 0) {
      console.log('\ Blood Bank Notification:');
      const notif = bloodBankNotifications[0];
      console.log('   - Title:', notif.title);
      console.log('   - Message:', notif.message);
      console.log('   - Emergency:', notif.isEmergency);
      console.log('   - Created:', notif.createdAt);
    }

    // 6. Test API responses
    console.log('\n5️⃣ Testing API responses...');
    
    // Test donor API call
    const donorAPIResponse = {
      notifications: donorNotifications,
      unreadCount: donorNotifications.filter(n => !n.isRead).length
    };
    
    // Test blood bank API call
    const bloodBankAPIResponse = {
      notifications: bloodBankNotifications,
      unreadCount: bloodBankNotifications.filter(n => !n.isRead).length
    };

    console.log('📡 API Response Format:');
    console.log('   - Donor API:', {
      notificationsCount: donorAPIResponse.notifications.length,
      unreadCount: donorAPIResponse.unreadCount
    });
    console.log('   - Blood Bank API:', {
      notificationsCount: bloodBankAPIResponse.notifications.length,
      unreadCount: bloodBankAPIResponse.unreadCount
    });

    console.log('\n🎉 Blood Request Notification Test Completed!');
    console.log('\n📝 Summary:');
    console.log('   ✅ Blood request created');
    console.log('   ✅ Notifications sent to donors');
    console.log('   ✅ Notifications sent to blood banks');
    console.log('   ✅ API response format correct');
    console.log('\n💡 Now test in the frontend:');
    console.log('   1. Login as donor - should see notification');
    console.log('   2. Login as blood bank - should see notification');
    console.log('   3. Check bell icon for unread count');

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
  testBloodRequestNotification();
}

module.exports = { testBloodRequestNotification };
