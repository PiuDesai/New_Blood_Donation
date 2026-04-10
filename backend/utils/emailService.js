const nodemailer = require("nodemailer");

function hasSmtpConfig() {
  return (
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );
}

let cachedTransport = null;

function getTransport() {
  if (cachedTransport) return cachedTransport;
  if (!hasSmtpConfig()) return null;

  const smtpPass = String(process.env.SMTP_PASS || "").replace(/\s/g, "");
  const isGmail = String(process.env.SMTP_HOST || "").toLowerCase().includes("gmail");

  const config = isGmail 
    ? {
        service: 'gmail',
        auth: {
          user: process.env.SMTP_USER,
          pass: smtpPass,
        }
      }
    : {
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: String(process.env.SMTP_SECURE || "").toLowerCase() === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false
        }
      };

  cachedTransport = nodemailer.createTransport(config);

  return cachedTransport;
}

function fromAddress() {
  return process.env.EMAIL_FROM || process.env.SMTP_USER;
}

async function sendEmail({ to, subject, text, html }) {
  const transport = getTransport();
  if (!transport) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[email] SMTP not configured; skipping email:", subject);
    }
    return { skipped: true };
  }

  if (!to) return { skipped: true };
  try {
    const info = await transport.sendMail({
      from: fromAddress(),
      to,
      subject,
      text,
      html,
    });
    return { ok: true, messageId: info.messageId };
  } catch (err) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[email] send failed:", err.message);
    }
    return { ok: false, error: err.message };
  }
}

async function sendBulkEmail(recipients, { subject, text, html }, { max = 50 } = {}) {
  const list = (recipients || [])
    .map((r) => (typeof r === "string" ? r.trim() : ""))
    .filter(Boolean)
    .slice(0, max);

  for (const to of list) {
    // Intentionally sequential to avoid SMTP throttling issues.
    // This keeps the feature robust even on free SMTP providers.
    // We do not throw if one address fails.
    // eslint-disable-next-line no-await-in-loop
    await sendEmail({ to, subject, text, html });
  }
}

module.exports = {
  sendEmail,
  sendBulkEmail,
};

