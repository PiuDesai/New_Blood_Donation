const extractText = require("../utils/extractText");
const { analyzeWithAI } = require("../services/groqService");
const fs = require("fs");

exports.analyzeReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Extract text
    const text = await extractText(req.file.path, req.file.mimetype);

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        message: "Could not extract meaningful text",
      });
    }

    // Clean text (important)
    const cleanedText = text
      .replace(/\s+/g, " ")
      .replace(/[^\x00-\x7F]/g, "")
      .slice(0, 1500);

    // AI analysis
    const result = await analyzeWithAI(cleanedText);

    // Delete uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      result,
    });

  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};