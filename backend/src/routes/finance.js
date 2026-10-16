// Finance: live quote + submit application.
const express = require('express');
const { z } = require('zod');
const db = require('../db');
const { requireRole } = require('../middleware/auth');
const { monthlyPayment, totalPayable } = require('../utils/finance');
const { notifyAdmin } = require('../utils/email');

const router = express.Router();

// POST /api/finance/quote — stateless calculator
router.post('/quote', (req, res, next) => {
  try {
    const { price, deposit, term_months, interest_rate } = z.object({
      price:         z.number().positive(),
      deposit:       z.number().min(0),
      term_months:   z.number().int().min(6).max(96),
      interest_rate: z.number().min(0).max(50),
    }).parse(req.body);

    const principal = price - deposit;
    if (principal <= 0) return res.status(400).json({ error: 'Deposit must be less than price' });

    const monthly = monthlyPayment(principal, interest_rate, term_months);
    const total   = totalPayable(monthly, term_months, deposit);

    res.json({
      principal,
      monthly_payment: monthly,
      total_payable:   total,
      total_interest:  total - price,
    });
  } catch (err) { next(err); }
});

// POST /api/finance/applications — submit application
const applicationSchema = z.object({
  applicant_name:  z.string().min(2).max(80),
  applicant_email: z.string().email(),
  applicant_phone: z.string().min(7).max(32),
  car_id:          z.number().int().positive().optional().nullable(),
  vehicle_price:   z.number().int().positive(),
  deposit_kes:     z.number().int().min(0),
  term_months:     z.number().int().min(6).max(96),
  interest_rate:   z.number().min(0).max(50),
  employment:      z.string().max(60).optional().nullable(),
  monthly_income:  z.number().int().positive().optional().nullable(),
});

router.post('/applications', (req, res, next) => {
  try {
    const data = applicationSchema.parse(req.body);
    const principal = data.vehicle_price - data.deposit_kes;
    if (principal <= 0) return res.status(400).json({ error: 'Deposit must be less than vehicle price' });

    const monthly = monthlyPayment(principal, data.interest_rate, data.term_months);
    const total   = totalPayable(monthly, data.term_months, data.deposit_kes);

    const result = db.prepare(`
      INSERT INTO finance_applications
        (applicant_name, applicant_email, applicant_phone, car_id,
         vehicle_price, deposit_kes, term_months, interest_rate,
         monthly_payment, total_payable, employment, monthly_income)
      VALUES (@applicant_name, @applicant_email, @applicant_phone, @car_id,
              @vehicle_price, @deposit_kes, @term_months, @interest_rate,
              @monthly_payment, @total_payable, @employment, @monthly_income)
    `).run({
      ...data,
      car_id: data.car_id || null,
      employment: data.employment || null,
      monthly_income: data.monthly_income || null,
      monthly_payment: monthly,
      total_payable: total,
    });

    notifyAdmin(
      `Finance application from ${data.applicant_name}`,
      `KES ${data.vehicle_price.toLocaleString()} vehicle, ${data.term_months}mo @ ${data.interest_rate}%\nMonthly: KES ${monthly.toLocaleString()}\n${data.applicant_email} / ${data.applicant_phone}`
    ).catch(() => {});

    res.status(201).json({
      id: result.lastInsertRowid,
      monthly_payment: monthly,
      total_payable: total,
    });
  } catch (err) { next(err); }
});

// Staff list/update
router.get('/applications', requireRole('admin', 'sales_rep'), (req, res) => {
  const where = [];
  const params = {};
  if (req.query.status) { where.push('status = @status'); params.status = req.query.status; }

  const limit  = Math.min(200, parseInt(req.query.limit || '50', 10));
  const page   = Math.max(1,  parseInt(req.query.page || '1', 10));
  const offset = (page - 1) * limit;
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const total = db.prepare(`SELECT COUNT(*) AS c FROM finance_applications ${whereSql}`).get(params).c;
  const rows = db.prepare(
    `SELECT * FROM finance_applications ${whereSql} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`
  ).all(params);
  res.json({ data: rows, page, limit, total, total_pages: Math.ceil(total/limit) });
});

router.patch('/applications/:id', requireRole('admin', 'sales_rep'), (req, res, next) => {
  try {
    const data = z.object({
      status: z.enum(['submitted','reviewing','approved','rejected','disbursed']).optional(),
      internal_notes: z.string().max(4000).optional(),
    }).parse(req.body);

    const existing = db.prepare('SELECT id FROM finance_applications WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Application not found' });

    const sets = Object.keys(data).map(k => `${k} = @${k}`);
    if (sets.length === 0) return res.status(400).json({ error: 'No fields to update' });

    db.prepare(`UPDATE finance_applications SET ${sets.join(', ')} WHERE id = @id`)
      .run({ ...data, id: parseInt(req.params.id, 10) });
    res.json(db.prepare('SELECT * FROM finance_applications WHERE id = ?').get(req.params.id));
  } catch (err) { next(err); }
});

module.exports = router;
