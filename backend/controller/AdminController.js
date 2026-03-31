const jwt = require('jsonwebtoken');
const User = require('../models/UserModel');

exports.adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign(

      { id: 'admin-id', role: 'admin' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
      { role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({
      success: true,
      message: "Login successful",
      user: { role: 'admin', name: 'System Admin', _id: 'admin-id' },
      token,
      user: { role: "admin", email }
    });
  }

  return res.status(401).json({
    success: false,

    message: "Invalid email or password",
  });
};

exports.getPendingBloodBanks = async (req, res, next) => {
  try {
    const bloodBanks = await User.find({ role: 'bloodbank', isApproved: false });
    res.json(bloodBanks);
  } catch (err) {
    next(err);
  }
};

exports.approveBloodBank = async (req, res, next) => {
  try {
    const { id } = req.params;
    const bloodBank = await User.findByIdAndUpdate(
      id,
      { isApproved: true, approvedAt: new Date() },
      { new: true }
    );

    if (!bloodBank) return res.status(404).json({ message: 'Blood bank not found' });

    res.json({ message: 'Blood bank approved successfully', bloodBank });
  } catch (err) {
    next(err);

    message: "Invalid credentials"
  });
};

exports.getPendingDonors = async (req, res) => {
  try {
    const donors = await User.find({
      role: "donor",          // only donors
      isApproved: false       // pending
    }).select("-password");

    res.json({
      success: true,
      donors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ APPROVE DONOR
exports.approveDonor = async (req, res) => {
  try {
    const { id } = req.params;

    const donor = await User.findByIdAndUpdate(
      id,
      { isApproved: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Donor approved successfully",
      donor
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ GET PENDING BLOOD BANKS
exports.getPendingBloodBanks = async (req, res) => {
  try {
    const bloodbanks = await User.find({
      role: "bloodbank",
      isApproved: false
    }).select("-password");

    res.json({
      success: true,
      bloodbanks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ APPROVE BLOOD BANK
exports.approveBloodBank = async (req, res) => {
  try {
    const bloodbank = await User.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );

    res.json({
      success: true,
      message: "Blood bank approved",
      bloodbank
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// ✅ ADMIN STATS
exports.getAdminStats = async (req, res) => {
  try {
    const totalDonors = await User.countDocuments({ role: "donor" });

    const pendingDonors = await User.countDocuments({
      role: "donor",
      isApproved: false
    });

    const totalBanks = await User.countDocuments({
      role: "bloodbank"
    });

    const pendingBanks = await User.countDocuments({
      role: "bloodbank",
      isApproved: false
    });

    res.json({
      totalDonors,
      pendingDonors,
      totalBanks,
      pendingBanks
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });

  }
};