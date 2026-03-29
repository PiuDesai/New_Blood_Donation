const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware.js');
const { requireRole } = require('../middleware/roleMiddleware.js');
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  checkEligibility,
  recordDonation,
  logout
} = require('../controller/UserController.js');

// ── Public routes (no token required) ────────────────────────
router.post('/register', register);

router.post('/login', login);

// ── Protected routes (JWT required) ──────────────────────────
// ✅ Apply auth directly in each route

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);

router.put('/change-password', auth, changePassword);

router.get('/eligibility', auth, requireRole('donor'), checkEligibility);

router.post('/record-donation', auth, requireRole('donor'), recordDonation);

router.post('/logout', auth, logout);

module.exports = router;