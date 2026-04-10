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
  "https://new-blood-donation.vercel.app",
  process.env.FRONT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Normalize origin by removing trailing slash
    const normalizedOrigin = origin.replace(/\/$/, "");
    const normalizedAllowed = allowedOrigins.map(o => o.replace(/\/$/, ""));

    if (normalizedAllowed.indexOf(normalizedOrigin) === -1) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`[CORS] Denied origin: ${origin}`);
      }
      return callback(new Error('CORS policy violation'), false);
    }
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.options(/.*/, cors()); // ✅ Updated for path-to-regexp v8+ (Named Wildcard)

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