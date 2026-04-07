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

    // ✅ Merge both enums
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Cancelled', 'Completed', 'Rejected', 'Supplied'],
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

    // ✅ Keep advanced flow (better logic)
    rejectionReason: {
      type: String,
      default: ''
    },
    donorAccepted: {
      type: Boolean,
      default: false
    },
    bloodBankAccepted: {
      type: Boolean,
      default: false
    },
    bloodBankRejected: {
      type: Boolean,
      default: false
    },
    completedByDonor: {
      type: Boolean,
      default: false
    },
    completedByPatient: {
      type: Boolean,
      default: false
    },
    suppliedByBloodBank: {
      type: Boolean,
      default: false
    },
    receivedByPatient: {
      type: Boolean,
      default: false
    },
    donorContact: {
      type: String,
      default: ''
    },

    isRated: {
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