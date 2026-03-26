const extractText = require("../utils/extractText");
const { analyzeWithAI } = require("../services/groqService");

exports.analyzeReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Extract text from uploaded file
    const text = await extractText(req.file.path, req.file.mimetype);
    console.log("📄 Extracted Text:", text);

    // Limit text length for AI speed
    const cleanedText = text.slice(0, 1500);

    // Send text to AI
    const result = await analyzeWithAI(cleanedText);

    res.json({
      extractedText: text,
      result,
    });
  } catch (error) {
    console.error("Controller Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};