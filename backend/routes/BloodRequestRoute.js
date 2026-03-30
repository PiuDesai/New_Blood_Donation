const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  issueBlood
} = require('../controller/BloodRequestController');

// ── User Specific Routes ─────────────────────
router.post('/create', auth, requireRole('patient', 'donor'), createRequest);
router.get('/my-requests', auth, requireRole('patient', 'donor'), getMyRequests);

// ── Blood Bank Specific Routes ────────────────
router.get('/all', auth, requireRole('bloodbank'), getAllRequests);
router.post('/issue', auth, requireRole('bloodbank'), issueBlood);

module.exports = router;
