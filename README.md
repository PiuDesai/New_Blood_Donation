# 🩸 BloodMatrix - Smart Blood Donation & Management System

BloodMatrix is a full-stack MERN application designed to bridge the gap between blood donors, patients, and blood banks. It uses geolocation, real-time notifications, and a gamified experience to encourage blood donation and manage requests efficiently.

## 🚀 Key Features

- **Multi-Role Dashboards**: Specialized views for Patients, Donors, and Blood Banks.
- **Smart Matching**: Connects patients with nearby donors of the same blood group.
- **Home Lab Testing**: Patients can book blood tests from home, with results uploaded by blood banks.
- **Gamification**: Donors earn points and badges for donations and referrals.
- **Real-time Notifications**: Instant alerts for blood requests, test results, and status updates via Firebase Cloud Messaging (FCM).
- **Secure Authentication**: Role-based access control and secure JWT-based authentication.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (with 2dsphere indexing for geolocation).
- **Notifications**: Firebase Admin SDK & FCM.
- **State Management**: React Context API.

## 📦 Installation & Setup

### 1. Clone the repository
```bash
git clone https://github.com/your-username/BloodMatrix.git
cd BloodMatrix
```

### 2. Install Dependencies
Install all dependencies for root, frontend, and backend:
```bash
npm run install-all
```

### 3. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```

Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:5000/api
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_id
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Firebase Configuration
Place your `firebaseServiceAccountKey.json` in the `backend/` directory (ensure it is NOT committed to git).

### 5. Run the Application
Start both the frontend and backend concurrently:
```bash
npm run dev
```

## 📄 License
This project is licensed under the ISC License.
