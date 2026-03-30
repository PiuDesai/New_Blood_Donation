const Camp = require("../models/Camp");

// CREATE CAMP
exports.createCamp = async (req, res) => {
  try {
    const { name, location, date } = req.body;

    const newCamp = new Camp({
      name,
      location,
      date,
      createdBy: req.user.id   // ✅ use id
    });

    await newCamp.save();

    res.status(201).json(newCamp);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET ALL CAMPS (ONLY FOR LOGGED-IN BLOOD BANK)
exports.getCamps = async (req, res) => {
  try {
    const camps = await Camp.find({
      createdBy: req.user.id
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

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    // 🔥 SECURITY CHECK
    if (camp.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Update fields
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

    const camp = await Camp.findById(id);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    // 🔥 SECURITY CHECK
    if (camp.createdBy.toString() !== req.user.id) {
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

// TODO: Connect with Donor module once implemented
//Register donor
exports.registerDonor = async (req, res) => {
  try {
    const { campId, donorId } = req.body;

    // 1. Find camp
    const camp = await Camp.findById(campId);

    if (!camp) {
      return res.status(404).json({ message: "Camp not found" });
    }

    // 2. Check duplicate
    if (camp.registeredDonors.includes(donorId)) {
      return res.status(400).json({ message: "Donor already registered" });
    }

    // 3. Add donor
    camp.registeredDonors.push(donorId);
    camp.unitsCollected = camp.registeredDonors.length;
    await camp.save();

    res.status(200).json({
      message: "Donor registered successfully",
      camp
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.getTotalUnits = async (req, res) => {
  try {
    const camps = await Camp.find({ createdBy: req.user.id });

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