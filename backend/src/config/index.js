// Centralised runtime configuration pulled from the environment.
require('dotenv').config();

const path = require('path');

const required = (name, fallback) => {
  const v = process.env[name] ?? fallback;
  if (v === undefined || v === '') {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
};

module.exports = {
  port: parseInt(process.env.PORT || '4000', 10),
  env: process.env.NODE_ENV || 'development',

  dbPath: path.resolve(process.cwd(), process.env.DB_PATH || './data/wheelians.db'),
  uploadDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR || './uploads'),
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '10', 10),

  jwtSecret: required('JWT_SECRET', 'dev-secret-do-not-use-in-production-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  corsOrigin: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@wheelians.co.ke',
    password: process.env.ADMIN_PASSWORD || 'admin1234',
    name: process.env.ADMIN_NAME || 'Wheelians Admin',
  },

  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || 'Wheelians <no-reply@wheelians.co.ke>',
    notifyEmail: process.env.NOTIFY_EMAIL || '',
    enabled: !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS),
  },
};
