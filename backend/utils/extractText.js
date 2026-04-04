const fs = require("fs");
const pdfParse = require("pdf-parse");
const Tesseract = require("tesseract.js");

async function extractText(filePath, mimetype) {
  try {
    // PDF
    if (mimetype === "application/pdf") {
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);

      if (data.text && data.text.trim().length > 20) {
        return data.text;
      }

      // OCR fallback
      const result = await Tesseract.recognize(filePath, "eng");
      return result.data.text;
    }

    // Image OCR
    if (mimetype.startsWith("image/")) {
      const result = await Tesseract.recognize(filePath, "eng");
      return result.data.text;
    }

    // Text file
    if (mimetype.startsWith("text/")) {
      return fs.readFileSync(filePath, "utf-8");
    }

    return "";

  } catch (err) {
    console.error("Extract Error:", err);
    return "";
  }
}

module.exports = extractText;