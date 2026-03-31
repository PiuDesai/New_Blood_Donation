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

const app = express();
const PORT = process.env.PORT || 5000;

// ───── Middleware ─────
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

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
app.use("/api", analyzeRoutes);
app.use("/api/bookings", bloodTestRoutes);
app.use("/api/notifications", notificationRoutes);
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
  console.error("GLOBAL ERROR:", err.message);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// ───── Start Server ─────
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});