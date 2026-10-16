// JWT auth + role gating.
const jwt = require('jsonwebtoken');
const config = require('../config');
const db = require('../db');

const findUser = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?');

function signToken(user) {
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );
}

// Attach req.user if a valid bearer token is present. Does not reject.
function optionalAuth(req, _res, next) {
  const header = req.headers.authorization || '';
  const m = header.match(/^Bearer\s+(.+)$/i);
  if (!m) return next();
  try {
    const payload = jwt.verify(m[1], config.jwtSecret);
    const user = findUser.get(payload.sub);
    if (user) req.user = user;
  } catch (_) { /* ignore */ }
  next();
}

// Require a valid user.
function requireAuth(req, res, next) {
  optionalAuth(req, res, () => {
    if (!req.user) return res.status(401).json({ error: 'Authentication required' });
    next();
  });
}

// Require one of the given roles.
function requireRole(...roles) {
  return (req, res, next) => requireAuth(req, res, () => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  });
}

module.exports = { signToken, optionalAuth, requireAuth, requireRole };
