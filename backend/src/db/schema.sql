-- Wheelians Kenya — SQLite schema
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ─── Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  email         TEXT    NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT    NOT NULL,
  name          TEXT    NOT NULL,
  phone         TEXT,
  role          TEXT    NOT NULL DEFAULT 'customer'
                  CHECK (role IN ('customer', 'sales_rep', 'admin')),
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Cars (inventory) ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cars (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  make       TEXT    NOT NULL,
  model      TEXT    NOT NULL,
  year       INTEGER NOT NULL,
  price_kes  INTEGER NOT NULL,
  body       TEXT    NOT NULL
                CHECK (body IN ('SUV','Sedan','Coupe','Pickup','Hatchback','Convertible','Wagon','Van')),
  condition  TEXT    NOT NULL DEFAULT 'new'
                CHECK (condition IN ('new', 'used', 'certified')),
  badge      TEXT,                 -- e.g. "New", "Low Mileage", "Showroom Pick"
  km         INTEGER NOT NULL DEFAULT 0,
  power      TEXT,                 -- e.g. "415hp"
  engine     TEXT,                 -- e.g. "3.5L V6"
  transmission TEXT,               -- e.g. "8-speed auto"
  drivetrain TEXT,                 -- e.g. "AWD"
  fuel_type  TEXT,                 -- e.g. "Petrol"
  colors     TEXT NOT NULL DEFAULT '[]',   -- JSON array of hex strings
  description TEXT,
  featured   INTEGER NOT NULL DEFAULT 0,   -- 0 or 1
  sold       INTEGER NOT NULL DEFAULT 0,
  sales_rep_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  location   TEXT,                 -- Nairobi | Mombasa | Kisumu
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_cars_make   ON cars(make);
CREATE INDEX IF NOT EXISTS idx_cars_body   ON cars(body);
CREATE INDEX IF NOT EXISTS idx_cars_price  ON cars(price_kes);
CREATE INDEX IF NOT EXISTS idx_cars_sold   ON cars(sold);

-- ─── Car images ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS car_images (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id     INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  path       TEXT    NOT NULL,     -- e.g. uploads/cars/123/front.jpg
  alt        TEXT,
  is_primary INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_car_images_car ON car_images(car_id);

-- ─── Enquiries (contact form + car-specific) ────────────────────
CREATE TABLE IF NOT EXISTS enquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL,
  email      TEXT    NOT NULL,
  phone      TEXT,
  subject    TEXT,
  message    TEXT    NOT NULL,
  car_id     INTEGER REFERENCES cars(id) ON DELETE SET NULL,
  source     TEXT    NOT NULL DEFAULT 'contact-form'
                CHECK (source IN ('contact-form','car-enquiry','finance','callback')),
  status     TEXT    NOT NULL DEFAULT 'new'
                CHECK (status IN ('new','contacted','in_progress','closed','spam')),
  assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
  internal_notes TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_car    ON enquiries(car_id);

-- ─── Sell-your-car submissions ──────────────────────────────────
CREATE TABLE IF NOT EXISTS sell_submissions (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  owner_name    TEXT    NOT NULL,
  owner_email   TEXT    NOT NULL,
  owner_phone   TEXT    NOT NULL,
  make          TEXT    NOT NULL,
  model         TEXT    NOT NULL,
  year          INTEGER NOT NULL,
  km            INTEGER NOT NULL,
  condition     TEXT,
  asking_price  INTEGER,
  notes         TEXT,
  status        TEXT    NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','reviewing','offer_made','accepted','rejected','withdrawn')),
  our_offer_kes INTEGER,
  internal_notes TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sell_submission_images (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES sell_submissions(id) ON DELETE CASCADE,
  path          TEXT    NOT NULL,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Finance applications ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS finance_applications (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_name TEXT   NOT NULL,
  applicant_email TEXT  NOT NULL,
  applicant_phone TEXT  NOT NULL,
  car_id        INTEGER REFERENCES cars(id) ON DELETE SET NULL,
  vehicle_price INTEGER NOT NULL,
  deposit_kes   INTEGER NOT NULL,
  term_months   INTEGER NOT NULL,
  interest_rate REAL    NOT NULL,
  monthly_payment INTEGER NOT NULL,
  total_payable INTEGER NOT NULL,
  employment    TEXT,
  monthly_income INTEGER,
  status        TEXT    NOT NULL DEFAULT 'submitted'
                  CHECK (status IN ('submitted','reviewing','approved','rejected','disbursed')),
  internal_notes TEXT,
  created_at    DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Test-drive bookings ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS test_drives (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  car_id      INTEGER NOT NULL REFERENCES cars(id) ON DELETE CASCADE,
  name        TEXT    NOT NULL,
  email       TEXT    NOT NULL,
  phone       TEXT    NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time TEXT,
  location    TEXT,
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending','confirmed','completed','cancelled','no_show')),
  internal_notes TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── Audit log (admin actions) ──────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action      TEXT NOT NULL,
  entity      TEXT,
  entity_id   INTEGER,
  details     TEXT,
  ip          TEXT,
  created_at  DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ─── updated_at triggers ────────────────────────────────────────
CREATE TRIGGER IF NOT EXISTS cars_updated_at AFTER UPDATE ON cars
BEGIN UPDATE cars SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS enquiries_updated_at AFTER UPDATE ON enquiries
BEGIN UPDATE enquiries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS sell_submissions_updated_at AFTER UPDATE ON sell_submissions
BEGIN UPDATE sell_submissions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;

CREATE TRIGGER IF NOT EXISTS finance_applications_updated_at AFTER UPDATE ON finance_applications
BEGIN UPDATE finance_applications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id; END;
