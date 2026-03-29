const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const {
  getPatientStats,
  getDonorStats,
  getBloodBankStats,
  getAdminStats
} = require('../controller/StatsController.js');

router.get('/patient/stats', auth, getPatientStats);
router.get('/donor/stats', auth, getDonorStats);
router.get('/bloodbank/stats', auth, getBloodBankStats);
router.get('/admin/stats', auth, getAdminStats);

module.exports = router;
