const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware.js");
const { requireRole } = require("../middleware/roleMiddleware.js");
const { 
  adminLogin, 
  getAllDonors,
  getAllBloodBanks,
  getUserDetails,
  removeUser,
  getPendingBloodBanks, 
  approveBloodBank, 
  getPendingDonors,
  approveDonor,
  getAdminStats
} = require("../controller/AdminController");

router.post("/login", adminLogin);
router.get("/pending-blood-banks", auth, requireRole("admin"), getPendingBloodBanks);
router.post("/approve-blood-bank/:id", auth, requireRole("admin"), approveBloodBank);

router.get("/pending-donors", auth, requireRole("admin"), getPendingDonors);
router.put("/approve-donor/:id", auth, requireRole("admin"), approveDonor);
router.get("/stats", auth, requireRole("admin"), getAdminStats);

// ✅ bloodbank
router.get("/pending-bloodbanks", auth, requireRole("admin"), getPendingBloodBanks);
router.put("/approve-bloodbank/:id", auth, requireRole("admin"), approveBloodBank);

// ── Admin management ─────────────────────────
router.get("/donors", auth, requireRole("admin"), getAllDonors);
router.get("/bloodbanks", auth, requireRole("admin"), getAllBloodBanks);
router.get("/users/:id", auth, requireRole("admin"), getUserDetails);
router.delete("/users/:id", auth, requireRole("admin"), removeUser);

const { adminLogin } = require("../controller/AdminController");

router.post("/login", adminLogin);


module.exports = router;