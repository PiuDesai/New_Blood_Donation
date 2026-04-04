const jwt = require('jsonwebtoken');
const User = require('../models/UserModel.js');
const { addPointsForDonation } = require('./GamificationController.js');

// ── Helper: sign JWT ──────────────────────────
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '7d' });


// ───────────────── REGISTER USER ─────────────────
const registerUser = async (req, res, next) => {
  try {
    const {
      name, email, phone, password, role,
      bloodGroup, dateOfBirth, gender, location
    } = req.body;

    if (!name || !email || !phone || !password || !bloodGroup || !dateOfBirth || !gender) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Valid location required [lng, lat]' });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: 'Email or phone already registered' });

    const user = await User.create({
      name, email, phone, password,
      role: role || 'donor',
      bloodGroup, dateOfBirth, gender, location
    });

    res.status(201).json({
      message: 'Registered successfully',
      userId: user._id
    });

  } catch (err) {
    next(err);
  }
};


// ───────────────── REGISTER BLOOD BANK ─────────────────
const registerBloodBank = async (req, res, next) => {
  try {
    const { name, email, phone, password, location, licenseInfo } = req.body;

    if (!name || !email || !phone || !password || !location || !licenseInfo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'Valid location required [lng, lat]' });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: 'Email or phone already registered' });

    const user = await User.create({
      name, email, phone, password,
      role: 'bloodbank',
      location,
      licenseInfo
    });

    res.status(201).json({
      message: 'Blood bank registered successfully',
      userId: user._id
    });

  } catch (err) {
    next(err);
  }
};


// ───────────────── LOGIN ─────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email })
      .select('+password +loginAttempts +lockUntil');

    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    if (user.isLocked())
      return res.status(403).json({ message: 'Account locked. Try later' });

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      const attempts = (user.loginAttempts || 0) + 1;
      const update = { loginAttempts: attempts };

      if (attempts >= 5) {
        update.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
        update.loginAttempts = 0;
      }

      await User.findByIdAndUpdate(user._id, update);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (!user.isActive)
      return res.status(403).json({ message: 'Account deactivated' });

    await User.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      lockUntil: null,
      lastLoginAt: new Date()
    });

    const token = signToken(user._id, user.role);

    res.json({
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (err) {
    next(err);
  }
};


// ───────────────── GET PROFILE ─────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user: user.toJSON() });

  } catch (err) {
    next(err);
  }
};


// ───────────────── UPDATE PROFILE ─────────────────
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user: user.toJSON() });

  } catch (err) {
    next(err);
  }
};


// ───────────────── CHANGE PASSWORD ─────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) return res.status(400).json({ message: 'Wrong password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed' });

  } catch (err) {
    next(err);
  }
};


// ───────────────── CHECK ELIGIBILITY ─────────────────
const checkEligibility = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.json({
      canDonate: user.canDonate,
      age: user.age
    });

  } catch (err) {
    next(err);
  }
};


// ───────────────── RECORD DONATION ─────────────────
const recordDonation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    if (!user.canDonate)
      return res.status(400).json({ message: 'Not eligible' });

    await addPointsForDonation(user._id, 50);

    const updatedUser = await User.findById(user._id);

    res.json({
      message: 'Donation recorded and points awarded!',
      points: updatedUser.points,
      donationCount: updatedUser.donorInfo?.donationCount || 0
    });

  } catch (err) {
    next(err);
  }
};


// ───────────────── LOGOUT ─────────────────
const logout = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { fcmToken: '' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};


// ───────────────── BLOOD BANK LIST ─────────────────
const getAllBloodBanks = async (req, res, next) => {
  try {
    const bloodBanks = await User.find({ role: 'bloodbank', isActive: true })
      .select('name location bloodStock email phone licenseInfo');

    res.json(bloodBanks);

  } catch (err) {
    next(err);
  }
};


// ───────────────── SAVE TOKEN ─────────────────
const saveToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findByIdAndUpdate(userId, { fcmToken: token });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ message: "Token saved" });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


module.exports = {
  registerUser,
  registerBloodBank,
  login,
  getProfile,
  updateProfile,
  changePassword,
  checkEligibility,
  recordDonation,
  logout,
  getAllBloodBanks,
  saveToken
};