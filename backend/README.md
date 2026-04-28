# EatWell Backend

## Tech
- Express + TypeScript
- MongoDB + Mongoose

## Setup
1. Copy env file:
   - `cp .env.example .env` (or create `.env` on Windows)
2. Set `MONGODB_URI` and API base URLs/keys.
3. Run:
   - `npm run dev`

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

