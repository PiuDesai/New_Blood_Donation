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

// Test route
router.get("/test", (req, res) => {
    res.send("Camp route works!");
});

// Protected CRUD routes
router.post("/create", auth, requireRole('bloodbank'), createCamp);
router.get("/my-camps", auth, requireRole('bloodbank'), getCamps);
router.get("/all", auth, getAllCamps); // Available to all logged in users
router.put("/update/:id", auth, requireRole('bloodbank'), updateCamp);
router.delete("/delete/:id", auth, requireRole('bloodbank'), deleteCamp);
router.post("/register-donor", auth, registerDonor);
router.get("/total-units", auth, requireRole('bloodbank'), getTotalUnits);

module.exports = router;