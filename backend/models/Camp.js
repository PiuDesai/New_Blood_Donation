const mongoose = require("mongoose");

const participationSchema = new mongoose.Schema(
  {
    donor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["registered", "awaiting_donor_confirm", "completed", "declined"],
      default: "registered",
    },
    units: { type: Number, default: 1, min: 1 },
    markedByBankAt: Date,
    donorRespondedAt: Date,
    certificateCode: { type: String, default: "" },
    certificateIssuedAt: Date,
  },
  { _id: true }
);

const campSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    /** @deprecated use participations — kept for older records */
    registeredDonors: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    participations: [participationSchema],
    unitsCollected: {
      type: Number,
      default: 0,
    },
    campStatus: {
      type: String,
      enum: ["scheduled", "completed"],
      default: "scheduled",
    },
    /** Filled when blood bank marks camp complete — camp summary for records / print */
    summaryReport: {
      generatedAt: Date,
      campName: String,
      place: String,
      campScheduledDate: Date,
      /** Calendar span from camp creation to completion (min 1 day) */
      daysCampRun: Number,
      registeredDonorsCount: Number,
      completedDonationsCount: Number,
      awaitingDonorConfirmationCount: Number,
      stillRegisteredOnlyCount: Number,
      totalUnitsCollected: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Camp", campSchema);
