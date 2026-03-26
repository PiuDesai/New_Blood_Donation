// utils/extractText.js
const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

async function extractText(filePath, mimetype) {
  try {
    // 📄 If PDF
    if (mimetype === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);

      if (data.text && data.text.trim().length > 0) {
        return data.text;
      } else {
        // PDF might be scanned → OCR
        const result = await Tesseract.recognize(filePath, "eng");
        return result.data.text;
      }
    }

    // 🖼️ If Image
    if (mimetype.startsWith("image/")) {
      const result = await Tesseract.recognize(filePath, "eng");
      return result.data.text;
    }

    // 📄 If plain text
    if (mimetype.startsWith("text/")) {
      return fs.readFileSync(filePath, "utf-8");
    }

    return "Cannot extract text from this file type";
  } catch (err) {
    console.error("❌ extractText Error:", err);
    return "Could not extract text from file";
  }
}

module.exports = extractText;