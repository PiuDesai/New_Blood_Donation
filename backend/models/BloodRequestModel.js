const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    patientName: {
      type: String,
      required: true
    },
    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: true
    },
    units: {
      type: Number,
      required: true
    },
    hospital: {
      type: String,
      required: true
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point'
      },
      coordinates: {
        type: [Number],
        required: true
      },
      address: String,
      city: String
    },
    urgency: {
      type: String,
      enum: ['Normal', 'Urgent', 'Emergency'],
      default: 'Normal'
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Cancelled', 'Completed'],
      default: 'Pending'
    },
    acceptedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    acceptedAt: {
      type: Date,
      default: null
    },
    acceptedByRole: {
      type: String,
      enum: ['donor', 'bloodbank', null],
      default: null
    },
    cancelReason: {
      type: String,
      default: ''
    },
    isRated: {
      type: Boolean,
      default: false
    },
    isPatientConfirmed: {
      type: Boolean,
      default: false
    },
    isDonorConfirmed: {
      type: Boolean,
      default: false
    },
    isBloodBankConfirmed: {
      type: Boolean,
      default: false
    },
    assignedBloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    issuedAt: Date,
    remarks: String
  },
  {
    timestamps: true
  }
);

bloodRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
