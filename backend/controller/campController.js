const Camp = require("../models/Camp");

// CREATE CAMP
exports.createCamp = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    const camp = await Camp.create({
      ...req.body,
      createdBy: userId
    });

    res.status(201).json(camp);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create camp" });
  }
};

// GET ALL CAMPS (ONLY FOR LOGGED-IN BLOOD BANK)
exports.getCamps = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    const camps = await Camp.find({
      createdBy: userId
    });

    res.json(camps);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL CAMPS FOR USERS
exports.getAllCamps = async (req, res) => {
  try {
    const camps = await Camp.find().populate('createdBy', 'name location');
    res.json(camps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// UPDATE CAMP
exports.updateCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    if (camp.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    camp.name = req.body.name || camp.name;
    camp.location = req.body.location || camp.location;
    camp.date = req.body.date || camp.date;

    await camp.save();

    res.status(200).json({
      message: "Camp updated successfully",
      camp
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE CAMP
exports.deleteCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    if (camp.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await camp.deleteOne();

    res.status(200).json({
      message: "Camp deleted successfully"
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// REGISTER DONOR
exports.registerDonor = async (req, res) => {
  try {
    console.log("REQ USER:", req.user);

    const { campId } = req.body;

    const donorId = req.user?.id || req.user?.userId || req.user?._id;
    console.log("Donor ID:", donorId);

    if (!donorId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const camp = await Camp.findById(campId);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    const alreadyRegistered = camp.registeredDonors.some(
      (id) => id && donorId && id.toString() === donorId.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: "Already registered" });
    }

    camp.registeredDonors.push(donorId);
    camp.unitsCollected = camp.registeredDonors.length;

    await camp.save();

    res.status(200).json({
      message: "Registered successfully",
      camp
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// TOTAL UNITS
exports.getTotalUnits = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.userId || req.user?._id;

    const camps = await Camp.find({ createdBy: userId });

    const totalUnits = camps.reduce(
      (sum, camp) => sum + camp.unitsCollected,
      0
    );

    res.status(200).json({
      totalUnits,
      totalCamps: camps.length
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};