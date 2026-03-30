const BloodRequest = require('../models/BloodRequestModel');
const User = require('../models/UserModel');

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

    const request = await BloodRequest.create({
      requester: req.user.id,
      patientName,
      bloodGroup,
      units,
      hospital,
      location,
      urgency,
      remarks
    });

    res.status(201).json({
      message: 'Blood request created successfully',
      request
    });

  } catch (err) {
    next(err);
  }
};


// ── TRACK REQUEST STATUS (User) ─────────────────
exports.getMyRequests = async (req, res, next) => {
  try {
    const requests = await BloodRequest.find({ requester: req.user.id })
      .populate('assignedBloodBank', 'name phone location')
      .sort('-createdAt');

    res.json(requests);

  } catch (err) {
    next(err);
  }
};


// ── VIEW BLOOD REQUESTS (Blood Bank) ───────────
exports.getAllRequests = async (req, res, next) => {
  try {
    // For now, getting all pending requests
    // Ideally, filter by proximity
    const requests = await BloodRequest.find({ status: 'Pending' })
      .populate('requester', 'name phone')
      .sort('-createdAt');

    res.json(requests);

  } catch (err) {
    next(err);
  }
};


// ── ISSUE BLOOD (Blood Bank) ───────────────────
exports.issueBlood = async (req, res, next) => {
  try {
    const { requestId, remarks } = req.body;

    const request = await BloodRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'Request not found' });
    }

    if (request.status !== 'Pending') {
      return res.status(400).json({ message: 'Request already processed' });
    }

    const bloodBank = await User.findById(req.user.id);
    if (!bloodBank || bloodBank.role !== 'bloodbank') {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if blood bank has enough stock
    const stock = bloodBank.bloodStock.find(s => s.bloodGroup === request.bloodGroup);
    if (!stock || stock.units < request.units) {
      return res.status(400).json({ message: `Insufficient ${request.bloodGroup} blood stock` });
    }

    // Deduct stock
    stock.units -= request.units;
    await bloodBank.save();

    // Update request
    request.status = 'Fulfilled';
    request.assignedBloodBank = bloodBank._id;
    request.issuedAt = new Date();
    request.remarks = remarks || `Blood issued by ${bloodBank.name}`;
    await request.save();

    res.json({
      message: 'Blood issued successfully',
      request
    });

  } catch (err) {
    next(err);
  }
};
