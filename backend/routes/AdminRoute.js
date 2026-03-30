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

module.exports = router;