/**
 * Require JWT payload role to be one of allowed roles (exact match, lowercase).
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  const role = req.user?.role;
  const normalized = allowedRoles.map((r) => String(r).toLowerCase());
  if (!role || !normalized.includes(String(role).toLowerCase())) {
    return res.status(403).json({ message: "Access denied for this role" });
  }
  next();
};

module.exports = { requireRole };
