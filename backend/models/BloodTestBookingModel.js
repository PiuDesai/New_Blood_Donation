const mongoose = require('mongoose');

const bloodTestBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    testType: {
      type: String,
      required: [true, 'Test type is required'],
      enum: [
        'Complete Blood Count (CBC)',
        'Liver Function Test (LFT)',
        'Kidney Function Test (KFT)',
        'Blood Sugar (Fasting)',
        'Blood Sugar (Random)',
        'HbA1c',
        'Lipid Profile',
        'Thyroid Function Test (TFT)',
        'HIV Test',
        'Hepatitis B',
        'Hepatitis C',
        'Blood Group & Rh Typing',
        'Malaria Test',
        'Dengue Test',
        'Widal Test',
        'Vitamin D',
        'Vitamin B12',
        'Iron Studies',
        'ESR',
        'CRP (C-Reactive Protein)'
      ]
    },

    preferredDate: {
      type: Date,
      required: [true, 'Preferred date is required']
    },

    preferredTimeSlot: {
      type: String,
      enum: ['6:00 AM - 8:00 AM', '8:00 AM - 10:00 AM', '10:00 AM - 12:00 PM', '12:00 PM - 2:00 PM', '2:00 PM - 4:00 PM', '4:00 PM - 6:00 PM'],
      default: '8:00 AM - 10:00 AM'
    },

    collectionType: {
      type: String,
      enum: ['home_collection', 'lab_visit'],
      default: 'home_collection'
    },

    address: {
      type: String,
      required: function () {
        return this.collectionType === 'home_collection';
      }
    },

    patientName: {
      type: String,
      required: true
    },

    patientAge: {
      type: Number,
      required: true
    },

    contactPhone: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ['pending', 'confirmed', 'sample_collected', 'processing', 'report_ready', 'cancelled'],
      default: 'pending'
    },

    assignedTechnician: {
      type: String,
      default: ''
    },

    reportUrl: {
      type: String,
      default: ''
    },

    notes: {
      type: String,
      default: ''
    },

    price: {
      type: Number,
      default: 0
    },

    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'refunded'],
      default: 'pending'
    }
  },
  { timestamps: true }
);

bloodTestBookingSchema.index({ user: 1, createdAt: -1 });
bloodTestBookingSchema.index({ status: 1 });

module.exports = mongoose.model('BloodTestBooking', bloodTestBookingSchema);
