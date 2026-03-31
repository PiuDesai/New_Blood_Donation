const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const {
  createCamp,
  getCamps,
  getAllCamps,
  updateCamp,
  deleteCamp,
  registerDonor,
  getTotalUnits
} = require("../controller/campController");

// ✅ TEST
router.get("/test", (req, res) => {
  res.send("Camp route works!");
});

// ✅ IMPORTANT: KEEP STATIC ROUTES ABOVE PARAM ROUTES
router.get("/my-camps", auth, requireRole("bloodbank"), getCamps);
router.get("/all", auth, getAllCamps);
router.get("/total-units", auth, requireRole("bloodbank"), getTotalUnits);

// ✅ CREATE
router.post("/create", auth, requireRole("bloodbank"), createCamp);

// ✅ UPDATE
router.put("/update/:id", auth, requireRole("bloodbank"), (req, res, next) => {
  console.log("🔥 UPDATE ROUTE HIT");
  next();
}, updateCamp);

// ✅ DELETE
router.delete("/delete/:id", auth, requireRole("bloodbank"), (req, res, next) => {
  console.log("🔥 DELETE ROUTE HIT");
  next();
}, deleteCamp);

// ✅ REGISTER DONOR
router.post("/register-donor", auth, registerDonor);

module.exports = router;