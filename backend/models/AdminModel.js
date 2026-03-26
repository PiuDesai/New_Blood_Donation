const mongoose = require("mongoose");

const adminSchema = mongoose.Schema({
  AdminMail: {
    type: String,
    required: true,
    unique: true
  },
  AdminPassword: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Admin", adminSchema);