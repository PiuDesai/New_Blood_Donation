const BloodRequest = require('../models/BloodRequestModel');
const User = require('../models/UserModel');
const sendNotification = require('../utils/sendNotification');

// ── CREATE BLOOD REQUEST (User) ─────────────────
exports.createRequest = async (req, res, next) => {
  try {
    const {
      patientName, bloodGroup, units, hospital,
      location, urgency, remarks
    } = req.body;

    if (!patientName || !bloodGroup || !units || !hospital || !location) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // ✅ 1. Create request
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

    // ✅ 2. Find Recipients (Donors + Blood Banks)
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

    // ✅ 3. Send Notification
    if (ids.length > 0) {
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

// ── GET ALL REQUESTS (Admin/General) ────────────
exports.getAllRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find()
      .populate('requester', 'name phone')
      .populate('acceptedBy', 'name phone')
      .populate('assignedBloodBank', 'name phone location')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

// ── TRACK MY REQUESTS (Patient) ─────────────────
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.id })
      .populate('acceptedBy', 'name phone')
      .populate('assignedBloodBank', 'name phone location')
      .sort('-createdAt');
    res.json(requests);
  } catch (err) {
    next(err);
  }
};

// ── VIEW URGENT REQUESTS (Donor/BloodBank) ──────
exports.getUrgentRequests = async (req, res, next) => {
  try {
    const userId = req.user.id;
    // Show Pending requests, OR requests accepted by this specific user
    const requests = await BloodRequest.find({
      $or: [
        { status: 'Pending' },
        { status: 'Rejected' }, // Also show requests rejected by BB
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

// ── ACCEPT REQUEST (Donor OR Blood Bank) ────────
exports.acceptRequest = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    
    // Allow donors to accept even if BB rejected it
    if (request.status !== 'Pending' && request.status !== 'Rejected') {
       return res.status(400).json({ message: 'Request already accepted or processed' });
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
      return res.status(403).json({ message: 'Only donors or blood banks can accept requests' });
    }

    await request.save();
    
    await request.populate('requester', 'name phone fcmToken');
    if (userRole === 'donor') await request.populate('acceptedBy', 'name phone');
    if (userRole === 'bloodbank') await request.populate('assignedBloodBank', 'name phone location');

    const notificationTargets = [];
    const accepterName = userRole === 'donor' ? request.acceptedBy?.name : request.assignedBloodBank?.name;
    
    if (request.requester.fcmToken) {
      notificationTargets.push({
        token: request.requester.fcmToken,
        id: request.requester._id,
        title: "✅ Request Accepted",
        body: `${accepterName} (${userRole}) has accepted your request.`,
      });
    }

    if (notificationTargets.length > 0) {
      await sendNotification(
        notificationTargets.map(t => t.token),
        notificationTargets.map(t => t.id),
        {
          title: notificationTargets[0].title,
          body: notificationTargets[0].body,
          type: "request_accepted",
          data: { requestId: request._id.toString() }
        }
      );
    }

    res.json({ message: 'Request accepted successfully', request });
  } catch (err) {
    next(err);
  }
};

// ── REJECT REQUEST (Blood Bank) ─────────────────
exports.rejectRequest = async (req, res, next) => {
  try {
    const { requestId, reason } = req.body;
    const bloodBankId = req.user.id;

    if (!reason) return res.status(400).json({ message: 'Reason is required for rejection' });

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });

    request.bloodBankRejected = true;
    request.rejectionReason = reason;
    request.status = 'Rejected'; // Mark as rejected by BB but still available for donors
    await request.save();

    // Notify Donors with same blood group
    const donors = await User.find({
      bloodGroup: request.bloodGroup,
      role: "donor",
      isActive: true
    }).select('_id fcmToken');

    const tokens = donors.map(u => u.fcmToken).filter(Boolean);
    const ids = donors.map(u => u._id);

    if (tokens.length > 0) {
      await sendNotification(tokens, ids, {
        title: "📢 Blood Bank Unavailable - Donor Needed",
        body: `Blood bank could not fulfill request for ${request.bloodGroup} (Reason: ${reason}). Donors, please help!`,
        type: "emergency_blood_request",
        data: { requestId: request._id.toString() }
      });
    }

    res.json({ message: 'Request rejected and donors notified', request });
  } catch (err) {
    next(err);
  }
};

// ── VERIFY COMPLETION ───────────────────────────
exports.verifyCompletion = async (req, res, next) => {
  try {
    const { requestId, role } = req.body; // role: 'patient', 'donor', 'bloodbank'
    const userId = req.user.id;

    const request = await BloodRequest.findById(requestId)
      .populate('requester', 'name phone fcmToken')
      .populate('acceptedBy', 'name phone fcmToken')
      .populate('assignedBloodBank', 'name phone fcmToken');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // 1. Update confirmation flags
    const requesterId = request.requester?._id?.toString() || request.requester?.toString();
    const acceptedById = request.acceptedBy?._id?.toString() || request.acceptedBy?.toString();
    const bloodBankId = request.assignedBloodBank?._id?.toString() || request.assignedBloodBank?.toString();

    if (role === 'patient' && requesterId === userId) {
      request.completedByPatient = true;
      request.receivedByPatient = true;
    } else if (role === 'donor' && acceptedById === userId) {
      request.completedByDonor = true;
    } else if (role === 'bloodbank' && bloodBankId === userId) {
      request.suppliedByBloodBank = true;
      request.completedByDonor = true; 
    } else {
      return res.status(403).json({ 
        message: `Unauthorized confirmation for role ${role}. Please ensure you are the correct person to confirm this request.` 
      });
    }

    // 2. Logic for marking status as "Completed"
    let shouldComplete = false;
    if (request.completedByPatient && request.completedByDonor) {
      shouldComplete = true;
    }

    if (shouldComplete) {
      request.status = 'Completed';
      
      // Reward Donor if applicable
      if (request.acceptedByRole === 'donor' && request.acceptedBy) {
        const donor = await User.findById(request.acceptedBy._id);
        if (donor) {
          donor.points = (donor.points || 0) + 10;
          if (!donor.donorInfo) donor.donorInfo = { donationCount: 0 };
          donor.donorInfo.donationCount += 1;
          
          const now = new Date();
          donor.donorInfo.lastDonatedAt = now;
          const nextDate = new Date(now);
          nextDate.setMonth(nextDate.getMonth() + 3);
          donor.donorInfo.nextEligibleAt = nextDate;
          donor.donorInfo.isEligible = false;

          if (donor.points >= 50) {
            donor.donorInfo.checkupEligible = true;
          }

          await donor.save();
        }
      }
    }

    await request.save();

    // Notify other parties
    const notifyParties = [];
    if (role !== 'patient' && request.requester.fcmToken) notifyParties.push(request.requester);
    if (role !== 'donor' && request.acceptedBy?.fcmToken) notifyParties.push(request.acceptedBy);
    if (role !== 'bloodbank' && request.assignedBloodBank?.fcmToken) notifyParties.push(request.assignedBloodBank);

    if (notifyParties.length > 0) {
      await sendNotification(
        notifyParties.map(p => p.fcmToken),
        notifyParties.map(p => p._id),
        {
          title: shouldComplete ? "🎉 Request Completed" : "✔️ Completion Confirmed",
          body: shouldComplete 
            ? "The blood request has been successfully completed." 
            : `Completion has been confirmed by the ${role}.`,
          type: "general",
          data: { requestId: request._id.toString() }
        }
      );
    }

    res.json({ message: 'Confirmation saved', request, completed: shouldComplete });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE REQUEST (Patient) ────────────────────
exports.updateRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.requester.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Cannot edit after acceptance' });

    const updated = await BloodRequest.findByIdAndUpdate(id, { $set: req.body }, { new: true });
    res.json({ message: 'Request updated', request: updated });
  } catch (err) {
    next(err);
  }
};

// ── DELETE REQUEST (Patient) ────────────────────
exports.deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;
    const request = await BloodRequest.findById(id);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.requester.toString() !== req.user.id) return res.status(403).json({ message: 'Unauthorized' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Cannot delete after acceptance' });

    request.status = 'Cancelled';
    request.cancelReason = cancelReason || 'No reason provided';
    await request.save();

    // Notify active donors and blood banks that this request is no longer active
    const donors = await User.find({ bloodGroup: request.bloodGroup, role: "donor", isActive: true }).select('fcmToken _id');
    const bloodBanks = await User.find({ role: "bloodbank", isActive: true }).select('fcmToken _id');
    
    const tokens = [...donors, ...bloodBanks].map(u => u.fcmToken).filter(Boolean);
    const ids = [...donors, ...bloodBanks].map(u => u._id);

    if (tokens.length > 0) {
      await sendNotification(tokens, ids, {
        title: "🚫 Blood Request Cancelled",
        body: `The request for ${request.bloodGroup} at ${request.hospital} has been cancelled by the patient.`,
        type: "request_cancelled",
        data: { requestId: request._id.toString() }
      });
    }

    res.json({ message: 'Request cancelled', request });
  } catch (err) {
    next(err);
  }
};

// ── ISSUE BLOOD (Blood Bank) ──────────────────
exports.issueBlood = async (req, res, next) => {
  try {
    const { requestId } = req.body;
    const bloodBankId = req.user.id;

    const request = await BloodRequest.findById(requestId)
      .populate('requester', 'name phone fcmToken');

    if (!request) return res.status(404).json({ message: 'Request not found' });

    // Ensure it was assigned or just the BB taking it
    request.status = 'Accepted';
    request.assignedBloodBank = bloodBankId;
    request.issuedAt = new Date();
    await request.save();

    // Notify Patient
    if (request.requester.fcmToken) {
      await sendNotification([request.requester.fcmToken], [request.requester._id], {
        title: "🩸 Blood Issued",
        body: `Your request has been processed by the Blood Bank. Please visit to receive it.`,
        type: "general",
        data: { requestId: request._id.toString() }
      });
    }

    res.json({ message: 'Blood issued successfully', request });
  } catch (err) {
    next(err);
  }
};

// ── COMPLETE DONATION (Legacy - kept for safety)
exports.completeDonation = async (req, res, next) => {
  req.body.role = req.user.role;
  return exports.verifyCompletion(req, res, next);
};
