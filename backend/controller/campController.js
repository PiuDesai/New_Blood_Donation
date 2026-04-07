const crypto = require("crypto");
const Camp = require("../models/Camp");
const User = require("../models/UserModel");
const sendNotification = require("../utils/sendNotification");
const {
  getDonorCooldownStatus,
  applyCooldownAfterDonation,
  COOLDOWN_DAYS,
} = require("../utils/donorCooldown");
const { addPointsForDonation } = require("./GamificationController");

function userId(req) {
  return req.user?.id || req.user?.userId || req.user?._id;
}

/** Ensure legacy registeredDonors appear as participations (mutates doc). */
function ensureParticipationsOnCamp(camp) {
  if (!camp.participations) camp.participations = [];
  for (const id of camp.registeredDonors || []) {
    const sid = id.toString();
    if (!camp.participations.some((p) => p.donor.toString() === sid)) {
      camp.participations.push({
        donor: id,
        status: "registered",
        units: 1,
      });
    }
  }
}

function buildCampSummaryReport(camp, completedAt = new Date()) {
  ensureParticipationsOnCamp(camp);
  const parts = camp.participations || [];
  const registeredDonorsCount = parts.length;
  const completedDonationsCount = parts.filter((p) => p.status === "completed").length;
  const awaitingDonorConfirmationCount = parts.filter(
    (p) => p.status === "awaiting_donor_confirm"
  ).length;
  const stillRegisteredOnlyCount = parts.filter((p) => p.status === "registered").length;
  const start = camp.createdAt ? new Date(camp.createdAt) : new Date(camp.date);
  const end = completedAt;
  const ms = Math.max(0, end.getTime() - start.getTime());
  const daysCampRun = Math.max(1, Math.ceil(ms / 86400000));
  return {
    generatedAt: completedAt,
    campName: camp.name,
    place: camp.location,
    campScheduledDate: camp.date,
    daysCampRun,
    registeredDonorsCount,
    completedDonationsCount,
    awaitingDonorConfirmationCount,
    stillRegisteredOnlyCount,
    totalUnitsCollected: camp.unitsCollected || 0,
  };
}

async function incrementBloodBankStock(bankUserId, bloodGroup, units) {
  const bank = await User.findById(bankUserId);
  if (!bank || bank.role !== "bloodbank") return;
  const idx = bank.bloodStock.findIndex((s) => s.bloodGroup === bloodGroup);
  if (idx > -1) bank.bloodStock[idx].units += units;
  else bank.bloodStock.push({ bloodGroup, units });
  await bank.save();
}

// CREATE CAMP
exports.createCamp = async (req, res) => {
  try {
    const uid = userId(req);
    const camp = await Camp.create({
      ...req.body,
      createdBy: uid,
      participations: [],
      unitsCollected: 0,
    });
    res.status(201).json(camp);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create camp" });
  }
};

exports.getCamps = async (req, res) => {
  try {
    const uid = userId(req);
    const camps = await Camp.find({ createdBy: uid })
      .populate("participations.donor", "name phone bloodGroup email")
      .sort({ date: -1 });
    res.json(
      camps.map((c) => {
        const o = c.toObject();
        o.registeredCount = Math.max(
          o.registeredDonors?.length || 0,
          o.participations?.length || 0
        );
        return o;
      })
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllCamps = async (req, res) => {
  try {
    const role = String(req.user?.role || "").toLowerCase();
    const query = {};
    if (role === "donor" || role === "patient") {
      query.campStatus = "scheduled";
    }
    const camps = await Camp.find(query)
      .populate("createdBy", "name location phone email")
      .sort({ date: -1 })
      .limit(80);
    res.json(camps);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Blood bank: single camp with donor rows + status */
exports.getCampBankDetail = async (req, res) => {
  try {
    const uid = userId(req);
    const camp = await Camp.findById(req.params.campId);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.createdBy.toString() !== uid.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    ensureParticipationsOnCamp(camp);
    if (camp.isModified()) await camp.save();
    await camp.populate("participations.donor", "name phone bloodGroup email");
    res.json(camp);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = userId(req);
    const camp = await Camp.findById(id);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.createdBy.toString() !== uid.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    camp.name = req.body.name || camp.name;
    camp.location = req.body.location || camp.location;
    camp.date = req.body.date || camp.date;
    await camp.save();
    res.status(200).json({ message: "Camp updated successfully", camp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteCamp = async (req, res) => {
  try {
    const { id } = req.params;
    const uid = userId(req);
    const camp = await Camp.findById(id);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.createdBy.toString() !== uid.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    await camp.deleteOne();
    res.status(200).json({ message: "Camp deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.registerDonor = async (req, res) => {
  try {
    const { campId } = req.body;
    const donorId = userId(req);
    if (!donorId) return res.status(401).json({ message: "User not authenticated" });

    const donor = await User.findById(donorId);
    if (!donor || donor.role !== "donor") {
      return res.status(403).json({ message: "Only donors can register for camps" });
    }

    const cool = getDonorCooldownStatus(donor);
    if (!cool.canDonateBlood) {
      return res.status(400).json({
        message: `You can donate again after your ${COOLDOWN_DAYS}-day interval.`,
        code: "NOT_ELIGIBLE",
        daysRemaining: cool.daysRemaining,
        nextEligibleAt: cool.nextEligibleAt,
      });
    }

    const camp = await Camp.findById(campId);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.campStatus === "completed") {
      return res.status(400).json({ message: "This camp is already completed" });
    }

    ensureParticipationsOnCamp(camp);
    const exists = camp.participations.some((p) => p.donor.toString() === donorId.toString());
    if (exists || (camp.registeredDonors || []).some((id) => id.toString() === donorId.toString())) {
      return res.status(400).json({ message: "Already registered" });
    }

    camp.participations.push({
      donor: donorId,
      status: "registered",
      units: 1,
    });
    camp.registeredDonors = camp.registeredDonors || [];
    camp.registeredDonors.push(donorId);
    await camp.save();

    res.status(200).json({ message: "Registered successfully", camp });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/** Donor: camps they joined + status */
exports.getMyCampParticipations = async (req, res) => {
  try {
    const donorId = userId(req);
    const camps = await Camp.find({
      $or: [{ "participations.donor": donorId }, { registeredDonors: donorId }],
    })
      .populate("createdBy", "name phone email location")
      .sort({ date: -1 });

    const rows = [];
    for (const camp of camps) {
      ensureParticipationsOnCamp(camp);
      if (camp.isModified()) await camp.save();
      const p = camp.participations.find((x) => x.donor.toString() === donorId.toString());
      if (!p) continue;
      rows.push({
        camp: {
          _id: camp._id,
          name: camp.name,
          location: camp.location,
          date: camp.date,
          campStatus: camp.campStatus,
          unitsCollected: camp.unitsCollected,
          createdBy: camp.createdBy,
        },
        participation: {
          status: p.status,
          units: p.units,
          certificateCode: p.certificateCode,
          certificateIssuedAt: p.certificateIssuedAt,
        },
      });
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Blood bank: donor donated at camp — waits for donor confirmation */
exports.markCampDonationPending = async (req, res) => {
  try {
    const uid = userId(req);
    const { campId, donorId, units = 1 } = req.body;
    if (!campId || !donorId) {
      return res.status(400).json({ message: "campId and donorId required" });
    }
    const camp = await Camp.findById(campId);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.campStatus === "completed") {
      return res.status(400).json({ message: "This camp is already completed" });
    }
    if (camp.createdBy.toString() !== uid.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    ensureParticipationsOnCamp(camp);
    if (camp.isModified()) await camp.save();
    const p = camp.participations.find((x) => x.donor.toString() === donorId.toString());
    if (!p) return res.status(404).json({ message: "Donor is not registered for this camp" });
    if (p.status === "completed") {
      return res.status(400).json({ message: "Donation already completed for this donor" });
    }
    if (p.status === "awaiting_donor_confirm") {
      return res.status(400).json({ message: "Already waiting for donor confirmation" });
    }

    p.status = "awaiting_donor_confirm";
    p.units = Math.max(1, Number(units) || 1);
    p.markedByBankAt = new Date();
    await camp.save();

    const donor = await User.findById(donorId).select("name fcmToken");
    const tokens = donor?.fcmToken ? [donor.fcmToken] : [];
    try {
      await sendNotification(tokens, [donorId], {
        title: "Confirm your camp donation",
        body: `${camp.name}: the blood bank recorded your donation. Please confirm in the app to complete it and receive your certificate.`,
        type: "camp_donation_pending",
        data: { campId: camp._id.toString() },
      });
    } catch (e) {
      console.error(e.message);
    }

    res.json({ message: "Waiting for donor confirmation", camp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Donor confirms bank's record → inventory, certificate, cooldown */
exports.confirmCampDonation = async (req, res) => {
  try {
    const donorId = userId(req);
    const { campId } = req.body;
    if (!campId) return res.status(400).json({ message: "campId required" });

    const camp = await Camp.findById(campId).populate("createdBy", "name");
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    ensureParticipationsOnCamp(camp);
    if (camp.isModified()) await camp.save();
    const p = camp.participations.find((x) => x.donor.toString() === donorId.toString());
    if (!p) return res.status(404).json({ message: "You are not registered for this camp" });
    if (p.status !== "awaiting_donor_confirm") {
      return res.status(400).json({ message: "No pending donation to confirm" });
    }

    const donor = await User.findById(donorId);
    if (!donor || donor.role !== "donor") {
      return res.status(403).json({ message: "Invalid donor" });
    }

    p.status = "completed";
    p.donorRespondedAt = new Date();
    p.certificateCode = `CAMP-${camp._id.toString().slice(-6).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    p.certificateIssuedAt = new Date();
    camp.unitsCollected = (camp.unitsCollected || 0) + p.units;
    await camp.save();

    await incrementBloodBankStock(camp.createdBy, donor.bloodGroup, p.units);

    applyCooldownAfterDonation(donor);
    await donor.save();
    await addPointsForDonation(donor._id, 50);

    const tokens = donor.fcmToken ? [donor.fcmToken] : [];
    try {
      await sendNotification(tokens, [donorId], {
        title: "Donation certificate ready",
        body: `Thank you! Your ${camp.name} donation is recorded. View your certificate in Certificates.`,
        type: "camp_certificate_ready",
        data: {
          campId: camp._id.toString(),
          certificateCode: p.certificateCode,
        },
      });
    } catch (e) {
      console.error(e.message);
    }

    res.json({
      message: "Donation completed",
      certificateCode: p.certificateCode,
      certificateIssuedAt: p.certificateIssuedAt,
      unitsRecorded: p.units,
      camp,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Donor says the bank record was wrong */
exports.declineCampDonation = async (req, res) => {
  try {
    const donorId = userId(req);
    const { campId } = req.body;
    const camp = await Camp.findById(campId);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    ensureParticipationsOnCamp(camp);
    if (camp.isModified()) await camp.save();
    const p = camp.participations.find((x) => x.donor.toString() === donorId.toString());
    if (!p || p.status !== "awaiting_donor_confirm") {
      return res.status(400).json({ message: "Nothing to decline" });
    }
    p.status = "registered";
    p.markedByBankAt = undefined;
    await camp.save();

    const bankTokens = [];
    const bank = await User.findById(camp.createdBy).select("fcmToken");
    if (bank?.fcmToken) bankTokens.push(bank.fcmToken);
    try {
      await sendNotification(bankTokens, [camp.createdBy], {
        title: "Donor declined donation record",
        body: `A donor declined the camp donation record for ${camp.name}.`,
        type: "general",
        data: { campId: camp._id.toString(), donorId: donorId.toString() },
      });
    } catch (e) {
      console.error(e.message);
    }

    res.json({ message: "Declined; blood bank has been notified", camp });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.completeCampEvent = async (req, res) => {
  try {
    const uid = userId(req);
    const camp = await Camp.findById(req.params.id);
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    if (camp.createdBy.toString() !== uid.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }
    if (camp.campStatus === "completed") {
      return res.status(400).json({ message: "Camp is already completed" });
    }
    ensureParticipationsOnCamp(camp);
    if (camp.isModified()) await camp.save();

    const completedAt = new Date();
    camp.campStatus = "completed";
    camp.summaryReport = buildCampSummaryReport(camp, completedAt);
    await camp.save();

    const populated = await Camp.findById(camp._id).populate("createdBy", "name location phone email");
    res.json({
      message: "Camp marked complete. Summary report generated.",
      camp: populated,
      summaryReport: populated.summaryReport,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/** Donor certificate payload for one camp */
exports.getCampCertificate = async (req, res) => {
  try {
    const donorId = userId(req);
    const camp = await Camp.findById(req.params.campId).populate("createdBy", "name location");
    if (!camp) return res.status(404).json({ message: "Camp not found" });
    ensureParticipationsOnCamp(camp);
    if (camp.isModified()) await camp.save();
    const p = camp.participations.find((x) => x.donor.toString() === donorId.toString());
    if (!p || p.status !== "completed" || !p.certificateCode) {
      return res.status(404).json({ message: "No certificate for this camp yet" });
    }
    const donor = await User.findById(donorId).select("name bloodGroup");
    res.json({
      certificateCode: p.certificateCode,
      issuedAt: p.certificateIssuedAt,
      units: p.units,
      campName: camp.name,
      campDate: camp.date,
      campLocation: camp.location,
      bloodBankName: camp.createdBy?.name,
      donorName: donor?.name,
      bloodGroup: donor?.bloodGroup,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTotalUnits = async (req, res) => {
  try {
    const uid = userId(req);
    const camps = await Camp.find({ createdBy: uid });
    const totalUnits = camps.reduce((sum, c) => sum + (c.unitsCollected || 0), 0);
    res.status(200).json({
      totalUnits,
      totalCamps: camps.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
