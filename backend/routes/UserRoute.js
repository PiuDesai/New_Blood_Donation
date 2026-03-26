const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware.js');
<<<<<<< HEAD
const { requireRole } = require('../middleware/roleMiddleware.js');
const {
  registerUser,
  registerBloodBank,
=======
const {
  register,
>>>>>>> 87a3729 (User model done)
  login,
  getProfile,
  updateProfile,
  changePassword,
  checkEligibility,
  recordDonation,
<<<<<<< HEAD
  logout,
  getAllBloodBanks,
  saveToken
} = require('../controller/UserController.js');

// ── Public routes (no token required) ────────────────────────
router.post('/user/register', registerUser);
router.post('/bloodbank/register', registerBloodBank);
=======
  logout
} = require('../controller/UserController.js');

// ── Public routes (no token required) ────────────────────────
router.post('/register', register);
>>>>>>> 87a3729 (User model done)

router.post('/login', login);

// ── Protected routes (JWT required) ──────────────────────────
// ✅ Apply auth directly in each route

router.get('/me', auth, getProfile);
router.put('/me', auth, updateProfile);

router.put('/change-password', auth, changePassword);

<<<<<<< HEAD
router.get('/eligibility', auth, requireRole('donor'), checkEligibility);

router.post('/record-donation', auth, requireRole('donor'), recordDonation);

router.get('/blood-banks', auth, getAllBloodBanks);

router.post('/logout', auth, logout);

router.post("/save-token", saveToken);

=======
router.get('/eligibility', auth, checkEligibility);

router.post('/record-donation', auth, recordDonation);

router.post('/logout', auth, logout);

>>>>>>> 87a3729 (User model done)
module.exports = router;