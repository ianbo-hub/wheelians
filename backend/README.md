# AutoElite Backend

Node.js + Express + SQLite REST API. See the project root `README.md` for full documentation.

## Scripts

```bash
npm install      # install dependencies
npm run init-db  # apply schema.sql (idempotent)
npm run seed     # seed admin + 4 sales reps + 8 sample cars (runs init-db first)
npm start        # start server (uses NODE_ENV from .env)
npm run dev      # start with --watch (auto-restart on file changes)
```

## Environment

Copy `.env.example` to `.env`, then set at minimum:

- `JWT_SECRET` — long random string
- `ADMIN_PASSWORD` — initial admin password (change after first login)

SMTP vars are optional — leave blank and email notifications are no-ops (they log to stdout).

## Database

SQLite file at `data/autoelite.db` (git-ignored). Full schema is in `src/db/schema.sql`.
Tables: `users`, `cars`, `car_images`, `enquiries`, `sell_submissions`, `sell_submission_images`,
`finance_applications`, `test_drives`, `audit_log`.

## Uploads

Image uploads land under `uploads/` (git-ignored) and are served at `/uploads/*`. Multer limits
each file to `MAX_UPLOAD_MB` (default 10) and allows JPEG, PNG, WebP, AVIF.
