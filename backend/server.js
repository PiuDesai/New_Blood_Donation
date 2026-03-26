const express = require("express");
const cors = require("cors");
require("dotenv").config();

const Database = require("./config/db");

const userRoutes = require("./routes/UserRoute.js");
const adminRoutes = require("./routes/AdminRoute.js"); // ✅ NEW

const app = express();
const PORT = process.env.PORT || 5000;

// ───── Middleware ─────
app.use(cors());
app.use(express.json());

// ───── Database ─────
Database();

// ───── Root Route ─────
app.get("/", (req, res) => {
  res.send("Blood Donation Server is running!");
});

// ───── Routes ─────
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes); // ✅ ADD THIS

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