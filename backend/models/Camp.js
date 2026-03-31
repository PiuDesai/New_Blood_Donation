const mongoose = require("mongoose");

const campSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    registeredDonors: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],
    unitsCollected: {
    type: Number,
    default: 0
}
}, { timestamps: true });

module.exports = mongoose.model("Camp", campSchema);