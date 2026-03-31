# Real-Time Notification System

A comprehensive real-time notification system for the Smart Blood Donation application using Firebase Cloud Messaging (FCM) and Node.js.

## 🚀 Features

### Backend Features
- **Firebase Cloud Messaging (FCM)** integration for push notifications
- **Database notifications** with MongoDB storage
- **User preferences** for notification control
- **Emergency notifications** with priority handling
- **Notification triggers** for key events
- **Real-time delivery** with fallback polling

### Frontend Features
- **Real-time notification listener** using Firebase messaging
- **Notification bell component** with unread count
- **Permission handling** for browser notifications
- **Toast notifications** for foreground messages
- **Notification management** (mark read, delete, preferences)
- **Responsive UI** with modern design

## 📁 Architecture

### Backend Structure
```
backend/
├── models/
│   └── NotificationModel.js          # Notification schema
├── controller/
│   └── NotificationController.js     # API endpoints & logic
├── services/
│   └── notificationService.js        # Firebase FCM service
├── utils/
│   └── notificationTriggers.js       # Event-based notifications
├── routes/
│   └── NotificationRoute.js          # API routes
└── test/
    └── notificationTest.js           # System tests
```

### Frontend Structure
```
frontend/src/
├── context/
│   └── NotificationContext.jsx      # Notification state management
├── components/
│   └── NotificationBell.jsx         # UI component
├── firebase.js                      # Firebase configuration
└── public/
    └── firebase-messaging-sw.js     # Service worker
```

## 🔧 Setup Instructions

### Backend Setup

1. **Firebase Configuration**
   - Download service account key from Firebase Console
   - Save as `firebase-service-account.json` in backend root
   - Or set `FIREBASE_SERVICE_ACCOUNT` environment variable

2. **Dependencies** (already installed)
   ```json
   "firebase-admin": "^13.7.0"
   ```

3. **Environment Variables**
   ```env
   FIREBASE_SERVICE_ACCOUNT=your_service_account_json
   MONGODB_URI=mongodb://localhost:27017/blood_donation
   ```

### Frontend Setup

1. **Firebase Configuration** (already configured)
   - Update `firebase.js` with your Firebase config
   - Update `firebase-messaging-sw.js` with same config

2. **Dependencies** (already installed)
   ```json
   "firebase": "^12.11.0"
   ```

## 📱 Notification Types

### Emergency Notifications
- `emergency_blood_request` - Urgent blood requests
- High priority with special UI treatment

### System Notifications
- `blood_request_fulfilled` - Request completed
- `booking_confirmed` - Test booking confirmed
- `report_ready` - Test report available
- `donation_reminder` - Eligibility reminders
- `nearby_donor_found` - Donor matches found

## 🔄 Notification Flow

### 1. Blood Request Created
```
Patient creates request → Notify nearby donors → Push notifications sent
```

### 2. Blood Request Fulfilled
```
Blood bank issues blood → Notify patient → Confirmation sent
```

### 3. Blood Test Booked
```
User books test → Confirm booking → Notify user and blood bank
```

### 4. Report Ready
```
Report generated → Notify user → Download available
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
node test/notificationTest.js
```

### Test Frontend Notifications
1. Open application in browser
2. Grant notification permissions
3. Create blood request or book test
4. Check for real-time notifications

## 🛠 API Endpoints

### Notification Management
- `GET /api/notifications` - Get user notifications
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `PUT /api/notifications/mark-all-read` - Mark all as read
- `DELETE /api/notifications/:id` - Delete notification
- `POST /api/notifications/emergency` - Send emergency notification

### FCM Management
- `PUT /api/notifications/fcm-token` - Update FCM token
- `PUT /api/notifications/preferences` - Update preferences

## 🎯 User Preferences

Users can control:
- **Push notifications** - Enable/disable all push notifications
- **SMS notifications** - Enable/disable SMS alerts
- **Email notifications** - Enable/disable email alerts
- **Emergency only** - Receive only emergency notifications

## 🔔 Real-Time Features

### Foreground Messages
- Toast notifications appear when app is active
- Notification bell updates in real-time
- Custom event system for UI updates

### Background Messages
- Service worker handles background notifications
- Native browser notifications displayed
- App badge updates (when supported)

## 🚨 Emergency Notifications

Emergency notifications have:
- Higher priority in FCM
- Special UI treatment (red border, alert icon)
- Immediate delivery regardless of user preferences
- Wider recipient radius (50km for donors)

## 📊 Monitoring & Analytics

### Notification Metrics
- Delivery success rates
- Open rates
- Click-through rates
- User engagement

### Logging
- All notifications logged to database
- FCM delivery status tracked
- Error handling and retry logic

## 🔒 Security Considerations

- FCM tokens encrypted in database
- User authentication required for all endpoints
- Rate limiting on notification sending
- Input sanitization and validation

## 🚀 Performance Optimizations

- Batch notification sending
- Efficient database queries with indexes
- Lazy loading for notification history
- Service worker caching

## 🐛 Troubleshooting

### Common Issues

1. **Notifications not received**
   - Check browser permissions
   - Verify FCM token is registered
   - Check Firebase project settings

2. **Service worker not working**
   - Ensure service worker is registered
   - Check browser console for errors
   - Verify HTTPS connection

3. **Firebase initialization errors**
   - Check service account key format
   - Verify Firebase project ID
   - Check network connectivity

### Debug Commands
```javascript
// Check notification permissions
console.log('Permission:', Notification.permission);

// Check FCM token
import { requestForToken } from './firebase';
const token = await requestForToken();
console.log('FCM Token:', token);
```

## 📱 Browser Support

- Chrome 50+
- Firefox 44+
- Safari 11.1+
- Edge 79+

## 🔄 Future Enhancements

- SMS notification integration
- Email notification system
- Push notification analytics
- Notification templates
- Scheduled notifications
- Geofenced notifications
