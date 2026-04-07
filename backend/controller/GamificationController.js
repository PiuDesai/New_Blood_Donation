const User = require('../models/UserModel.js');
const Reward = require('../models/RewardModel.js');
const Claim = require('../models/ClaimModel.js');
const sendNotification = require('../utils/sendNotification.js');

// ── Get Leaderboard ─────────────────────────────────────────────
const getLeaderboard = async (req, res, next) => {
  try {
    const topDonors = await User.find({ role: 'donor' })
      .select('name points donorInfo.donationCount badges rating reviews')
      .sort({ points: -1 })
      .limit(20);

    res.json(topDonors);
  } catch (err) {
    next(err);
  }
};

const BloodRequest = require('../models/BloodRequestModel.js');

// ── Rate Donor ────────────────────────────────────────────────
const rateDonor = async (req, res, next) => {
  try {
    const { donorId, rating, comment, requestId } = req.body;
    const patientId = req.user.id;

    if (!donorId || !rating) {
      return res.status(400).json({ message: 'Donor ID and rating are required' });
    }

    const donor = await User.findById(donorId);
    if (!donor) return res.status(404).json({ message: 'Donor not found' });

    // Push new review
    donor.reviews.push({
      patientId,
      rating: Number(rating),
      comment
    });

    // Calculate average rating
    const totalRating = donor.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    donor.rating = totalRating / donor.reviews.length;

    await donor.save();

    // Mark request as rated if requestId provided
    if (requestId) {
      await BloodRequest.findByIdAndUpdate(requestId, { isRated: true });
    }

    res.json({
      message: 'Rating submitted successfully',
      rating: donor.rating,
      reviewCount: donor.reviews.length
    });

  } catch (err) {
    next(err);
  }
};

// ── Get Rewards ────────────────────────────────────────────────
const getRewards = async (req, res, next) => {
  try {
    const rewards = await Reward.find({ isActive: true }).sort({ requiredPoints: 1 });
    res.json(rewards);
  } catch (err) {
    next(err);
  }
};

// ── Claim Reward ───────────────────────────────────────────────
const claimReward = async (req, res, next) => {
  try {
    const { rewardId } = req.body;
    const user = await User.findById(req.user.id);
    const reward = await Reward.findById(rewardId);

    if (!reward || !reward.isActive) {
      return res.status(404).json({ message: 'Reward not found or inactive' });
    }

    if (user.points < reward.requiredPoints) {
      return res.status(400).json({ message: 'Insufficient points' });
    }

    // Deduct points
    user.points -= reward.requiredPoints;
    await user.save();

    // Create claim
    const claim = await Claim.create({
      user: user._id,
      reward: reward._id,
      status: 'pending'
    });

    // Notify Blood Banks (if applicable) or Admin
    const bloodBanks = await User.find({ role: 'bloodbank', isActive: true }).select('_id fcmToken');
    const ids = bloodBanks.map((b) => b._id);
    const tokens = bloodBanks.map((b) => b.fcmToken).filter((t) => typeof t === 'string' && t.length > 0);

    try {
      await sendNotification(tokens, ids, {
        title: '🎁 Reward Claimed',
        body: `${user.name} has claimed the reward: ${reward.title}.`,
        type: 'general',
        data: { claimId: claim._id.toString() }
      });
    } catch (notifErr) {
      console.error('Notification Error:', notifErr.message);
    }

    res.json({ message: 'Reward claimed successfully', claim, remainingPoints: user.points });
  } catch (err) {
    next(err);
  }
};

// ── Get My Rewards/Claims ──────────────────────────────────────
const getMyRewards = async (req, res, next) => {
  try {
    const claims = await Claim.find({ user: req.user.id })
      .populate('reward')
      .sort({ createdAt: -1 });

    res.json(claims);
  } catch (err) {
    next(err);
  }
};

// ── Utility: Update Points (Internal) ─────────────────────────
// This would be called from the donation recording logic
const addPointsForDonation = async (userId, pointsToAdd = 50) => {
  const user = await User.findById(userId);
  if (!user) return;

  user.points += pointsToAdd;
  user.donorInfo.donationCount += 1;

  // Badge Logic
  const count = user.donorInfo.donationCount;
  let newBadge = null;
  if (count === 5) newBadge = { name: 'Bronze Donor', icon: '🥉' };
  if (count === 10) newBadge = { name: 'Silver Donor', icon: '🥈' };
  if (count === 20) newBadge = { name: 'Gold Donor', icon: '🥇' };

    if (newBadge) {
      user.badges.push({ ...newBadge, awardedAt: new Date() });

      try {
        await sendNotification(
          user.fcmToken ? [user.fcmToken] : [],
          [user._id],
          {
            title: '🎉 New Badge Earned!',
            body: `Congratulations! You've earned the ${newBadge.name} badge.`,
            type: 'general'
          }
        );
      } catch (notifErr) {
        console.error('Notification Error:', notifErr.message);
      }
    }

  await user.save();
};

module.exports = {
  getLeaderboard,
  getRewards,
  claimReward,
  getMyRewards,
  addPointsForDonation,
  rateDonor
};
