const User = require('../models/UserModel.js');
const Notification = require('../models/NotificationModel.js');
const BloodTestBooking = require('../models/BloodTestBookingModel.js');

const formatDateShort = (d) => {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
};

const getPatientStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ message: 'Patient role required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const donorsFound = await User.countDocuments({
      role: 'donor',
      isActive: true,
      bloodGroup: user.bloodGroup
    });

    const nearbyCenters = await User.countDocuments({ role: 'bloodbank', isActive: true });

    const activeRequests = await Notification.countDocuments({
      recipient: req.user.id,
      type: { $in: ['emergency_blood_request', 'blood_request'] },
      isRead: false
    });

    res.json({
      activeRequests,
      donorsFound,
      nearbyCenters,
      requests: []
    });
  } catch (err) {
    next(err);
  }
};

const getDonorStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'donor') {
      return res.status(403).json({ message: 'Donor role required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const totalDonations = user.donorInfo?.donationCount ?? 0;
    const livesSaved = totalDonations;

    let nextEligible = 'Eligible now';
    if (user.donorInfo?.nextEligibleAt) {
      nextEligible = formatDateShort(user.donorInfo.nextEligibleAt);
    } else if (user.donorInfo?.lastDonatedAt && user.donorInfo?.nextEligibleAt === undefined) {
      nextEligible = formatDateShort(user.donorInfo.lastDonatedAt);
    }

    const history =
      user.donorInfo?.lastDonatedAt
        ? [
            {
              id: user._id,
              location: user.location?.city ? `${user.location.city}` : 'Registered location',
              date: formatDateShort(user.donorInfo.lastDonatedAt),
              units: '1 Unit',
              type: 'Whole Blood',
              status: 'Verified'
            }
          ]
        : [];

    res.json({
      totalDonations,
      livesSaved,
      nextEligible,
      history
    });
  } catch (err) {
    next(err);
  }
};

const getBloodBankStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'bloodbank') {
      return res.status(403).json({ message: 'Blood bank role required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const activeRequests = await Notification.countDocuments({
      type: { $in: ['emergency_blood_request', 'blood_request'] },
      isEmergency: true,
      isRead: false
    });

    const lowStockAlerts = (user.bloodStock || []).filter(s => s.units < 10).length;
    const totalUnits = (user.bloodStock || []).reduce((sum, s) => sum + s.units, 0);

    res.json({
      totalUnits,
      todayDonations: 0,
      activeRequests,
      lowStockAlerts,
      bloodStock: user.bloodStock || []
    });
  } catch (err) {
    next(err);
  }
};

const getAdminStats = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin role required' });
    }

    const [totalDonors, totalPatients, pendingBookings] = await Promise.all([
      User.countDocuments({ role: 'donor' }),
      User.countDocuments({ role: 'patient' }),
      BloodTestBooking.countDocuments({ status: 'pending' })
    ]);

    const bloodRequests = await Notification.countDocuments({
      type: { $in: ['emergency_blood_request', 'blood_request'] }
    });

    res.json({
      totalDonors,
      totalPatients,
      bloodRequests: bloodRequests || pendingBookings,
      pendingApprovals: await User.countDocuments({ role: 'bloodbank', isApproved: false })
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPatientStats,
  getDonorStats,
  getBloodBankStats,
  getAdminStats
};
