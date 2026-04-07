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

// ── Public ─────────────────────────
router.post("/login", adminLogin);

// ── Approval routes ─────────────────
router.get("/pending-blood-banks", auth, requireRole("admin"), getPendingBloodBanks);
router.put("/approve-blood-bank/:id", auth, requireRole("admin"), approveBloodBank);

router.get("/pending-donors", auth, requireRole("admin"), getPendingDonors);
router.put("/approve-donor/:id", auth, requireRole("admin"), approveDonor);

// ── Stats ─────────────────────────
router.get("/stats", auth, requireRole("admin"), getAdminStats);

// ── Admin management ─────────────────
router.get("/donors", auth, requireRole("admin"), getAllDonors);
router.get("/bloodbanks", auth, requireRole("admin"), getAllBloodBanks);
router.get("/users/:id", auth, requireRole("admin"), getUserDetails);
router.delete("/users/:id", auth, requireRole("admin"), removeUser);

module.exports = router;