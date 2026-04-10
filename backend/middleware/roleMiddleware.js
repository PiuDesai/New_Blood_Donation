/**
 * Require JWT payload role to be one of allowed roles (exact match, lowercase).
 */
const requireRole = (...allowedRoles) => (req, res, next) => {
  const userRole = String(req.user?.role || "").toLowerCase();
  const normalizedAllowed = allowedRoles.map((r) => String(r).toLowerCase());
  
  if (process.env.NODE_ENV !== "production") {
    console.log(`[requireRole] Checking Access: User Role="${userRole}", Allowed Roles=${JSON.stringify(normalizedAllowed)}`);
  }

  if (!userRole || !normalizedAllowed.includes(userRole)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(`[requireRole] Access Denied: User Role "${userRole}" not in ${JSON.stringify(normalizedAllowed)}`);
    }
    return res.status(403).json({ 
      success: false,
      message: `Access denied. Role "${userRole}" is not authorized for this action.` 
    });
  }
  next();
};

module.exports = { requireRole };
