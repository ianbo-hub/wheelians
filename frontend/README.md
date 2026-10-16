# AutoElite Frontend

Pure HTML + CSS + vanilla JavaScript. No build step. No framework.

## Files

- `index.html` — public-facing dealership site
- `admin/index.html` — admin console (login-gated)
- `assets/hero.mp4` — hero section background video

## How it talks to the backend

The frontend reads `window.API_BASE` (optional). If unset, requests go to the same origin — which is the default when the Express backend serves this directory as static files.

To host the frontend separately (CDN, Netlify, etc.), drop this before the main script in `index.html`:

```html
<script>window.API_BASE = 'https://api.autoelite.co.ke';</script>
```

and make sure that URL is in the backend's `CORS_ORIGIN`.

## Forms

| Form              | Endpoint                 | Method |
|-------------------|--------------------------|--------|
| Contact           | `/api/enquiries`         | POST   |
| Sell Your Car     | `/api/sell-car`          | POST   |
| Finance Apply     | `/api/finance/applications` | POST (not yet wired in UI — add inside the Finance section when you want it) |

Inventory cards call `GET /api/cars` on load. Finance calculator is purely client-side (the backend's `/api/finance/quote` endpoint is available if you want to replace the client-side math).
