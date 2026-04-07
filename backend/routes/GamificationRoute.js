const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const { requireRole } = require('../middleware/roleMiddleware.js');
const {
  getLeaderboard,
  getRewards,
  claimReward,
  getMyRewards,
  rateDonor
} = require('../controller/GamificationController.js');

const donorOnly = requireRole('donor');
const patientOnly = requireRole('patient');

// ── Public / All Authenticated Routes ──────────────────────────
router.get('/leaderboard', auth, getLeaderboard);
router.get('/rewards', auth, getRewards);

// ── Patient Only Routes ────────────────────────────────────────
router.post('/rate', auth, patientOnly, rateDonor);

// ── Donor Only Routes ──────────────────────────────────────────
router.post('/claim-reward', auth, donorOnly, claimReward);
router.get('/my-rewards', auth, donorOnly, getMyRewards);

module.exports = router;
