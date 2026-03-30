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
    );

    return res.json({
      success: true,
      message: "Login successful",
      user: { role: 'admin', name: 'System Admin', _id: 'admin-id' },
      token
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
  }
};