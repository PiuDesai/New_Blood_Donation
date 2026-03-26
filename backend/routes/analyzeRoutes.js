const express = require("express");
const multer = require("multer");
const { analyzeReport } = require("../controller/analyzeController");

const router = express.Router();

// Configure multer to store files in "uploads/" folder
const upload = multer({ dest: "uploads/" });

// Accept single file with field name "report"
router.post("/analyze", upload.single("report"), analyzeReport);

module.exports = router;