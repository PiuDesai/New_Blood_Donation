const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    // 🔹 Get token
    const authHeader = req.headers.authorization;
    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] authorization header:", authHeader);
    }

    if (!authHeader) {
      return res.status(401).json({
        message: "No token provided"
      });
    }

    // 🔹 Check format
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Invalid token format"
      });
    }

    const token = authHeader.split(" ")[1];

    // 🔹 Verify
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET is not configured" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (process.env.NODE_ENV !== "production") {
      console.log("[auth] decoded token:", decoded);
    }

    req.user = decoded;

    next(); // ✅ MUST

  } catch (error) {
    console.log("AUTH ERROR:", error.message);

    // ❌ DO NOT USE next(error) here for now
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = auth;