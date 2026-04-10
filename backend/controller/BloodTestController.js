const BloodTestBooking = require('../models/BloodTestBookingModel.js');
const User = require('../models/UserModel.js');
const sendNotification = require('../utils/sendNotification.js');
const { sendEmail } = require('../utils/emailService.js');

// ── Create Booking (Patient) ───────────────────────────────────
const createBooking = async (req, res, next) => {
  try {
    const { patientName, address, phone, testType } = req.body;

    if (!patientName || !address || !phone || !testType) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

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

    const bloodBanks = await User.find({ role: 'bloodbank', isActive: true }).select('_id fcmToken');
    const dbRecipientIds = bloodBanks.map((b) => b._id);
    const fcmTokens = bloodBanks.map((b) => b.fcmToken).filter((t) => typeof t === 'string' && t.length > 0);

    try {
      await sendNotification(fcmTokens, dbRecipientIds, {
        title: '🏠 New Home Blood Test Request',
        body: `${patientName} requested a ${testType} at ${address}`,
        type: 'booking_request',
        data: { bookingId: booking._id.toString() }
      });
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
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

    const patientId = booking.patient?._id || booking.patient;
    const patientToken = booking.patient?.fcmToken;
    try {
      await sendNotification(
        patientToken ? [patientToken] : [],
        patientId ? [patientId] : [],
        {
          title: '✅ Home Test Accepted',
          body: `Your ${booking.testType} request was accepted. Technician: ${assignedPerson} (${assignedContact})`,
          type: 'booking_confirmed',
          data: {
            bookingId: booking._id.toString(),
            assignedPerson,
            assignedContact
          }
        }
      );
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
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

    const patientId = booking.patient?._id || booking.patient;
    const patientToken = booking.patient?.fcmToken;
    try {
      await sendNotification(
        patientToken ? [patientToken] : [],
        patientId ? [patientId] : [],
        {
          title: '❌ Home Test Rejected',
          body: `Your ${booking.testType} request was rejected by the blood bank.`,
          type: 'booking_cancelled',
          data: { bookingId: booking._id.toString() }
        }
      );
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
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

    const booking = await BloodTestBooking.findById(bookingId).populate('patient', 'name email fcmToken notificationPreferences');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    booking.reportUrl = reportUrl;
    booking.status = 'Completed';
    await booking.save();

    const patientId = booking.patient?._id || booking.patient;
    const patientToken = booking.patient?.fcmToken;
    try {
      await sendNotification(
        patientToken ? [patientToken] : [],
        patientId ? [patientId] : [],
        {
          title: '📄 Report Ready',
          body: `Your ${booking.testType} report is available.`,
          type: 'report_ready',
          data: { bookingId: booking._id.toString(), reportUrl: String(reportUrl || '') }
        }
      );
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
    }

    // Email patient when report is ready (if enabled)
    try {
      const emailEnabled = booking.patient?.notificationPreferences?.emailEnabled !== false;
      if (emailEnabled && booking.patient?.email) {
        await sendEmail({
          to: booking.patient.email,
          subject: 'Your home blood test report is ready',
          text: `Hi ${booking.patient.name || 'there'},\n\nYour ${booking.testType} report is now available.\n\nReport link: ${reportUrl}\n\nBloodMatrix`,
        });
      }
    } catch (e) {
      console.error("[email] report upload:", e.message);
    }

    res.json({ message: 'Report uploaded', booking });
  } catch (err) {
    next(err);
  }
};

const getTestTypes = async (req, res) => {
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
    const booking = await BloodTestBooking.findById(req.params.id)
      .populate('patient', 'name phone fcmToken')
      .populate('bloodBank', 'name phone fcmToken');

    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const patientRef = booking.patient?._id || booking.patient;
    if (patientRef.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const hadBank = booking.bloodBank && booking.status === 'Accepted';
    booking.status = 'Rejected';
    await booking.save();

    if (hadBank && booking.bloodBank) {
      const bankId = booking.bloodBank._id || booking.bloodBank;
      const bankToken = booking.bloodBank.fcmToken;
      try {
        await sendNotification(
          bankToken ? [bankToken] : [],
          [bankId],
          {
            title: 'Home test cancelled',
            body: `${booking.patientName || 'A patient'} cancelled their ${booking.testType} booking.`,
            type: 'booking_cancelled',
            data: { bookingId: booking._id.toString() }
          }
        );
      } catch (notifErr) {
        console.error('Notification Error:', notifErr.message);
      }
    }

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