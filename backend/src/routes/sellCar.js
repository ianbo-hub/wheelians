// Sell-your-car submissions: public create + staff admin.
const express = require('express');
const path = require('path');
const { z } = require('zod');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const { sellCarImages } = require('../middleware/upload');
const { notifyAdmin } = require('../utils/email');

const router = express.Router();

const schema = z.object({
  owner_name:  z.string().min(2).max(80),
  owner_email: z.string().email(),
  owner_phone: z.string().min(7).max(32),
  make:        z.string().min(1).max(60),
  model:       z.string().min(1).max(80),
  year:        z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1),
  km:          z.coerce.number().int().min(0),
  condition:   z.string().max(60).optional().nullable(),
  asking_price: z.coerce.number().int().positive().optional().nullable(),
  notes:       z.string().max(4000).optional().nullable(),
});

// Create with optional image uploads (multipart/form-data OK)
router.post(
  '/',
  sellCarImages.array('images', 8),
  async (req, res, next) => {
    try {
      const data = schema.parse(req.body);
      const result = db.prepare(`
        INSERT INTO sell_submissions
          (owner_name, owner_email, owner_phone, make, model, year, km, condition, asking_price, notes)
        VALUES (@owner_name, @owner_email, @owner_phone, @make, @model, @year, @km, @condition, @asking_price, @notes)
      `).run({
        ...data,
        condition: data.condition || null,
        asking_price: data.asking_price || null,
        notes: data.notes || null,
      });

      const subId = result.lastInsertRowid;

      if (req.files && req.files.length > 0) {
        const insertImg = db.prepare('INSERT INTO sell_submission_images (submission_id, path) VALUES (?, ?)');
        for (const f of req.files) {
          const rel = path.relative(process.cwd(), f.path).replace(/\\/g, '/');
          insertImg.run(subId, rel);
        }
      }

      notifyAdmin(
        `Sell-car submission from ${data.owner_name}`,
        `${data.year} ${data.make} ${data.model}\n${data.km} km\nCondition: ${data.condition || '—'}\nAsking: ${data.asking_price ? 'KES ' + data.asking_price.toLocaleString() : '—'}\n\nContact: ${data.owner_email} / ${data.owner_phone}\n\n${data.notes || ''}`
      ).catch(() => {});

      res.status(201).json({ id: subId });
    } catch (err) { next(err); }
  }
);

// ─── Staff ───────────────────────────────────────────────────────
router.get('/', requireRole('admin', 'sales_rep'), (req, res) => {
  const where = [];
  const params = {};
  if (req.query.status) { where.push('status = @status'); params.status = req.query.status; }

  const limit  = Math.min(200, parseInt(req.query.limit || '50', 10));
  const page   = Math.max(1,  parseInt(req.query.page || '1', 10));
  const offset = (page - 1) * limit;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM sell_submissions ${whereSql}`).get(params).c;
  const rows = db.prepare(
    `SELECT * FROM sell_submissions ${whereSql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  ).all(params);
  res.json({ data: rows, page, limit, total, total_pages: Math.ceil(total/limit) });
});

router.get('/:id', requireRole('admin', 'sales_rep'), (req, res) => {
  const row = db.prepare('SELECT * FROM sell_submissions WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Submission not found' });
  const images = db.prepare('SELECT id, path FROM sell_submission_images WHERE submission_id = ?').all(row.id);
  res.json({ ...row, images });
});

const updateSchema = z.object({
  status: z.enum(['pending','reviewing','offer_made','accepted','rejected','withdrawn']).optional(),
  our_offer_kes: z.number().int().positive().nullable().optional(),
  internal_notes: z.string().max(4000).optional(),
});

router.patch('/:id', requireRole('admin', 'sales_rep'), (req, res, next) => {
  try {
    const data = updateSchema.parse(req.body);
    const existing = db.prepare('SELECT id FROM sell_submissions WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Submission not found' });

    const sets = Object.keys(data).map(k => `${k} = @${k}`);
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    db.prepare(`UPDATE sell_submissions SET ${sets.join(', ')} WHERE id = @id`)
      .run({ ...data, id: parseInt(req.params.id, 10) });

    res.json(db.prepare('SELECT * FROM sell_submissions WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

module.exports = router;
