const express = require("express");
const router = express.Router();
const { 
  adminLogin, 
  getPendingBloodBanks, 
  approveBloodBank 
} = require("../controller/AdminController");

router.post("/login", adminLogin);
router.get("/pending-blood-banks", getPendingBloodBanks);
router.post("/approve-blood-bank/:id", approveBloodBank);

router.get("/pending-donors", getPendingDonors);
router.put("/approve-donor/:id", approveDonor);
router.get("/stats", getAdminStats);

// ✅ bloodbank
router.get("/pending-bloodbanks", getPendingBloodBanks);
router.put("/approve-bloodbank/:id", approveBloodBank);

module.exports = router;