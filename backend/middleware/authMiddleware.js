const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // Get token
    const authHeader = req.headers.authorization;
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] authorization header:", authHeader);
    }

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    //Check format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format"
      });
    }

    const token = authHeader.split(" ")[1];

    //Verify
    const secret = process.env.JWT_SECRET || 'secret';

    const decoded = jwt.verify(token, secret);

    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] decoded token:", decoded);
    }

    // Standardize: ensure role is lowercase if present
    if (decoded.role) {
      decoded.role = String(decoded.role).toLowerCase();
    }

    req.user = decoded;

    next(); 

  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log("AUTH ERROR:", error.message);
    }

    
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = auth;