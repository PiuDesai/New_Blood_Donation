const express = require("express");
const router = express.Router();

const {
  getBloodBankProfile,
  updateBloodStock,
  getBloodRequests
} = require("../controller/bloodBankController");

const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// 🔴 Profile (Protected Route)
router.get("/profile", auth, requireRole('bloodbank'), getBloodBankProfile);

// 🔴 Blood Stock
router.post("/stock", auth, requireRole('bloodbank'), updateBloodStock);

// 🔴 Blood Requests
router.get("/requests", auth, requireRole('bloodbank'), getBloodRequests);

module.exports = router;