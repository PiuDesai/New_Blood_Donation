const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Database = require("./config/db");

const userRoutes = require("./routes/UserRoute.js");
const adminRoutes = require("./routes/AdminRoute.js");
const analyzeRoutes = require("./routes/analyzeRoutes");
const bloodTestRoutes = require("./routes/BloodTestRoute.js");
const notificationRoutes = require("./routes/NotificationRoute.js");
const statsRoutes = require("./routes/StatsRoute.js");
const bloodBankRoutes = require("./routes/bloodBankRoutes.js");
const campRoutes = require("./routes/campRoutes.js");
const bloodRequestRoutes = require("./routes/BloodRequestRoute.js");
const gamificationRoutes = require("./routes/GamificationRoute.js");

const app = express();
const PORT = process.env.PORT || 5000;

// ───── Middleware ─────
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONT_URL,
  "https://your-frontend-domain.vercel.app" // User should update this in Render env vars
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' })); // Increased limit for profile photos

// Request Logger (only in dev)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`[${req.method}] ${req.originalUrl}`);
    next();
  });
}



// ───── Database ─────
Database();

// ───── Root Route ─────
app.get("/", (req, res) => {
  res.send("Blood Donation Server is running!");
});

// ───── Routes ─────
app.use("/api", userRoutes); // ✅ MOUNT AT /api
app.use("/api/admin", adminRoutes);
app.use("/api/bloodbank", bloodBankRoutes);
app.use("/api/camps", campRoutes);
app.use("/api/requests", bloodRequestRoutes);
app.use("/api/report", analyzeRoutes);
app.use("/api", bloodTestRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api", statsRoutes);


// ───── 404 Handler (Optional but Recommended) ─────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found"
  });
});

// ───── Global Error Handler ─────
app.use((err, req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error("GLOBAL ERROR:", err.stack);
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// ───── Start Server ─────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});