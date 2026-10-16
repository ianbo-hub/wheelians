// Auth: register (customer only), login, me.
const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const db = require('../db');
const { signToken, requireAuth } = require('../middleware/auth');

const router = express.Router();

const registerSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8).max(128),
  name:     z.string().min(2).max(80),
  phone:    z.string().min(7).max(32).optional(),
});

const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1).max(128),
});

router.post('/register', (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(data.password, 10);
    const result = db.prepare(
      `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES (?, ?, ?, ?, 'customer')`
    ).run(data.email, hash, data.name, data.phone || null);

    const user = db.prepare('SELECT id, email, name, role FROM users WHERE id = ?').get(result.lastInsertRowid);
    const token = signToken(user);
    res.status(201).json({ user, token });
  } catch (err) { next(err); }
});

router.post('/login', (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const row = db.prepare('SELECT id, email, name, role, password_hash FROM users WHERE email = ?').get(data.email);
    if (!row || !bcrypt.compareSync(data.password, row.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const user = { id: row.id, email: row.email, name: row.name, role: row.role };
    const token = signToken(user);
    res.json({ user, token });
  } catch (err) { next(err); }
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
