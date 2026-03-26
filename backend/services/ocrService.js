const Tesseract = require("tesseract.js");

exports.extractText = async (filePath) => {
  try {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: m => console.log(m) // optional (shows progress)
    });

    return result.data.text;

  } catch (error) {
    console.error("OCR Error:", error);
    return "Could not extract text";
  }
};