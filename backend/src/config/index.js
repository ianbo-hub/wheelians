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

  dbPath: path.resolve(process.env.DB_PATH || path.join(__dirname, '../../data/wheelians.db')),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads')),
  maxUploadMb: parseInt(process.env.MAX_UPLOAD_MB || '10', 10),

  jwtSecret: (() => {
    const s = process.env.JWT_SECRET;
    if (!s || s === 'dev-secret-do-not-use-in-production-change-me') {
      if (process.env.NODE_ENV === 'production') {
        throw new Error('JWT_SECRET must be set in production — generate one with: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"');
      }
      console.warn('⚠  Using insecure default JWT_SECRET — set JWT_SECRET env var for production');
      return 'dev-secret-do-not-use-in-production-change-me';
    }
    return s;
  })(),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  corsOrigin: (process.env.CORS_ORIGIN || '*')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@wheelians.co.ke',
    password: (() => {
      const p = process.env.ADMIN_PASSWORD;
      if (!p || p === 'admin1234' || p === 'change-this-after-deploy') {
        if (process.env.NODE_ENV === 'production') {
          console.warn('⚠  Using weak default admin password — set ADMIN_PASSWORD env var');
        }
        return p || 'admin1234';
      }
      return p;
    })(),
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
