// Entry point. Composes middleware + routes and starts the HTTP server.
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

const config = require('./config');
require('./db');  // ensure DB is open and PRAGMAs applied

// Apply schema on every startup (idempotent — CREATE TABLE IF NOT EXISTS).
require('./db/init');

const { optionalAuth } = require('./middleware/auth');
const { notFound, errorHandler } = require('./middleware/errors');

const authRoutes       = require('./routes/auth');
const carRoutes        = require('./routes/cars');
const enquiryRoutes    = require('./routes/enquiries');
const sellCarRoutes    = require('./routes/sellCar');
const financeRoutes    = require('./routes/finance');
const testDriveRoutes  = require('./routes/testDrives');
const adminRoutes      = require('./routes/admin');

const app = express();
app.disable('x-powered-by');
if (config.env === 'production') app.set('trust proxy', 1);

// ─── Middleware ────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Serve static files FIRST — before CORS, body-parsing, or auth
// Uploaded images
app.use('/uploads', express.static(path.resolve(process.cwd(), config.uploadDir), {
  maxAge: '30d',
  fallthrough: true,
}));

// React build (frontend-react/dist) or legacy frontend/
const reactDistDir = path.resolve(__dirname, '../../frontend-react/dist');
const legacyFrontendDir = path.resolve(__dirname, '../../frontend');
const frontendDir = fs.existsSync(reactDistDir) ? reactDistDir : legacyFrontendDir;
if (fs.existsSync(frontendDir)) {
  app.use(express.static(frontendDir, { maxAge: '1h' }));
}

// CORS — only matters for API calls, static files already served above
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || config.corsOrigin.includes('*') || config.corsOrigin.includes(origin)) {
      return cb(null, true);
    }
    cb(null, false); // deny CORS headers but don't crash the request
  },
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(optionalAuth);

// Rate limit the write-y public endpoints
const publicWriteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later' },
  skipSuccessfulRequests: true,
});

// ─── Routes ────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.use('/api/auth/login',    loginLimiter);
app.use('/api/auth/register', publicWriteLimiter);
app.use('/api/auth',          authRoutes);

app.use('/api/cars', carRoutes);

// Public writes to enquiries / sell-car / finance / test-drives rate-limited
app.use('/api/enquiries',    (req, _res, next) => req.method === 'POST' ? publicWriteLimiter(req, _res, next) : next(), enquiryRoutes);
app.use('/api/sell-car',     (req, _res, next) => req.method === 'POST' ? publicWriteLimiter(req, _res, next) : next(), sellCarRoutes);
app.use('/api/finance',      (req, _res, next) => req.method === 'POST' ? publicWriteLimiter(req, _res, next) : next(), financeRoutes);
app.use('/api/test-drives',  (req, _res, next) => req.method === 'POST' ? publicWriteLimiter(req, _res, next) : next(), testDriveRoutes);

app.use('/api/admin',        adminRoutes);

// SPA/MPA fallback — serve index.html for frontend routes that aren't /api/*
app.get(/^\/(?!api|uploads|assets)/, (_req, res, next) => {
  const idx = path.join(frontendDir, 'index.html');
  if (fs.existsSync(idx)) return res.sendFile(idx);
  next();
});

app.use(notFound);
app.use(errorHandler);

// ─── Start ─────────────────────────────────────────────────────────
if (require.main === module) {
  app.listen(config.port, () => {
    console.log(`\n  Wheelians API ready — http://localhost:${config.port}`);
    console.log(`  Frontend: ${fs.existsSync(reactDistDir) ? 'React build (dist/)' : fs.existsSync(legacyFrontendDir) ? 'legacy (frontend/)' : '(not bundled — serve separately)'}`);
    console.log(`  Env:      ${config.env}\n`);
  });
}

module.exports = app;
