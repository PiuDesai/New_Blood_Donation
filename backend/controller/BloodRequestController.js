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
    const requests = await BloodRequest.find({ status: 'Pending' })
      .populate('requester', 'name phone')
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
    const userRole = req.user.role; // Assume role is in req.user

    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: 'Request not found' });
    if (request.status !== 'Pending') return res.status(400).json({ message: 'Request already accepted or processed' });

    request.status = 'Accepted';
    request.acceptedAt = new Date();
    request.acceptedByRole = userRole;

    if (userRole === 'donor') {
      request.acceptedBy = userId;
    } else if (userRole === 'bloodbank') {
      request.assignedBloodBank = userId;
    } else {
      return res.status(403).json({ message: 'Only donors or blood banks can accept requests' });
    }

    await request.save();
    
    // Populate for response and notification
    await request.populate('requester', 'name phone fcmToken');
    await request.populate('acceptedBy', 'name phone');
    await request.populate('assignedBloodBank', 'name phone location');

    // Notify Patient
    if (request.requester.fcmToken) {
      const accepterName = userRole === 'donor' ? request.acceptedBy.name : request.assignedBloodBank.name;
      await sendNotification([request.requester.fcmToken], [request.requester._id], {
        title: "✅ Request Accepted",
        body: `${accepterName} (${userRole}) has accepted your request.`,
        type: "general",
        data: { requestId: request._id.toString() }
      });
    }

    res.json({ message: 'Request accepted successfully', request });
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
    if (role === 'patient' && request.requester._id.toString() === userId) {
      request.isPatientConfirmed = true;
    } else if (role === 'donor' && request.acceptedBy?._id.toString() === userId) {
      request.isDonorConfirmed = true;
    } else if (role === 'bloodbank' && request.assignedBloodBank?._id.toString() === userId) {
      request.isBloodBankConfirmed = true;
    } else {
      return res.status(403).json({ message: 'Unauthorized confirmation' });
    }

    // 2. Logic for marking status as "Completed"
    let shouldComplete = false;
    if (request.acceptedByRole === 'donor') {
      // Donor flow: Both patient and donor must confirm
      if (request.isPatientConfirmed && request.isDonorConfirmed) {
        shouldComplete = true;
      }
    } else if (request.acceptedByRole === 'bloodbank') {
      // Blood bank flow: Either patient or blood bank confirms
      if (request.isPatientConfirmed || request.isBloodBankConfirmed) {
        shouldComplete = true;
      }
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
        notifyParties.map(p => u.fcmToken),
        notifyParties.map(p => u._id),
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
    res.json({ message: 'Request cancelled', request });
  } catch (err) {
    next(err);
  }
};

// ── COMPLETE DONATION (Legacy - kept for safety)
exports.completeDonation = async (req, res, next) => {
  req.body.role = req.user.role;
  return exports.verifyCompletion(req, res, next);
};
