const BloodTestBooking = require('../models/BloodTestBookingModel.js');
const User = require('../models/UserModel.js');
const sendNotification = require('../utils/sendNotification.js');

// ── Create Booking (Patient) ───────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { patientName, address, phone, testType } = req.body;

    if (!patientName || !address || !phone || !testType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Generate Google Maps link
    const mapLink = `https://www.google.com/maps?q=${encodeURIComponent(address)}`;

    const booking = await BloodTestBooking.create({
      patient: req.user.id,
      patientName,
      address,
      mapLink,
      phone,
      testType,
      status: 'Pending'
    });

    // 🎯 Notify all blood banks
    const bloodBanks = await User.find({ role: 'bloodbank', isActive: true }).select('_id fcmToken');
    const tokens = bloodBanks.map(b => b.fcmToken).filter(Boolean);
    const ids = bloodBanks.map(b => b._id);

    if (tokens.length > 0) {
      await sendNotification(tokens, ids, {
        title: '🏠 New Home Blood Test Request',
        body: `${patientName} requested a ${testType} at ${address}`,
        type: 'general',
        data: { bookingId: booking._id.toString() }
      });
    }

    res.status(201).json({ message: 'Blood test booked successfully', booking });
  } catch (err) {
    next(err);
  }
};

// ── Get My Bookings (Patient) ──────────────────────────────────
const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await BloodTestBooking.find({ patient: req.user.id })
      .populate('bloodBank', 'name phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// ── Get All Bookings (Blood Bank) ─────────────────────────────
const getAllBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const bookings = await BloodTestBooking.find(filter)
      .populate('patient', 'name phone email')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

// ── Accept Booking (Blood Bank) ──────────────────────────────
const acceptBooking = async (req, res, next) => {
  try {
    const { bookingId, assignedPerson, assignedContact } = req.body;

    if (!bookingId || !assignedPerson || !assignedContact) {
      return res.status(400).json({ message: 'Technician details are required' });
    }

    const booking = await BloodTestBooking.findById(bookingId).populate('patient');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.bloodBank = req.user.id;
    booking.assignedPerson = assignedPerson;
    booking.assignedContact = assignedContact;
    booking.status = 'Accepted';
    await booking.save();

    // 🎯 Notify Patient
    if (booking.patient.fcmToken) {
      await sendNotification([booking.patient.fcmToken], [booking.patient._id], {
        title: '✅ Home Test Accepted',
        body: `Your ${booking.testType} request was accepted. Technician: ${assignedPerson} (${assignedContact})`,
        type: 'general',
        data: { bookingId: booking._id.toString() }
      });
    }

    res.json({ message: 'Booking accepted', booking });
  } catch (err) {
    next(err);
  }
};

// ── Reject Booking (Blood Bank) ──────────────────────────────
const rejectBooking = async (req, res, next) => {
  try {
    const { bookingId } = req.body;

    const booking = await BloodTestBooking.findById(bookingId).populate('patient');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.status = 'Rejected';
    await booking.save();

    // 🎯 Notify Patient
    if (booking.patient.fcmToken) {
      await sendNotification([booking.patient.fcmToken], [booking.patient._id], {
        title: '❌ Home Test Rejected',
        body: `Your ${booking.testType} request was rejected by the blood bank.`,
        type: 'general',
        data: { bookingId: booking._id.toString() }
      });
    }

    res.json({ message: 'Booking rejected', booking });
  } catch (err) {
    next(err);
  }
};

// ── Upload Report (Blood Bank) ───────────────────────────────
const uploadReport = async (req, res, next) => {
  try {
    const { bookingId, reportUrl } = req.body;

    if (!bookingId || !reportUrl) {
      return res.status(400).json({ message: 'Report URL is required' });
    }

    const booking = await BloodTestBooking.findById(bookingId).populate('patient');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.reportUrl = reportUrl;
    booking.status = 'Completed';
    await booking.save();

    // 🎯 Notify Patient
    if (booking.patient.fcmToken) {
      await sendNotification([booking.patient.fcmToken], [booking.patient._id], {
        title: '📄 Test Report Uploaded',
        body: `Your report for ${booking.testType} is now available.`,
        type: 'general',
        data: { bookingId: booking._id.toString() }
      });
    }

    res.json({ message: 'Report uploaded', booking });
  } catch (err) {
    next(err);
  }
};

const getTestTypes = async (req, res) => {
  // Simple test types
  const tests = [
    'Complete Blood Count (CBC)',
    'Liver Function Test (LFT)',
    'Kidney Function Test (KFT)',
    'Blood Sugar (Fasting)',
    'Thyroid Function Test (TFT)',
    'HIV Test',
    'Vitamin D'
  ];
  res.json({ tests });
};

const getBookingById = async (req, res, next) => {
  try {
    const booking = await BloodTestBooking.findById(req.params.id)
      .populate('patient', 'name phone email')
      .populate('bloodBank', 'name phone email location');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

const cancelBooking = async (req, res, next) => {
  try {
    const booking = await BloodTestBooking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    
    // Only patient or admin can cancel
    if (booking.patient.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    booking.status = 'Rejected'; // Or a new status 'Cancelled'
    await booking.save();
    res.json({ message: 'Booking cancelled successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  acceptBooking,
  rejectBooking,
  uploadReport,
  getTestTypes,
  getBookingById,
  cancelBooking
};
