const express = require('express');
const router = express.Router();

const auth = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const {
  createRequest,
  getMyRequests,
  getAllRequests,
  getUrgentRequests,
  acceptRequest,
  updateRequest,
  deleteRequest,
  rejectRequest,
  issueBlood,
  verifyCompletion,
  completeDonation
} = require('../controller/BloodRequestController');

// ── General Routes ───────────────────────────
router.get('/all', auth, requireRole('admin', 'bloodbank', 'donor'), getAllRequests);
router.get('/urgent', auth, requireRole('donor', 'bloodbank'), getUrgentRequests);

// ── Patient Specific Routes ──────────────────
router.post('/create', auth, requireRole('patient', 'donor'), createRequest);
router.get('/my-requests', auth, requireRole('patient', 'donor'), getMyRequests);
router.put('/:id', auth, requireRole('patient', 'donor'), updateRequest);
router.delete('/:id', auth, requireRole('patient', 'donor'), deleteRequest);

// ── Lifecycle Actions ────────────────────────
router.post('/accept', auth, requireRole('donor', 'bloodbank'), acceptRequest);
router.post('/reject', auth, requireRole('bloodbank'), rejectRequest);
router.post('/issue', auth, requireRole('bloodbank'), issueBlood);
router.post('/verify-completion', auth, verifyCompletion);

// ── Legacy / Compatibility Routes ────────────
router.post('/mark-donor-complete', auth, requireRole('donor'), (req, res, next) => {
  req.body.role = 'donor';
  verifyCompletion(req, res, next);
});
router.post('/confirm-patient', auth, requireRole('patient'), (req, res, next) => {
  req.body.role = 'patient';
  verifyCompletion(req, res, next);
});
router.post('/complete', auth, completeDonation);

module.exports = router;
