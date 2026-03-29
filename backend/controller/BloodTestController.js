const BloodTestBooking = require('../models/BloodTestBookingModel.js');
const Notification = require('../models/NotificationModel.js');
const User = require('../models/UserModel.js');

// ── Test price map ──────────────────────────────────────────────
const TEST_PRICES = {
  'Complete Blood Count (CBC)': 299,
  'Liver Function Test (LFT)': 599,
  'Kidney Function Test (KFT)': 599,
  'Blood Sugar (Fasting)': 149,
  'Blood Sugar (Random)': 149,
  'HbA1c': 399,
  'Lipid Profile': 499,
  'Thyroid Function Test (TFT)': 699,
  'HIV Test': 499,
  'Hepatitis B': 399,
  'Hepatitis C': 399,
  'Blood Group & Rh Typing': 199,
  'Malaria Test': 299,
  'Dengue Test': 499,
  'Widal Test': 249,
  'Vitamin D': 799,
  'Vitamin B12': 599,
  'Iron Studies': 449,
  'ESR': 149,
  'CRP (C-Reactive Protein)': 349
};

// ── Create Booking ──────────────────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const {
      testType, preferredDate, preferredTimeSlot,
      collectionType, address, patientName, patientAge, contactPhone, notes
    } = req.body;

    if (!testType || !preferredDate || !patientName || !patientAge || !contactPhone) {
      return res.status(400).json({ message: 'All required fields must be provided' });
    }

    const bookingDate = new Date(preferredDate);
    if (bookingDate < new Date()) {
      return res.status(400).json({ message: 'Preferred date must be in the future' });
    }

    const booking = await BloodTestBooking.create({
      user: req.user.id,
      testType,
      preferredDate: bookingDate,
      preferredTimeSlot: preferredTimeSlot || '8:00 AM - 10:00 AM',
      collectionType: collectionType || 'home_collection',
      address,
      patientName,
      patientAge,
      contactPhone,
      notes: notes || '',
      price: TEST_PRICES[testType] || 299
    });

    // Send confirmation notification
    await Notification.create({
      recipient: req.user.id,
      type: 'booking_confirmed',
      title: '🧪 Blood Test Booking Confirmed',
      message: `Your ${testType} has been booked for ${bookingDate.toDateString()} (${preferredTimeSlot || '8:00 AM - 10:00 AM'}). Our technician will contact you shortly.`,
      data: { bookingId: booking._id, testType },
      isEmergency: false
    });

    res.status(201).json({
      message: 'Blood test booked successfully',
      booking
    });

  } catch (err) {
    next(err);
  }
};

// ── Get My Bookings ─────────────────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;

    const filter = { user: req.user.id };
    if (status) filter.status = status;

    const bookings = await BloodTestBooking.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await BloodTestBooking.countDocuments(filter);

    res.json({
      bookings,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    });

  } catch (err) {
    next(err);
  }
};

// ── Get Single Booking ──────────────────────────────────────────
const getBooking = async (req, res, next) => {
  try {
    const booking = await BloodTestBooking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    res.json({ booking });

  } catch (err) {
    next(err);
  }
};

// ── Cancel Booking ──────────────────────────────────────────────
const cancelBooking = async (req, res, next) => {
  try {
    const booking = await BloodTestBooking.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (['sample_collected', 'processing', 'report_ready'].includes(booking.status)) {
      return res.status(400).json({ message: 'Cannot cancel at this stage' });
    }

    booking.status = 'cancelled';
    await booking.save();

    await Notification.create({
      recipient: req.user.id,
      type: 'booking_cancelled',
      title: 'Booking Cancelled',
      message: `Your ${booking.testType} booking has been cancelled.`,
      data: { bookingId: booking._id },
      isEmergency: false
    });

    res.json({ message: 'Booking cancelled', booking });

  } catch (err) {
    next(err);
  }
};

// ── Get Available Test Types ────────────────────────────────────
const getTestTypes = async (req, res, next) => {
  try {
    const tests = Object.entries(TEST_PRICES).map(([name, price]) => ({ name, price }));
    res.json({ tests });
  } catch (err) {
    next(err);
  }
};

// ── Admin: Update Booking Status ────────────────────────────────
const updateBookingStatus = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    const { status, assignedTechnician, reportUrl } = req.body;

    const booking = await BloodTestBooking.findByIdAndUpdate(
      req.params.id,
      { $set: { status, assignedTechnician, reportUrl } },
      { new: true }
    ).populate('user', 'name email');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (status === 'report_ready') {
      await Notification.create({
        recipient: booking.user._id,
        type: 'report_ready',
        title: '📋 Report Ready!',
        message: `Your ${booking.testType} report is ready. Please check your bookings.`,
        data: { bookingId: booking._id, reportUrl },
        isEmergency: false
      });
    }

    res.json({ message: 'Booking status updated', booking });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getBooking,
  cancelBooking,
  getTestTypes,
  updateBookingStatus
};
