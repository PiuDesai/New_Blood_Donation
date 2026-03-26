const express = require("express");
const Database = require('./config/db');
const cors = require("cors");

const userRoutes = require("./routes/UserRoute.js");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// DB
Database();

// Root route
app.get("/", (req, res) => {
  res.send("Blood Donation Server is running!");
});

// Routes
app.use("/api/users", userRoutes);

// ✅ ONLY ONE error handler (VERY IMPORTANT)
app.use((err, req, res, next) => {
  console.log("GLOBAL ERROR:", err);

  res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});