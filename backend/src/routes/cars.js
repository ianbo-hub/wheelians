// Public inventory browse + admin CRUD + image upload.
const express = require('express');
const path = require('path');
const fs = require('fs');
const { z } = require('zod');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const { carImages } = require('../middleware/upload');
const config = require('../config');

const router = express.Router();

// ─── Hydrate a car row (parse JSON, attach rep + images) ─────────
const getRep = db.prepare('SELECT id, name, phone, email FROM users WHERE id = ?');
const getImages = db.prepare('SELECT id, path, alt, is_primary, sort_order FROM car_images WHERE car_id = ? ORDER BY is_primary DESC, sort_order ASC, id ASC');

function hydrate(row) {
  if (!row) return null;
  const car = { ...row };
  try { car.colors = JSON.parse(row.colors); } catch { car.colors = []; }
  car.featured = !!row.featured;
  car.sold     = !!row.sold;
  car.rep      = row.sales_rep_id ? getRep.get(row.sales_rep_id) : null;
  car.images   = getImages.all(row.id);
  return car;
}

// ─── GET /api/cars ──────────────────────────────────────────────
// Query: make, body, condition, min_price, max_price, max_year, min_year,
//        max_km, featured, q, page, limit, sort
router.get('/', (req, res) => {
  const q = req.query;
  const where = ['sold = 0'];
  const params = {};

  if (q.make) { where.push('make = @make');       params.make = q.make; }
  if (q.body) { where.push('body = @body');       params.body = q.body; }
  if (q.condition) { where.push('condition = @condition'); params.condition = q.condition; }
  if (q.featured === 'true') where.push('featured = 1');
  if (q.min_price) { where.push('price_kes >= @min_price'); params.min_price = parseInt(q.min_price, 10); }
  if (q.max_price) { where.push('price_kes <= @max_price'); params.max_price = parseInt(q.max_price, 10); }
  if (q.min_year)  { where.push('year >= @min_year');       params.min_year  = parseInt(q.min_year, 10); }
  if (q.max_year)  { where.push('year <= @max_year');       params.max_year  = parseInt(q.max_year, 10); }
  if (q.max_km)    { where.push('km <= @max_km');           params.max_km    = parseInt(q.max_km, 10); }
  if (q.q) {
    where.push('(make LIKE @q OR model LIKE @q OR description LIKE @q)');
    params.q = `%${q.q}%`;
  }

  const sortMap = {
    price_asc:  'price_kes ASC',
    price_desc: 'price_kes DESC',
    year_desc:  'year DESC, id DESC',
    year_asc:   'year ASC, id ASC',
    newest:     'created_at DESC',
  };
  const orderBy = sortMap[q.sort] || 'featured DESC, created_at DESC';

  const limit  = Math.min(100, parseInt(q.limit  || '20', 10));
  const page   = Math.max(1,  parseInt(q.page   || '1', 10));
  const offset = (page - 1) * limit;

  const total = db.prepare(`SELECT COUNT(*) AS c FROM cars WHERE ${where.join(' AND ')}`).get(params).c;
  const rows = db.prepare(
    `SELECT * FROM cars WHERE ${where.join(' AND ')} ORDER BY ${orderBy} LIMIT ${limit} OFFSET ${offset}`
  ).all(params);

  res.json({
    data:  rows.map(hydrate),
    page,
    limit,
    total,
    total_pages: Math.ceil(total / limit),
  });
});

// ─── GET /api/cars/:id ──────────────────────────────────────────
router.get('/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Car not found' });
  res.json(hydrate(row));
});

// ─── Admin: create ──────────────────────────────────────────────
const carSchema = z.object({
  make: z.string().min(1).max(60),
  model: z.string().min(1).max(80),
  year: z.number().int().min(1950).max(new Date().getFullYear() + 2),
  price_kes: z.number().int().positive(),
  body: z.enum(['SUV','Sedan','Coupe','Pickup','Hatchback','Convertible','Wagon','Van']),
  condition: z.enum(['new','used','certified']).default('new'),
  badge: z.string().max(40).optional().nullable(),
  km: z.number().int().min(0).default(0),
  power: z.string().max(30).optional().nullable(),
  engine: z.string().max(60).optional().nullable(),
  transmission: z.string().max(60).optional().nullable(),
  drivetrain: z.string().max(40).optional().nullable(),
  fuel_type: z.string().max(30).optional().nullable(),
  colors: z.array(z.string().regex(/^#[0-9a-fA-F]{6}$/)).default([]),
  description: z.string().max(4000).optional().nullable(),
  featured: z.boolean().default(false),
  sales_rep_id: z.number().int().positive().optional().nullable(),
  location: z.string().max(60).optional().nullable(),
});

router.post('/', requireRole('admin', 'sales_rep'), (req, res, next) => {
  try {
    const data = carSchema.parse(req.body);
    const result = db.prepare(`
      INSERT INTO cars (make, model, year, price_kes, body, condition, badge, km,
                        power, engine, transmission, drivetrain, fuel_type, colors,
                        description, featured, sales_rep_id, location)
      VALUES (@make, @model, @year, @price_kes, @body, @condition, @badge, @km,
              @power, @engine, @transmission, @drivetrain, @fuel_type, @colors,
              @description, @featured, @sales_rep_id, @location)
    `).run({
      ...data,
      colors: JSON.stringify(data.colors),
      featured: data.featured ? 1 : 0,
    });

    const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(hydrate(row));
  } catch (err) { next(err); }
});

// ─── Admin: update ──────────────────────────────────────────────
router.put('/:id', requireRole('admin', 'sales_rep'), (req, res, next) => {
  try {
    const existing = db.prepare('SELECT id FROM cars WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Car not found' });

    const data = carSchema.partial().parse(req.body);
    const updates = Object.entries(data).map(([k, v]) => {
      if (k === 'colors' && v !== undefined) return [`colors = @colors`, JSON.stringify(v)];
      if (k === 'featured' && v !== undefined) return [`featured = @featured`, v ? 1 : 0];
      return [`${k} = @${k}`, v];
    });

    if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

    const sets = updates.map(([s]) => s).join(', ');
    const params = { id: parseInt(req.params.id, 10) };
    for (const [k, v] of Object.entries(data)) {
      if (k === 'colors' && v !== undefined) params[k] = JSON.stringify(v);
      else if (k === 'featured' && v !== undefined) params[k] = v ? 1 : 0;
      else params[k] = v;
    }

    db.prepare(`UPDATE cars SET ${sets} WHERE id = @id`).run(params);
    const row = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
    res.json(hydrate(row));
  } catch (err) { next(err); }
});

// ─── Admin: mark sold / delete ──────────────────────────────────
router.post('/:id/mark-sold', requireRole('admin', 'sales_rep'), (req, res) => {
  const r = db.prepare('UPDATE cars SET sold = 1 WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Car not found' });
  res.json({ ok: true });
});

router.delete('/:id', requireRole('admin'), (req, res) => {
  // Also remove image files
  const imgs = db.prepare('SELECT path FROM car_images WHERE car_id = ?').all(req.params.id);
  for (const img of imgs) {
    const abs = path.join(process.cwd(), img.path);
    try { fs.unlinkSync(abs); } catch {}
  }
  const r = db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  if (r.changes === 0) return res.status(404).json({ error: 'Car not found' });
  res.json({ ok: true });
});

// ─── Admin: upload images ───────────────────────────────────────
router.post(
  '/:id/images',
  requireRole('admin', 'sales_rep'),
  carImages.array('images', 10),
  (req, res, next) => {
    try {
      const car = db.prepare('SELECT id FROM cars WHERE id = ?').get(req.params.id);
      if (!car) return res.status(404).json({ error: 'Car not found' });
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No images uploaded' });
      }

      const existing = db.prepare('SELECT COUNT(*) AS c FROM car_images WHERE car_id = ?').get(car.id).c;
      const insert = db.prepare(`
        INSERT INTO car_images (car_id, path, alt, is_primary, sort_order)
        VALUES (?, ?, ?, ?, ?)
      `);

      const results = [];
      req.files.forEach((f, i) => {
        const relPath = path.relative(process.cwd(), f.path).replace(/\\/g, '/');
        const isPrimary = existing === 0 && i === 0 ? 1 : 0;
        const r = insert.run(car.id, relPath, req.body.alt || null, isPrimary, existing + i);
        results.push({ id: r.lastInsertRowid, path: relPath, is_primary: !!isPrimary });
      });
      res.status(201).json({ images: results });
    } catch (err) { next(err); }
  }
);

router.delete('/:id/images/:imageId', requireRole('admin', 'sales_rep'), (req, res) => {
  const img = db.prepare('SELECT path FROM car_images WHERE id = ? AND car_id = ?').get(req.params.imageId, req.params.id);
  if (!img) return res.status(404).json({ error: 'Image not found' });
  try { fs.unlinkSync(path.join(process.cwd(), img.path)); } catch {}
  db.prepare('DELETE FROM car_images WHERE id = ?').run(req.params.imageId);
  res.json({ ok: true });
});

// Facets for the filter sidebar (makes, bodies, min/max price, max km, max year)
router.get('/meta/facets', (_req, res) => {
  const makes = db.prepare('SELECT DISTINCT make FROM cars WHERE sold = 0 ORDER BY make').all().map(r => r.make);
  const bodies = db.prepare('SELECT DISTINCT body FROM cars WHERE sold = 0 ORDER BY body').all().map(r => r.body);
  const r = db.prepare(`
    SELECT MIN(price_kes) AS min_price, MAX(price_kes) AS max_price,
           MIN(year) AS min_year, MAX(year) AS max_year,
           MAX(km) AS max_km
    FROM cars WHERE sold = 0
  `).get();
  res.json({ makes, bodies, ...r });
});

module.exports = router;
