// middlewares/roleCheck.js

module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    // req.user must be set by auth middleware (e.g., JWT)
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Access denied' });
    }

    next();
  };
};