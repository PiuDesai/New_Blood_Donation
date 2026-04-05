const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// ─── Location Schema ─────────────────────────────
const locationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    default: 'Point'
  },
  coordinates: {
    type: [Number], // [longitude, latitude]
    required: true
  },
  address: String,
  city: String,
  state: String,
  pincode: String
});

// ─── User Schema ─────────────────────────────
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 50
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Invalid email']
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      match: [/^[6-9]\d{9}$/, 'Invalid phone number']
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false
    },

    profilePhoto: {
      type: String,
      default: ''
    },

    dateOfBirth: {
      type: Date,
      required: function () {
        return this.role === 'donor' || this.role === 'patient';
      }
    },

    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: function () {
        return this.role === 'donor' || this.role === 'patient';
      }
    },

    role: {
      type: String,
      enum: ['donor', 'patient', 'bloodbank', 'admin'],
      default: 'donor'
    },

    bloodGroup: {
      type: String,
      enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
      required: function () {
        return this.role === 'donor' || this.role === 'patient';
      }
    },

    // Blood bank specific
    licenseInfo: {
      type: String,
      required: function () {
        return this.role === 'bloodbank';
      }
    },

    bloodStock: [
      {
        bloodGroup: {
          type: String,
          enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
        },
        units: {
          type: Number,
          default: 0
        }
      }
    ],

    location: {
      type: locationSchema,
      required: true
    },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    isApproved: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    approvedAt: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },

    rejectionReason: String,

    otp: {
      code: { type: String, select: false },
      expiresAt: { type: Date, select: false },
      attempts: { type: Number, default: 0, select: false }
    },

    donorInfo: {
      isEligible: { type: Boolean, default: true },
      lastDonatedAt: Date,
      nextEligibleAt: Date,

      donationCount: { type: Number, default: 0 },
      noShowCount: { type: Number, default: 0 },

      reliabilityScore: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      },

      medicalConditions: [String],
      weight: Number,

      isDonorAvailable: {
        type: Boolean,
        default: true
      },

      checkupEligible: {
        type: Boolean,
        default: false
      }
    },

    fcmToken: {
      type: String,
      default: ''
    },

    notificationPreferences: {
      pushEnabled: { type: Boolean, default: true },
      smsEnabled: { type: Boolean, default: true },
      emailEnabled: { type: Boolean, default: true },
      emergencyAlertsOnly: { type: Boolean, default: false }
    },

    badges: [
      {
        name: String,
        awardedAt: Date,
        icon: String
      }
    ],

    points: {
      type: Number,
      default: 0
    },

    rating: {
      type: Number,
      default: 0
    },

    reviews: [
      {
        patientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: {
          type: Number,
          required: true,
          min: 1,
          max: 5
        },
        comment: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],

    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },

    lastLoginAt: Date,

    loginAttempts: {
      type: Number,
      default: 0,
      select: false
    },

    lockUntil: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

// ─── Indexes ─────────────────────────────
userSchema.index({ location: '2dsphere' });
userSchema.index({ bloodGroup: 1, role: 1 });
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });

// ─── Pre-save: hash password ─────────────────
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Pre-save: donation eligibility ─────────
userSchema.pre('save', function () {
  if (this.isModified('donorInfo.lastDonatedAt') && this.donorInfo.lastDonatedAt) {
    const next90 = new Date(this.donorInfo.lastDonatedAt);
    next90.setDate(next90.getDate() + 90);

    this.donorInfo.nextEligibleAt = next90;
    this.donorInfo.isEligible = new Date() >= next90;
  }
});

// ─── Methods ────────────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

// ─── Virtuals ───────────────────────────
userSchema.virtual('age').get(function () {
  if (!this.dateOfBirth) return null;
  const diff = Date.now() - this.dateOfBirth.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
});

userSchema.virtual('canDonate').get(function () {
  if (this.role !== 'donor') return false;
  if (!this.isApproved || !this.isActive) return false;
  if (!this.donorInfo.isEligible) return false;
  if (!this.donorInfo.isDonorAvailable) return false;
  if (this.donorInfo.weight && this.donorInfo.weight < 50) return false;

  const age = this.age;
  if (age < 18 || age > 65) return false;

  const now = new Date();
  if (this.donorInfo.nextEligibleAt && new Date(this.donorInfo.nextEligibleAt) > now) {
    return false;
  }
  if (this.donorInfo.lastDonatedAt) {
    const eligibleAfter = new Date(this.donorInfo.lastDonatedAt);
    eligibleAfter.setDate(eligibleAfter.getDate() + 90);
    if (eligibleAfter > now) return false;
  }

  return true;
});

// ─── Clean response ─────────────────────
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (doc, ret) {
    delete ret.password;
    delete ret.otp;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);