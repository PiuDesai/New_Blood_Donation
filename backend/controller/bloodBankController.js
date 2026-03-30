const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


// 🔴 Get Profile (Protected)
exports.getBloodBankProfile = async (req, res) => {
  try {
    const bloodBank = await User.findById(req.user.id).select("-password");
    res.json(bloodBank);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// 🔴 Add/Manage Blood Stock
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


// 🔴 View Blood Requests (Example: from all users)
// In a real app, this would query a Requests model
exports.getBloodRequests = async (req, res) => {
  try {
    // For now, returning empty or mock until Request model is found
    res.json({ message: "Feature coming soon", requests: [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};