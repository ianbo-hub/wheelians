// Test-drive bookings: public create, staff list/update.
const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const { notifyAdmin } = require('../utils/email');

const router = express.Router();

const schema = z.object({
  car_id:   z.number().int().positive(),
  name:     z.string().min(2).max(80),
  email:    z.string().email(),
  phone:    z.string().min(7).max(32),
  preferred_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  preferred_time: z.string().max(20).optional().nullable(),
  location: z.string().max(60).optional().nullable(),
});

router.post('/', (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const car = db.prepare('SELECT make, model FROM cars WHERE id = ?').get(data.car_id);
    if (!car) return res.status(404).json({ error: 'Car not found' });

    const result = db.prepare(`
      INSERT INTO test_drives (car_id, name, email, phone, preferred_date, preferred_time, location)
      VALUES (@car_id, @name, @email, @phone, @preferred_date, @preferred_time, @location)
    `).run({ ...data, preferred_time: data.preferred_time || null, location: data.location || null });

    notifyAdmin(
      `Test drive requested: ${car.make} ${car.model}`,
      `Date: ${data.preferred_date} ${data.preferred_time || ''}\nLocation: ${data.location || 'any'}\n${data.name} — ${data.email} / ${data.phone}`
    ).catch(() => {});

    res.status(201).json({ id: result.lastInsertRowid });
  } catch (err) { next(err); }
});

router.get('/', requireRole('admin', 'sales_rep'), (req, res) => {
  const where = [];
  const params = {};
  if (req.query.status) { where.push('status = @status'); params.status = req.query.status; }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT t.*, c.make, c.model, c.year
    FROM test_drives t
    LEFT JOIN cars c ON c.id = t.car_id
    ${whereSql}
    ORDER BY t.preferred_date ASC, t.created_at DESC
  `).all(params);
  res.json({ data: rows });
});

router.patch('/:id', requireRole('admin', 'sales_rep'), (req, res, next) => {
  try {
    const data = z.object({
      status: z.enum(['pending','confirmed','completed','cancelled','no_show']).optional(),
      internal_notes: z.string().max(4000).optional(),
    }).parse(req.body);

    const existing = db.prepare('SELECT id FROM test_drives WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Booking not found' });

    const sets = Object.keys(data).map(k => `${k} = @${k}`);
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    db.prepare(`UPDATE test_drives SET ${sets.join(', ')} WHERE id = @id`)
      .run({ ...data, id: parseInt(req.params.id, 10) });
    res.json(db.prepare('SELECT * FROM test_drives WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

module.exports = router;
