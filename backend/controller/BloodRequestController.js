const BloodRequest = require('../models/BloodRequestModel');
const User = require('../models/UserModel');
const sendNotification = require('../utils/sendNotification');

// ── CREATE BLOOD REQUEST ─────────────────
exports.createRequest = async (req, res, next) => {
  try {
    const {
      patientName, bloodGroup, units, hospital,
      location, urgency, remarks
    } = req.body;

    if (!patientName || !bloodGroup || !units || !hospital || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const request = await BloodRequest.create({
      requester: req.user.id,
      patientName,
      bloodGroup,
      units,
      hospital,
      location,
      urgency,
      remarks,
      status: 'Pending'
    });

    const donors = await User.find({
      bloodGroup,
      role: "donor",
      isActive: true
    }).select('_id fcmToken');

    const bloodBanks = await User.find({
      role: "bloodbank",
      isActive: true
    }).select('_id fcmToken');

    const tokens = [...donors, ...bloodBanks].map(u => u.fcmToken).filter(Boolean);
    const ids = [...donors, ...bloodBanks].map(u => u._id);

    if (tokens.length > 0) {
      await sendNotification(tokens, ids, {
        title: "🚨 New Blood Request",
        body: `${bloodGroup} blood required at ${hospital}`,
        type: "emergency_blood_request",
        data: { requestId: request._id.toString() }
      });
    }

    res.status(201).json({ message: 'Blood request created', request });
  } catch (err) {
    next(err);
  }
};

// ── GET URGENT REQUESTS ─────────────────
exports.getUrgentRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const requests = await BloodRequest.find({
      $or: [
        { status: 'Pending' },
        { status: 'Rejected' },
        { acceptedBy: userId },
        { assignedBloodBank: userId }
      ]
    })
      .populate('requester', 'name phone fcmToken')
      .sort('-createdAt');

    res.json(requests);
  } catch (err) {
    next(err);
  }
};

// ── ACCEPT REQUEST ─────────────────
exports.acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    if (request.status !== 'Pending' && request.status !== 'Rejected') {
      return res.status(400).json({ message: 'Already processed' });
    }

    request.status = 'Accepted';
    request.acceptedAt = new Date();
    request.acceptedByRole = userRole;

    if (userRole === 'donor') {
      request.acceptedBy = userId;
      request.donorAccepted = true;

      const donor = await User.findById(userId).select('phone');
      if (donor) request.donorContact = donor.phone;

    } else if (userRole === 'bloodbank') {
      request.assignedBloodBank = userId;
      request.bloodBankAccepted = true;
    } else {
      return res.status(403).json({ message: 'Unauthorized role' });
    }

    await request.save();

    await request.populate('requester', 'name phone fcmToken');

    if (request.requester.fcmToken) {
      await sendNotification(
        [request.requester.fcmToken],
        [request.requester._id],
        {
          title: "✅ Request Accepted",
          body: `${userRole} accepted your request`,
          type: "request_accepted",
          data: { requestId: request._id.toString() }
        }
      );
    }

    res.json({ message: 'Accepted', request });

  } catch (err) {
    next(err);
  }
};

// ── REJECT REQUEST ─────────────────
exports.rejectRequest = async (req, res, next) => {
  try {
    const { requestId, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: 'Reason required' });
    }

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Not found' });

    request.status = 'Rejected';
    request.rejectionReason = reason;
    await request.save();

    res.json({ message: 'Rejected', request });

  } catch (err) {
    next(err);
  }
};

// ── VERIFY COMPLETION ─────────────────
exports.verifyCompletion = async (req, res, next) => {
  try {
    const { requestId, role } = req.body;
    const userId = req.user.id;

    const request = await BloodRequest.findById(requestId)
      .populate('requester')
      .populate('acceptedBy')
      .populate('assignedBloodBank');

    if (!request) return res.status(404).json({ message: 'Not found' });

    const requesterId = request.requester?._id?.toString();
    const donorId = request.acceptedBy?._id?.toString();

    if (role === 'patient' && requesterId === userId) {
      request.completedByPatient = true;
    } else if (role === 'donor' && donorId === userId) {
      request.completedByDonor = true;
    }

    if (request.completedByPatient && request.completedByDonor) {
      request.status = 'Completed';
    }

    await request.save();

    res.json({ message: 'Updated', request });

  } catch (err) {
    next(err);
  }
};