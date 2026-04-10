const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: String(process.env.SMTP_PASS || "").replace(/\s/g, ""),
  },
});

module.exports = transporter;