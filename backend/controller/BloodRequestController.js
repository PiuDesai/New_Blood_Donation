const BloodRequest = require('../models/BloodRequestModel');
const User = require('../models/UserModel');
const sendNotification = require('../utils/sendNotification');
const { getDonorCooldownStatus, COOLDOWN_DAYS } = require('../utils/donorCooldown');

const VALID_BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

function normalizeBloodGroup(input) {
  if (input == null) return null;
  const s = String(input).trim();
  if (VALID_BLOOD_GROUPS.includes(s)) return s;
  const compact = s.replace(/\s/g, '');
  if (VALID_BLOOD_GROUPS.includes(compact)) return compact;
  const upper = compact.toUpperCase();
  if (VALID_BLOOD_GROUPS.includes(upper)) return upper;
  return null;
}

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

    const groupForDb = normalizeBloodGroup(bloodGroup);
    if (!groupForDb) {
      return res.status(400).json({ message: 'Invalid blood group' });
    }

    const request = await BloodRequest.create({
      requester: req.user.id,
      patientName,
      bloodGroup: groupForDb,
      units,
      hospital,
      location,
      urgency,
      remarks,
      status: 'Pending'
    });

    const donors = await User.find({
      bloodGroup: groupForDb,
      role: 'donor',
      isActive: true
    }).select('_id fcmToken');

    const bloodBanks = await User.find({
      role: 'bloodbank',
      isActive: true
    }).select('_id fcmToken');

    const allRecipients = [...donors, ...bloodBanks];
    const dbRecipientIds = allRecipients.map((u) => u._id);
    const fcmTokens = allRecipients.map((u) => u.fcmToken).filter((t) => typeof t === 'string' && t.length > 0);

    try {
      await sendNotification(fcmTokens, dbRecipientIds, {
        title: `🚨 ${urgency || 'New'} Blood Request`,
        body: `${groupForDb} blood required at ${hospital}`,
        type: 'emergency_blood_request',
        isEmergency: urgency === 'Emergency',
        data: {
          requestId: request._id.toString(),
          bloodGroup: groupForDb,
          hospital
        }
      });
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
    }

    res.status(201).json({ message: 'Blood request created', request });
  } catch (err) {
    next(err);
  }
};

// ── GET MY REQUESTS (Patient) ─────────────────
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.id })
      .populate('acceptedBy', 'name phone fcmToken')
      .populate('assignedBloodBank', 'name phone location fcmToken')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

// ── GET ALL REQUESTS (Admin/BloodBank) ─────────────────
exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requester', 'name phone fcmToken')
      .populate('acceptedBy', 'name phone fcmToken')
      .populate('assignedBloodBank', 'name phone location fcmToken')
      .sort('-createdAt');
    res.json(requests);
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
      const donorUser = await User.findById(userId);
      if (!donorUser) {
        return res.status(404).json({ message: 'Donor not found' });
      }
      const cool = getDonorCooldownStatus(donorUser);
      if (!cool.canDonateBlood) {
        return res.status(403).json({
          message: `You can donate again after ${COOLDOWN_DAYS} days between donations. Please try again in ${cool.daysRemaining} day(s).`,
          code: 'NOT_ELIGIBLE',
          daysRemaining: cool.daysRemaining,
          nextEligibleAt: cool.nextEligibleAt,
        });
      }

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

    const requesterId = request.requester?._id || request.requester;
    const requesterToken = request.requester?.fcmToken;
    try {
      await sendNotification(
        requesterToken ? [requesterToken] : [],
        requesterId ? [requesterId] : [],
        {
          title: '✅ Request Accepted',
          body: `A ${userRole} accepted your blood request.`,
          type: 'request_accepted',
          data: {
            requestId: request._id.toString(),
            acceptedByRole: userRole
          }
        }
      );
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
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
    request.bloodBankRejected = true;
    await request.save();

    await request.populate('requester', 'name phone fcmToken');
    const requesterId = request.requester?._id || request.requester;
    const requesterToken = request.requester?.fcmToken;
    try {
      await sendNotification(
        requesterToken ? [requesterToken] : [],
        requesterId ? [requesterId] : [],
        {
          title: 'Blood request update',
          body: `A blood bank could not fulfill your request: ${reason}`,
          type: 'blood_request_rejected',
          data: { requestId: request._id.toString() }
        }
      );
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
    }

    res.json({ message: 'Rejected', request });

  } catch (err) {
    next(err);
  }
};

// ── UPDATE REQUEST ─────────────────
exports.updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Not found' });

    if (request.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    Object.assign(request, req.body);
    await request.save();
    res.json({ message: 'Updated', request });
  } catch (err) {
    next(err);
  }
};

// ── DELETE REQUEST ─────────────────
exports.deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Not found' });

    if (request.requester.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await BloodRequest.findByIdAndDelete(id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    next(err);
  }
};

// ── ISSUE BLOOD (Blood Bank) ─────────────────
exports.issueBlood = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Not found' });

    request.status = 'Accepted'; // Or a specific status like 'Issued'
    request.assignedBloodBank = req.user.id;
    await request.save();
    res.json({ message: 'Blood issued', request });
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
      .populate('requester', 'name phone fcmToken')
      .populate('acceptedBy', 'name phone fcmToken')
      .populate('assignedBloodBank', 'name phone location fcmToken');

    if (!request) return res.status(404).json({ message: 'Not found' });

    const requesterId = request.requester?._id?.toString() || request.requester?.toString();
    const donorId = request.acceptedBy?._id?.toString() || request.acceptedBy?.toString();
    const bbId = request.assignedBloodBank?._id?.toString() || request.assignedBloodBank?.toString();

    if (role === 'patient' && requesterId === userId) {
      request.completedByPatient = true;
    } else if (role === 'donor' && donorId === userId) {
      request.completedByDonor = true;
    } else if (role === 'bloodbank' && bbId === userId) {
      request.completedByDonor = true; // Use donor flag for BB completion too
    }

    if (request.completedByPatient && request.completedByDonor) {
      request.status = 'Completed';
    }

    await request.save();

    let recipientToken;
    let recipientId;
    if (role === 'patient') {
      if (request.acceptedBy?._id) {
        recipientId = request.acceptedBy._id;
        recipientToken = request.acceptedBy.fcmToken;
      } else if (request.assignedBloodBank?._id) {
        recipientId = request.assignedBloodBank._id;
        recipientToken = request.assignedBloodBank.fcmToken;
      }
    } else if (request.requester?._id) {
      recipientId = request.requester._id;
      recipientToken = request.requester.fcmToken;
    }

    if (recipientId) {
      try {
        await sendNotification(
          recipientToken ? [recipientToken] : [],
          [recipientId],
          {
            title: request.status === 'Completed' ? '🎉 Request Completed' : '✔️ Completion Confirmed',
            body:
              request.status === 'Completed'
                ? 'Both parties have confirmed the request completion.'
                : `${role} has confirmed completion. Waiting for your confirmation.`,
            type: 'general',
            data: { requestId: request._id.toString() }
          }
        );
      } catch (notifErr) {
        console.error('Notification Error:', notifErr.message);
      }
    }

    res.json({ message: 'Updated', request });

  } catch (err) {
    next(err);
  }
};

// ── COMPLETE DONATION (Legacy) ─────────────────
exports.completeDonation = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Not found' });

    request.status = 'Completed';
    await request.save();
    res.json({ message: 'Completed', request });
  } catch (err) {
    next(err);
  }
};
