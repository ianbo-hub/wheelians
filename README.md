# AutoElite Kenya — Full-stack dealership website

A premium car dealership web application for the Kenyan market, built as two deployable pieces:

- **Backend** — Node.js + Express + SQLite REST API with JWT auth, image uploads, and email notifications.
- **Frontend** — Single-page HTML site (hero video, inventory browser, finance calculator, sell-your-car, contact) plus an admin console at `/admin/`.

The backend serves the frontend as static files, so running `npm start` in `backend/` boots the whole site on one port.

---

## Quick start

```bash
cd backend
cp .env.example .env            # edit JWT_SECRET + ADMIN_PASSWORD before production
npm install
npm run seed                    # creates data/autoelite.db + admin + sample inventory
npm start                       # http://localhost:4000
```

Open:

- **Public site**: <http://localhost:4000/>
- **Admin console**: <http://localhost:4000/admin/>

Default admin login is whatever you set in `.env` (defaults to `admin@autoelite.co.ke` / `change-this-after-first-login`).

---

## Project layout

```
autoelite/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Express entry point
│   │   ├── config/                 # Env-driven configuration
│   │   ├── db/
│   │   │   ├── schema.sql          # Full SQLite schema
│   │   │   ├── index.js            # better-sqlite3 instance
│   │   │   ├── init.js             # applies schema (idempotent)
│   │   │   └── seed.js             # admin + sales reps + 8 sample cars
│   │   ├── middleware/
│   │   │   ├── auth.js             # JWT + role gating
│   │   │   ├── upload.js           # Multer config for car images
│   │   │   └── errors.js           # Zod + global error handling
│   │   ├── routes/
│   │   │   ├── auth.js             # /api/auth/* (register, login, me)
│   │   │   ├── cars.js             # /api/cars/* (browse + CRUD + image upload)
│   │   │   ├── enquiries.js        # /api/enquiries/*
│   │   │   ├── sellCar.js          # /api/sell-car/*
│   │   │   ├── finance.js          # /api/finance/* (quote + applications)
│   │   │   ├── testDrives.js       # /api/test-drives/*
│   │   │   └── admin.js            # /api/admin/* (stats, users)
│   │   └── utils/
│   │       ├── email.js            # Optional SMTP notifications
│   │       └── finance.js          # Amortising-loan math
│   ├── data/                       # SQLite database (git-ignored)
│   ├── uploads/                    # User-uploaded images (git-ignored)
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── index.html                  # Public-facing dealership site
│   ├── admin/index.html            # Admin console (login + 7 views)
│   └── assets/hero.mp4             # Hero section video
├── README.md
└── .gitignore
```

---

## Features

### Public site (`frontend/index.html`)
- Hero section with autoplay 4K video
- Inventory browser: filter by make, body, condition, price, year
- Dynamic finance calculator (live amortisation)
- Sell-your-car form (POST → DB + optional email notification)
- Contact form (POST → DB + optional email notification)
- About Us, locations, team, FAQ, newsletter signup
- Responsive, dark theme, no external image dependencies

### Admin console (`frontend/admin/`)
- JWT login (admin + sales_rep roles)
- Dashboard — stat tiles + recent activity feed
- Inventory CRUD — add / edit / mark-sold / delete cars
- Enquiries — list, filter by status, update status + notes
- Sell submissions — review, make offer, update status
- Finance applications — inline status updates
- Test drives — inline status updates
- User management (admin only)

### Backend API

| Endpoint | Method | Auth | Purpose |
|---|---|---|---|
| `/api/health` | GET | — | Server health |
| `/api/auth/register` | POST | — | Customer signup |
| `/api/auth/login` | POST | — | Login (returns JWT) |
| `/api/auth/me` | GET | Bearer | Current user |
| `/api/cars` | GET | — | Browse inventory (query filters) |
| `/api/cars/:id` | GET | — | Car details |
| `/api/cars/meta/facets` | GET | — | Filter options (makes, bodies, price range) |
| `/api/cars` | POST | admin/sales | Create car |
| `/api/cars/:id` | PUT | admin/sales | Update car |
| `/api/cars/:id/mark-sold` | POST | admin/sales | Mark car sold |
| `/api/cars/:id` | DELETE | admin | Delete car |
| `/api/cars/:id/images` | POST | admin/sales | Upload up to 10 images (multipart) |
| `/api/cars/:id/images/:imageId` | DELETE | admin/sales | Remove one image |
| `/api/enquiries` | POST | — | Submit contact / car enquiry |
| `/api/enquiries` | GET | admin/sales | List enquiries |
| `/api/enquiries/:id` | PATCH | admin/sales | Update status / notes |
| `/api/sell-car` | POST | — | Submit sell-your-car (multipart with images OK) |
| `/api/sell-car` | GET | admin/sales | List submissions |
| `/api/sell-car/:id` | PATCH | admin/sales | Update status / offer |
| `/api/finance/quote` | POST | — | Stateless amortisation calculator |
| `/api/finance/applications` | POST | — | Submit finance application |
| `/api/finance/applications` | GET | admin/sales | List applications |
| `/api/finance/applications/:id` | PATCH | admin/sales | Update status |
| `/api/test-drives` | POST | — | Book a test drive |
| `/api/test-drives` | GET | admin/sales | List bookings |
| `/api/test-drives/:id` | PATCH | admin/sales | Update status |
| `/api/admin/stats` | GET | admin/sales | Dashboard counters |
| `/api/admin/activity` | GET | admin/sales | Recent activity feed |
| `/api/admin/users` | GET | admin | List users |
| `/api/admin/users` | POST | admin | Create staff user |
| `/api/admin/users/:id` | PATCH | admin | Update user |
| `/api/admin/users/:id` | DELETE | admin | Delete user |
| `/api/admin/sales-reps` | GET | admin/sales | Sales rep list (for assignment) |

Public POSTs are rate-limited (30/15min per IP). Login is limited to 10/15min per IP.

---

## Deployment notes

### Development
```bash
cd backend
npm run dev   # auto-restarts on file changes
```

### Production
Set these in `.env`:

```
NODE_ENV=production
JWT_SECRET=<64-character random string>
ADMIN_EMAIL=you@your-domain.co.ke
ADMIN_PASSWORD=<strong password — change after first login>
CORS_ORIGIN=https://autoelite.co.ke
# Optional email notifications
SMTP_HOST=smtp.your-provider.com
SMTP_USER=...
SMTP_PASS=...
NOTIFY_EMAIL=sales@autoelite.co.ke
```

Then:
```bash
npm install --omit=dev
npm run seed           # first time only
npm start              # keep alive with pm2, systemd, docker, etc.
```

Behind an nginx reverse proxy on port 443 is the typical setup. The backend serves everything on one Node process — no separate static server needed.

### Database
SQLite file lives at `backend/data/autoelite.db`. For PostgreSQL or MySQL in future, the swap is straightforward since all queries are parameterised.

### Scaling the frontend
`frontend/` is pure HTML + CSS + vanilla JS — zero build step, works everywhere. You can also deploy it to a CDN (Vercel, Netlify, Cloudflare Pages) and point it at the backend by setting `window.API_BASE = 'https://api.autoelite.co.ke'` in a `<script>` before the main script.

---

## Default accounts (after `npm run seed`)

| Role      | Email                      | Password                  |
|-----------|----------------------------|---------------------------|
| Admin     | admin@autoelite.co.ke      | (from .env)               |
| Sales rep | samuel@autoelite.co.ke     | rep1234                   |
| Sales rep | grace@autoelite.co.ke      | rep1234                   |
| Sales rep | david@autoelite.co.ke      | rep1234                   |
| Sales rep | lucy@autoelite.co.ke       | rep1234                   |

**Change every seeded password before going live.**

---

## License
MIT
