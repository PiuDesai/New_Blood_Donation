const mongoose = require('mongoose');

const rewardSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    requiredPoints: {
      type: Number,
      required: true,
      min: 0
    },
    type: {
      type: String,
      enum: ['test', 'discount', 'priority', 'merchandise'],
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Reward', rewardSchema);
