const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware.js');
const { requireRole } = require('../middleware/roleMiddleware.js');

const {
  createBooking,
  getMyBookings,
  getAllBookings,
  acceptBooking,
  rejectBooking,
  uploadReport,
  getTestTypes,
  getBookingById,
  cancelBooking
} = require('../controller/BloodTestController.js');

const patientOnly = requireRole('patient');
const bloodBankOnly = requireRole('bloodbank');
const adminOnly = requireRole('admin');

// ── Patient Routes ───────────────────────────────
router.get('/tests/types', auth, getTestTypes);
router.post('/tests/book', auth, patientOnly, createBooking);
router.get('/tests/my-bookings', auth, patientOnly, getMyBookings);

// ✅ MOVE THIS DOWN
// router.get('/tests/:id', auth, getBookingById);

router.put('/tests/:id/cancel', auth, patientOnly, cancelBooking);

// ── Blood Bank Routes ───────────────────────────
router.get('/tests/all', auth, bloodBankOnly, getAllBookings);
router.post('/tests/accept', auth, bloodBankOnly, acceptBooking);
router.post('/tests/reject', auth, bloodBankOnly, rejectBooking);
router.post('/tests/upload-report', auth, bloodBankOnly, uploadReport);

// ✅ KEEP DYNAMIC ROUTE LAST
router.get('/tests/:id', auth, getBookingById);

module.exports = router;