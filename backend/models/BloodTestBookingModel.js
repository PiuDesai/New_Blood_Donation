const mongoose = require('mongoose');

const bloodTestBookingSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    bloodBank: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true
    },

    patientName: {
      type: String,
      required: true,
      trim: true
    },

    address: {
      type: String,
      required: true,
      trim: true
    },

    mapLink: {
      type: String,
      default: ''
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    testType: {
      type: String,
      required: [true, 'Test type is required'],
      trim: true
    },

    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected', 'Completed'],
      default: 'Pending',
      index: true
    },

    assignedPerson: {
      type: String,
      default: '',
      trim: true
    },

    assignedContact: {
      type: String,
      default: '',
      trim: true
    },

    reportUrl: {
      type: String,
      default: ''
    },

    // 🔥 EXTRA IMPROVEMENTS
    notes: {
      type: String,
      default: '',
      trim: true
    },

    price: {
      type: Number,
      default: 0,
      min: 0
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

// ✅ Indexes for performance
bloodTestBookingSchema.index({ patient: 1, createdAt: -1 });
bloodTestBookingSchema.index({ status: 1 });

// ✅ Optional: Virtual for quick check
bloodTestBookingSchema.virtual('isCompleted').get(function () {
  return this.status === 'Completed';
});

module.exports = mongoose.model('BloodTestBooking', bloodTestBookingSchema);