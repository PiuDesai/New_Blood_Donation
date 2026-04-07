const express = require("express");
const multer = require("multer");
const { analyzeReport } = require("../controller/analyzeController");

const router = express.Router();

// store in uploads folder
const upload = multer({ dest: "uploads/" });

router.post("/analyze", upload.single("report"), analyzeReport);

module.exports = router;