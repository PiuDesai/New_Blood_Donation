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
  getTotalUnits,
  getCampBankDetail,
  getMyCampParticipations,
  markCampDonationPending,
  confirmCampDonation,
  declineCampDonation,
  completeCampEvent,
  getCampCertificate,
} = require("../controller/campController");

router.get("/test", (req, res) => {
  res.send("Camp route works!");
});

router.get("/my-camps", auth, requireRole("bloodbank"), getCamps);
router.get("/all", auth, getAllCamps);
router.get("/total-units", auth, requireRole("bloodbank"), getTotalUnits);

router.get(
  "/bank/detail/:campId",
  auth,
  requireRole("bloodbank"),
  getCampBankDetail
);

router.get(
  "/my-registrations",
  auth,
  requireRole("donor"),
  getMyCampParticipations
);

router.get(
  "/certificate/:campId",
  auth,
  requireRole("donor"),
  getCampCertificate
);

router.post("/create", auth, requireRole("bloodbank"), createCamp);

router.put("/update/:id", auth, requireRole("bloodbank"), updateCamp);

router.put("/complete-event/:id", auth, requireRole("bloodbank"), completeCampEvent);

router.delete("/delete/:id", auth, requireRole("bloodbank"), deleteCamp);

router.post("/register-donor", auth, requireRole("donor"), registerDonor);

router.post(
  "/bank/mark-donated",
  auth,
  requireRole("bloodbank"),
  markCampDonationPending
);

router.post(
  "/donor/confirm-donation",
  auth,
  requireRole("donor"),
  confirmCampDonation
);

router.post(
  "/donor/decline-donation",
  auth,
  requireRole("donor"),
  declineCampDonation
);

module.exports = router;
