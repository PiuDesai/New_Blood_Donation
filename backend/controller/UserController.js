const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/UserModel.js');
const { sendEmail } = require('../utils/emailService');

// ── Helper: sign JWT ──────────────────────────────────────────
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });


// ───────────────── FORGOT PASSWORD ─────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Please provide email' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins

    await user.save({ validateBeforeSave: false });

    // Send reset email
    const resetURL = `${process.env.FRONT_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;
    const message = `Forgot your password? Reset it here: ${resetURL}\nIf you didn't forget your password, please ignore this email.`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password Reset Token (Valid for 10 mins)',
        text: message
      });

      res.json({ message: 'Token sent to email!' });
    } catch (err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ message: 'Error sending email. Try again later.' });
    }
  } catch (err) {
    next(err);
  }
};

// ───────────────── RESET PASSWORD ─────────────────
const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: 'Token is invalid or has expired' });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    const token = signToken(user._id, user.role);
    res.json({ message: 'Password reset successful', token, user: user.toJSON() });
  } catch (err) {
    next(err);
  }
};


// ───────────────── REGISTER USER (Donor/Patient) ─────────────────
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
      return res.status(400).json({ message: 'location with type Point and coordinates [lng, lat] is required' });
    }

    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing)
      return res.status(400).json({ message: 'Email or phone already registered' });

    const user = await User.create({
      name, email, phone, password,
      role: role || 'donor',
      bloodGroup, dateOfBirth, gender, location
    });

    const token = signToken(user._id, user.role);

    // welcome email (non-blocking; log result for debugging)
    sendEmail({
      to: user.email,
      subject: 'Welcome to BloodMatrix',
      text: `Hi ${user.name},\n\nYour account has been created successfully.\n\nThanks,\nBloodMatrix Team`,
    })
      .then((r) => {
        if (process.env.NODE_ENV !== 'production') console.log('[email] welcome result:', r);
      })
      .catch((e) => console.error('[email] welcome error:', e.message));

    res.status(201).json({
      message: 'Registered successfully',
      token,
      user
    });

  } catch (err) {
    next(err);
  }
};


// ───────────────── REGISTER BLOOD BANK ─────────────────
const registerBloodBank = async (req, res, next) => {
  try {
    const {
      name, email, phone, password, location, licenseInfo
    } = req.body;

    if (!name || !email || !phone || !password || !location || !licenseInfo) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    if (!location || !Array.isArray(location.coordinates) || location.coordinates.length !== 2) {
      return res.status(400).json({ message: 'location with type Point and coordinates [lng, lat] is required' });
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

    const token = signToken(user._id, user.role);

    sendEmail({
      to: user.email,
      subject: 'Blood bank registration received',
      text: `Hi ${user.name},\n\nYour blood bank account has been created successfully.\n\nThanks,\nBloodMatrix Team`,
    })
      .then((r) => {
        if (process.env.NODE_ENV !== 'production') console.log('[email] bloodbank welcome result:', r);
      })
      .catch((e) => console.error('[email] bloodbank welcome error:', e.message));

    res.status(201).json({
      message: 'Blood bank registered successfully',
      token,
      user
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
      return res.status(403).json({
        message: `Account locked. Try later`
      });

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
    next(err); // ✅ FIX
  }
};


// ───────────────── GET PROFILE ─────────────────
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.json({ user: user.toJSON() });

  } catch (err) {
    next(err); // ✅ FIX
  }
};


// ───────────────── UPDATE PROFILE ─────────────────
const updateProfile = async (req, res, next) => {
  try {
    const allowed = [
      'name', 'gender', 'dateOfBirth', 'location',
      'bloodGroup', 'fcmToken', 'notificationPreferences',
      'donorInfo.weight', 'donorInfo.isDonorAvailable',
      'donorInfo.medicalConditions', 'profilePhoto'
    ];

    const updates = {};
    allowed.forEach(field => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user: user.toJSON() });

  } catch (err) {
    next(err); // ✅ FIX
  }
};


// ───────────────── CHANGE PASSWORD ─────────────────
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'All fields required' });

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch)
      return res.status(400).json({ message: 'Wrong password' });

    user.password = newPassword;
    await user.save();

    res.json({ message: 'Password changed' });

  } catch (err) {
    next(err); // ✅ FIX
  }
};


// ───────────────── CHECK ELIGIBILITY ─────────────────
const checkEligibility = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    res.json({
      canDonate: user.canDonate,
      age: user.age
    });

  } catch (err) {
    next(err); // ✅ FIX
  }
};


const { addPointsForDonation } = require('./GamificationController.js');

// ───────────────── RECORD DONATION ─────────────────
const recordDonation = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user)
      return res.status(404).json({ message: 'User not found' });

    // Awards points and updates donation count + badges
    await addPointsForDonation(user._id, 50);

    const updatedUser = await User.findById(user._id);

    res.json({ 
      message: 'Donation recorded and points awarded!', 
      points: updatedUser.points,
      donationCount: updatedUser.donorInfo.donationCount 
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


// ───────────────── VIEW BLOOD BANKS (For Users) ─────────────
const getAllBloodBanks = async (req, res, next) => {
  try {
    const bloodBanks = await User.find({ role: 'bloodbank', isActive: true })
      .select('name location bloodStock email phone licenseInfo');

    res.json(bloodBanks);

  } catch (err) {
    next(err);
  }
};

const saveToken = async (req, res) => {
  try {
    const { userId, token } = req.body;

    const user = await User.findByIdAndUpdate(userId, {
      fcmToken: token
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Token saved" });

  } catch (err) {
    console.error(err);
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
  forgotPassword,
  resetPassword,
  checkEligibility,
  recordDonation,
  logout,
  getAllBloodBanks,
  saveToken
};