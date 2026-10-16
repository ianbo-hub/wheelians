// Enquiries: public create; staff list/update.
const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const { notifyAdmin } = require('../utils/email');

const router = express.Router();

const schema = z.object({
  name:    z.string().min(2).max(80),
  email:   z.string().email(),
  phone:   z.string().min(7).max(32).optional().nullable(),
  subject: z.string().max(120).optional().nullable(),
  message: z.string().min(5).max(4000),
  car_id:  z.number().int().positive().optional().nullable(),
  source:  z.enum(['contact-form','contact_form','car-enquiry','car_enquiry','finance','callback','test-drive','test_drive']).default('contact-form'),
});

router.post('/', async (req, res, next) => {
  try {
    const data = schema.parse(req.body);
    const result = db.prepare(`
      INSERT INTO enquiries (name, email, phone, subject, message, car_id, source)
      VALUES (@name, @email, @phone, @subject, @message, @car_id, @source)
    `).run({
      ...data,
      phone: data.phone || null,
      subject: data.subject || null,
      car_id: data.car_id || null,
    });

    const row = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(result.lastInsertRowid);

    // Fire-and-forget email notification
    notifyAdmin(
      `New ${data.source} enquiry from ${data.name}`,
      `Name:    ${data.name}\nEmail:   ${data.email}\nPhone:   ${data.phone || '—'}\nSubject: ${data.subject || '—'}\nCar ID:  ${data.car_id || '—'}\n\n${data.message}`
    ).catch(() => {});

    res.status(201).json({ id: row.id, created_at: row.created_at });
  } catch (err) { next(err); }
});

// ─── Staff: list ─────────────────────────────────────────────────
router.get('/', requireRole('admin', 'sales_rep'), (req, res) => {
  const where = [];
  const params = {};

  if (req.query.status)  { where.push('status = @status');  params.status = req.query.status; }
  if (req.query.source)  { where.push('source = @source');  params.source = req.query.source; }
  if (req.query.car_id)  { where.push('car_id = @car_id');  params.car_id = parseInt(req.query.car_id, 10); }
  if (req.query.q) {
    where.push('(name LIKE @q OR email LIKE @q OR message LIKE @q)');
    params.q = `%${req.query.q}%`;
  }

  const limit  = Math.min(200, parseInt(req.query.limit  || '50', 10));
  const page   = Math.max(1,  parseInt(req.query.page    || '1',  10));
  const offset = (page - 1) * limit;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM enquiries ${whereSql}`).get(params).c;
  const rows = db.prepare(
    `SELECT * FROM enquiries ${whereSql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  ).all(params);

  res.json({ data: rows, page, limit, total, total_pages: Math.ceil(total / limit) });
});

router.get('/:id', requireRole('admin', 'sales_rep'), (req, res) => {
  const row = db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Enquiry not found' });
  res.json(row);
});

const updateSchema = z.object({
  status: z.enum(['new','contacted','in_progress','closed','spam']).optional(),
  assigned_to: z.number().int().positive().nullable().optional(),
  internal_notes: z.string().max(4000).optional(),
});

router.patch('/:id', requireRole('admin', 'sales_rep'), (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const existing = db.prepare('SELECT id FROM enquiries WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Enquiry not found' });

    const sets = Object.keys(data).map(k => `${k} = @${k}`);
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    db.prepare(`UPDATE enquiries SET ${sets.join(', ')} WHERE id = @id`)
      .run({ ...data, id: parseInt(req.params.id, 10) });

    res.json(db.prepare('SELECT * FROM enquiries WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

module.exports = router;
