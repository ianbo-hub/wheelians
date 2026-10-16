// Admin-only: user management + dashboard stats.
const express = require('express');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const db = require('../db');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// Dashboard summary
router.get('/stats', requireRole('admin', 'sales_rep'), (_req, res) => {
  const q = (sql) => db.prepare(sql).get().c;
  res.json({
    cars_total:          q('SELECT COUNT(*) AS c FROM cars'),
    cars_available:      q('SELECT COUNT(*) AS c FROM cars WHERE sold = 0'),
    cars_sold:           q('SELECT COUNT(*) AS c FROM cars WHERE sold = 1'),
    enquiries_total:     q('SELECT COUNT(*) AS c FROM enquiries'),
    enquiries_new:       q(`SELECT COUNT(*) AS c FROM enquiries WHERE status = 'new'`),
    sell_submissions:    q('SELECT COUNT(*) AS c FROM sell_submissions'),
    sell_pending:        q(`SELECT COUNT(*) AS c FROM sell_submissions WHERE status = 'pending'`),
    finance_apps:        q('SELECT COUNT(*) AS c FROM finance_applications'),
    finance_submitted:   q(`SELECT COUNT(*) AS c FROM finance_applications WHERE status = 'submitted'`),
    test_drives_pending: q(`SELECT COUNT(*) AS c FROM test_drives WHERE status = 'pending'`),
    users_total:         q('SELECT COUNT(*) AS c FROM users'),
  });
});

// Recent activity (for dashboard)
router.get('/activity', requireRole('admin', 'sales_rep'), (_req, res) => {
  const recent = (sql, type) => db.prepare(sql).all().map(r => ({ ...r, type }));
  const items = [
    ...recent('SELECT id, name, email, created_at FROM enquiries ORDER BY created_at DESC LIMIT 10', 'enquiry'),
    ...recent('SELECT id, owner_name AS name, owner_email AS email, created_at FROM sell_submissions ORDER BY created_at DESC LIMIT 10', 'sell_submission'),
    ...recent('SELECT id, applicant_name AS name, applicant_email AS email, created_at FROM finance_applications ORDER BY created_at DESC LIMIT 10', 'finance_application'),
    ...recent('SELECT id, name, email, created_at FROM test_drives ORDER BY created_at DESC LIMIT 10', 'test_drive'),
  ];
  items.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ data: items.slice(0, 20) });
});

// Users list (admin)
router.get('/users', requireRole('admin'), (req, res) => {
  const where = [];
  const params = {};
  if (req.query.role) { where.push('role = @role'); params.role = req.query.role; }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db.prepare(
    `SELECT id, email, name, phone, role, created_at FROM users ${whereSql} ORDER BY id DESC`
  ).all(params);
  res.json({ data: rows });
});

// Create staff user (admin)
const createUserSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(8).max(128),
  name:     z.string().min(2).max(80),
  phone:    z.string().min(7).max(32).optional().nullable(),
  role:     z.enum(['customer','sales_rep','admin']).default('sales_rep'),
});

router.post('/users', requireRole('admin'), (req, res, next) => {
  try {
    const data = createUserSchema.parse(req.body);
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(data.email);
    if (existing) return res.status(409).json({ error: 'Email already registered' });

    const hash = bcrypt.hashSync(data.password, 10);
    const r = db.prepare(
      `INSERT INTO users (email, password_hash, name, phone, role)
       VALUES (?, ?, ?, ?, ?)`
    ).run(data.email, hash, data.name, data.phone || null, data.role);

    res.status(201).json(db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(r.lastInsertRowid));
  } catch (err) { next(err); }
});

router.patch('/users/:id', requireRole('admin'), (req, res, next) => {
  try {
    const data = z.object({
      name:  z.string().min(2).max(80).optional(),
      phone: z.string().min(7).max(32).optional(),
      role:  z.enum(['customer','sales_rep','admin']).optional(),
      password: z.string().min(8).max(128).optional(),
    }).parse(req.body);

    const existing = db.prepare('SELECT id FROM users WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'User not found' });

    const sets = [];
    const params = { id: parseInt(req.params.id, 10) };
    if (data.name)  { sets.push('name = @name');   params.name = data.name; }
    if (data.phone) { sets.push('phone = @phone'); params.phone = data.phone; }
    if (data.role)  { sets.push('role = @role');   params.role = data.role; }
    if (data.password) {
      sets.push('password_hash = @ph');
      params.ph = bcrypt.hashSync(data.password, 10);
    }
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    db.prepare(`UPDATE users SET ${sets.join(', ')} WHERE id = @id`).run(params);
    res.json(db.prepare('SELECT id, email, name, phone, role, created_at FROM users WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

router.delete('/users/:id', requireRole('admin'), (req, res) => {
  if (parseInt(req.params.id, 10) === req.user.id) {
    return res.status(400).json({ error: 'Cannot delete your own account' });
  }
  const r = db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'User not found' });
  res.json({ ok: true });
});

// Sales reps (for inventory assignment dropdown)
router.get('/sales-reps', requireRole('admin', 'sales_rep'), (_req, res) => {
  const reps = db.prepare(
    `SELECT id, name, email, phone FROM users WHERE role IN ('sales_rep', 'admin') ORDER BY name`
  ).all();
  res.json({ data: reps });
});

module.exports = router;
