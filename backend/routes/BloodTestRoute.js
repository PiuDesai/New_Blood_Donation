const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const { requireRole } = require('../middleware/roleMiddleware.js');
const {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getTestTypes,
  updateBookingStatus
} = require('../controller/BloodTestController.js');

const patientOnly = requireRole('patient');
const adminOnly = requireRole('admin');

// Patient-only: booking flow (donors cannot book / list / cancel)
router.get('/tests/types', auth, patientOnly, getTestTypes);
router.post('/tests/book', auth, patientOnly, createBooking);
router.get('/tests/my-bookings', auth, patientOnly, getMyBookings);
router.get('/tests/:id', auth, patientOnly, getBooking);
router.put('/tests/:id/cancel', auth, patientOnly, cancelBooking);

router.put('/tests/:id/status', auth, adminOnly, updateBookingStatus);

module.exports = router;
