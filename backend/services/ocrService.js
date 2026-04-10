const Tesseract = require("tesseract.js");

exports.extractText = async (filePath) => {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: m => {
        if (process.env.NODE_ENV !== "production") console.log(m);
      }
    });

    return result.data.text;

  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error("OCR Error:", error);
    return "Could not extract text";
  }
};