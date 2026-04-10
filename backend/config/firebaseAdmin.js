const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  // Production: Use the environment variable (must be a JSON string)
  try {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  } catch (err) {
    console.error("Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable:", err.message);
  }
} else {
  // Development: Use the local file
  try {
    serviceAccount = require("../firebaseServiceAccountKey.json");
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("firebaseServiceAccountKey.json not found, skipping Firebase Admin initialization.");
    }
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

module.exports = admin;