# RoadDNA Frontend

Municipality dashboard (Next.js + Tailwind + Leaflet + React Query).

## Run

```bash
npm install
npm run dev
```

## Env

See `.env.example`:

| Variable | Default | Meaning |
|----------|---------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3001` | Shanky API origin |
| `NEXT_PUBLIC_USE_MOCKS` | `true` | Use fixtures matching the API contract |

Set `NEXT_PUBLIC_USE_MOCKS=false` to hit real endpoints (or run `npm run mock-api` from the repo root first).

Copy `.env.integration.example` → `.env.local` for the HTTP integration profile.

## Demo login

`admin@roaddna.local` / `password`
