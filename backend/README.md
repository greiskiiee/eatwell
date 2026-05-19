# EatWell Backend

## Tech
- Express + TypeScript
- MongoDB + Mongoose

## Setup
1. Copy env file:
   - `cp .env.example .env` (or create `.env` on Windows)
2. Set `MONGODB_URI` and API base URLs/keys.
3. Run locally:
   - `npm run dev`

## Deploy on Render

**Do not use `npm run dev` in production.** That runs `ts-node-dev`, which compiles TypeScript in memory and often crashes with **heap out of memory** on small instances.

| Setting | Value |
|---------|--------|
| **Root Directory** | `backend` |
| **Build Command** | `npm ci --include=dev && npm run build` |
| **Start Command** | `npm start` |

Required env vars: `MONGODB_URI`, `JWT_SECRET`, `CORS_ORIGIN` (your frontend URL, e.g. `https://your-app.vercel.app`).

Optional: `PORT` is set automatically by Render. The server binds to `0.0.0.0`.

You can also use the repo root `render.yaml` blueprint instead of setting commands manually.

## Routes
- `GET /health`

### Food technologist recipes (stored in MongoDB)
- `POST /api/technologist-recipes`
- `GET /api/technologist-recipes?q=...&tag=...`
- `GET /api/technologist-recipes/:id`
- `PATCH /api/technologist-recipes/:id`
- `DELETE /api/technologist-recipes/:id`

### External recipes API proxy (server-side keys)
- `GET /api/external-recipes/search?q=...`
- `GET /api/external-recipes/:id`

### Barcode API proxy (server-side keys)
- `GET /api/barcode/:code`

