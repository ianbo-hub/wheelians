// Thin wrapper around nodemailer. Safe no-op when SMTP is not configured.
const nodemailer = require('nodemailer');
const config = require('../config');

let transporter = null;
if (config.smtp.enabled) {
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.port === 465,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  });
}

async function send({ to, subject, text, html }) {
  if (!transporter) {
    console.log(`[email:disabled] would send to ${to}: ${subject}`);
    return { skipped: true };
  }
  try {
    const info = await transporter.sendMail({
      from: config.smtp.from, to, subject, text, html,
    });
    return { messageId: info.messageId };
  } catch (err) {
    console.error('[email:error]', err.message);
    return { error: err.message };
  }
}

async function notifyAdmin(subject, body) {
  if (!config.smtp.notifyEmail) return { skipped: true };
  return send({
    to: config.smtp.notifyEmail,
    subject: `[Wheelians] ${subject}`,
    text: body,
    html: `<pre style="font-family:system-ui;white-space:pre-wrap">${
      body.replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c]))
    }</pre>`,
  });
}

module.exports = { send, notifyAdmin };
