/** Whole-blood style interval between donations (days). */
const COOLDOWN_DAYS = 90;

/**
 * @param {import('mongoose').Document} userDoc - User with role donor and donorInfo
 * @returns {{ canDonateBlood: boolean, nextEligibleAt?: Date, daysRemaining?: number }}
 */
function getDonorCooldownStatus(userDoc) {
  if (!userDoc || userDoc.role !== "donor") {
    return { canDonateBlood: false };
  }
  const now = new Date();
  let next = null;
  if (userDoc.donorInfo?.nextEligibleAt) {
    const n = new Date(userDoc.donorInfo.nextEligibleAt);
    if (!isNaN(n.getTime())) next = n;
  }
  if (!next && userDoc.donorInfo?.lastDonatedAt) {
    const last = new Date(userDoc.donorInfo.lastDonatedAt);
    if (!isNaN(last.getTime())) {
      next = new Date(last);
      next.setDate(next.getDate() + COOLDOWN_DAYS);
    }
  }
  if (next && next > now) {
    const daysRemaining = Math.max(1, Math.ceil((next - now) / 86400000));
    return { canDonateBlood: false, nextEligibleAt: next, daysRemaining };
  }
  return { canDonateBlood: true };
}

function applyCooldownAfterDonation(user) {
  const now = new Date();
  if (!user.donorInfo) user.donorInfo = {};
  user.donorInfo.lastDonatedAt = now;
  const next = new Date(now);
  next.setDate(next.getDate() + COOLDOWN_DAYS);
  user.donorInfo.nextEligibleAt = next;
}

module.exports = {
  COOLDOWN_DAYS,
  getDonorCooldownStatus,
  applyCooldownAfterDonation,
};
