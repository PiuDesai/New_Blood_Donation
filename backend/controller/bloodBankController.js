const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}


//Get Profile (Protected)
exports.getBloodBankProfile = async (req, res) => {
  try {
    const bloodBank = await User.findById(req.user.id).select("-password");
    res.json(bloodBank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//Add/Manage Blood Stock
exports.updateBloodStock = async (req, res) => {
  try {
    const { bloodGroup, units } = req.body;

    const user = await User.findById(req.user.id);
    if (!user || user.role !== 'bloodbank') {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Check if group exists
    const stockIndex = user.bloodStock.findIndex(s => s.bloodGroup === bloodGroup);
    if (stockIndex > -1) {
      user.bloodStock[stockIndex].units = units;
    } else {
      user.bloodStock.push({ bloodGroup, units });
    }

    await user.save();
    res.json({ message: "Stock updated", bloodStock: user.bloodStock });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//View Blood Requests
// In a real app, this would query a Requests model
exports.getBloodRequests = async (req, res) => {
  try {
    // For now, returning empty or mock until Request model is found
    res.json({ message: "Feature coming soon", requests: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Donors in the same city (or pincode) as this blood bank
exports.getDonorsNearby = async (req, res) => {
  try {
    const bank = await User.findById(req.user.id).select("location");
    if (!bank) return res.status(404).json({ message: "User not found" });

    const city = bank.location?.city?.trim();
    const pincode = bank.location?.pincode?.trim();
    const bloodGroup = req.query.bloodGroup?.trim();

    if (!city && !pincode) {
      return res.status(400).json({
        message:
          "Add city or pincode to your blood bank profile location to list nearby donors.",
      });
    }

    const filter = {
      role: "donor",
      isActive: true,
      isApproved: true,
    };

    if (bloodGroup && BLOOD_GROUPS.includes(bloodGroup)) {
      filter.bloodGroup = bloodGroup;
    }

    if (city) {
      filter["location.city"] = new RegExp(`^${escapeRegex(city)}$`, "i");
    } else {
      filter["location.pincode"] = pincode;
    }

    const donors = await User.find(filter)
      .select("name phone email bloodGroup location gender donorInfo profilePhoto")
      .sort({ name: 1 })
      .limit(200);

    res.json({
      count: donors.length,
      matchedBy: city ? "city" : "pincode",
      city: city || null,
      pincode: pincode || null,
      donors,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};