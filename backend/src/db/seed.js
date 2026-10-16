// Seed admin user + initial inventory of 8 cars.
require('./init');  // ensure schema
const bcrypt = require('bcryptjs');
const db = require('./index');
const config = require('../config');

// ─── Admin ────────────────────────────────────────────────────────
const adminExists = db
  .prepare('SELECT id FROM users WHERE email = ?')
  .get(config.admin.email);

if (!adminExists) {
  const hash = bcrypt.hashSync(config.admin.password, 10);
  db.prepare(
    `INSERT INTO users (email, password_hash, name, role)
     VALUES (?, ?, ?, 'admin')`
  ).run(config.admin.email, hash, config.admin.name);
  console.log(`✔ Admin created: ${config.admin.email} / ${config.admin.password}`);
} else {
  console.log(`• Admin already exists: ${config.admin.email}`);
}

// ─── Sample sales reps ────────────────────────────────────────────
const reps = [
  { name: 'Samuel K.', email: 'samuel@wheelians.co.ke', phone: '+254 711 111 001' },
  { name: 'Grace W.',  email: 'grace@wheelians.co.ke',  phone: '+254 711 111 002' },
  { name: 'David M.',  email: 'david@wheelians.co.ke',  phone: '+254 711 111 003' },
  { name: 'Lucy A.',   email: 'lucy@wheelians.co.ke',   phone: '+254 711 111 004' },
];

const repIds = {};
const insertRep = db.prepare(
  `INSERT OR IGNORE INTO users (email, password_hash, name, phone, role)
   VALUES (?, ?, ?, ?, 'sales_rep')`
);
const findRep = db.prepare('SELECT id FROM users WHERE email = ?');

for (const r of reps) {
  const pwHash = bcrypt.hashSync('rep1234', 10);
  insertRep.run(r.email, pwHash, r.name, r.phone);
  const row = findRep.get(r.email);
  repIds[r.name] = row.id;
}
console.log(`✔ Sales reps seeded (${reps.length})`);

// ─── Inventory ────────────────────────────────────────────────────
const cars = [
  {
    make: 'Toyota', model: 'Land Cruiser 300', year: 2024, price_kes: 18500000,
    body: 'SUV', condition: 'new', badge: 'New', km: 0,
    power: '415hp', engine: '3.5L V6 Twin-Turbo', transmission: '10-speed auto',
    drivetrain: '4WD', fuel_type: 'Petrol',
    colors: ['#1a1a2e', '#c0c0c0', '#8b4513'],
    description: 'Flagship Toyota SUV with legendary off-road capability. KDSS, Multi-Terrain Select, 10-speed automatic.',
    featured: 1, rep: 'Samuel K.', location: 'Nairobi',
  },
  {
    make: 'BMW', model: 'X5 M Competition', year: 2024, price_kes: 22800000,
    body: 'SUV', condition: 'new', badge: 'New', km: 0,
    power: '617hp', engine: '4.4L V8 Twin-Turbo', transmission: '8-speed M Steptronic',
    drivetrain: 'M xDrive', fuel_type: 'Petrol',
    colors: ['#0d0d0d', '#ffffff', '#1a3a6e'],
    description: 'High-performance SUV with M-specific chassis and quad exhaust. 0-100 km/h in 3.9s.',
    featured: 1, rep: 'Grace W.', location: 'Nairobi',
  },
  {
    make: 'Porsche', model: 'Cayenne Turbo', year: 2023, price_kes: 19500000,
    body: 'SUV', condition: 'used', badge: 'Low Mileage', km: 12500,
    power: '541hp', engine: '4.0L V8 Twin-Turbo', transmission: '8-speed Tiptronic',
    drivetrain: 'AWD', fuel_type: 'Petrol',
    colors: ['#c0c0c0', '#0d0d0d', '#5c0000'],
    description: 'Immaculate Cayenne Turbo with full service history. Porsche certified pre-owned.',
    featured: 0, rep: 'David M.', location: 'Nairobi',
  },
  {
    make: 'Mercedes', model: 'GLE 63 S AMG', year: 2024, price_kes: 20100000,
    body: 'SUV', condition: 'new', badge: 'New', km: 0,
    power: '603hp', engine: '4.0L V8 Biturbo + EQ Boost', transmission: '9G-TRONIC',
    drivetrain: '4MATIC+', fuel_type: 'Petrol',
    colors: ['#1a2535', '#000000', '#8b0000'],
    description: 'AMG performance SUV with mild-hybrid tech, panoramic sunroof, Burmester 3D sound.',
    featured: 1, rep: 'Lucy A.', location: 'Nairobi',
  },
  {
    make: 'Audi', model: 'RS Q8', year: 2024, price_kes: 21300000,
    body: 'SUV', condition: 'new', badge: 'New', km: 0,
    power: '591hp', engine: '4.0L V8 TFSI', transmission: '8-speed Tiptronic',
    drivetrain: 'Quattro', fuel_type: 'Petrol',
    colors: ['#4a0000', '#0d0d0d', '#c0c0c0'],
    description: 'The world\'s fastest production SUV around the Nürburgring. Dynamic all-wheel steering.',
    featured: 0, rep: 'Samuel K.', location: 'Mombasa',
  },
  {
    make: 'Lexus', model: 'LX 600', year: 2023, price_kes: 17800000,
    body: 'SUV', condition: 'certified', badge: 'Certified', km: 18000,
    power: '409hp', engine: '3.5L V6 Twin-Turbo', transmission: '10-speed auto',
    drivetrain: '4WD', fuel_type: 'Petrol',
    colors: ['#2c2416', '#000000', '#ffffff'],
    description: 'Flagship Lexus SUV with Mark Levinson audio, three-row seating, F SPORT package.',
    featured: 1, rep: 'Grace W.', location: 'Nairobi',
  },
  {
    make: 'BMW', model: 'M4 Competition', year: 2024, price_kes: 15200000,
    body: 'Coupe', condition: 'new', badge: 'New', km: 0,
    power: '503hp', engine: '3.0L inline-6 Twin-Turbo', transmission: '8-speed M Steptronic',
    drivetrain: 'RWD', fuel_type: 'Petrol',
    colors: ['#00008b', '#000000', '#ffcc00'],
    description: 'Pure driving machine. M carbon ceramic brakes, M Drive Professional, carbon roof.',
    featured: 1, rep: 'David M.', location: 'Nairobi',
  },
  {
    make: 'Toyota', model: 'Hilux GR Sport', year: 2024, price_kes: 7800000,
    body: 'Pickup', condition: 'new', badge: 'New', km: 0,
    power: '201hp', engine: '2.8L Diesel', transmission: '6-speed auto',
    drivetrain: '4WD', fuel_type: 'Diesel',
    colors: ['#1a1a1a', '#ffffff', '#8b0000'],
    description: 'Gazoo Racing-tuned Hilux. Monotube shocks, reinforced chassis, GR Sport interior.',
    featured: 0, rep: 'Lucy A.', location: 'Kisumu',
  },
];

const insertCar = db.prepare(`
  INSERT INTO cars
    (make, model, year, price_kes, body, condition, badge, km,
     power, engine, transmission, drivetrain, fuel_type, colors,
     description, featured, sales_rep_id, location)
  VALUES
    (@make, @model, @year, @price_kes, @body, @condition, @badge, @km,
     @power, @engine, @transmission, @drivetrain, @fuel_type, @colors,
     @description, @featured, @sales_rep_id, @location)
`);

const existing = db.prepare('SELECT COUNT(*) AS c FROM cars').get().c;
if (existing === 0) {
  const tx = db.transaction((rows) => {
    for (const c of rows) {
      insertCar.run({
        ...c,
        colors: JSON.stringify(c.colors),
        sales_rep_id: repIds[c.rep] || null,
      });
    }
  });
  tx(cars);
  console.log(`✔ Inventory seeded (${cars.length} cars)`);
} else {
  console.log(`• Inventory already has ${existing} car(s), skipping`);
}

console.log('\nSeed complete.');
console.log('—');
console.log(`Admin login: ${config.admin.email} / ${config.admin.password}`);
console.log('Sales rep logins: samuel|grace|david|lucy@wheelians.co.ke / rep1234');
