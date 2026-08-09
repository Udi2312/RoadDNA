# RoadDNA Frontend

Municipality dashboard (Next.js 16 + Tailwind + Leaflet + React Query).

## Run

```bash
npm install
npm run dev
```

## Env

| Variable | Default | Meaning |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:5000/api/v1` | Shankar Phase 1/2 API |
| `NEXT_PUBLIC_USE_MOCKS` | `true` | In-browser fixtures |

Demo login: `admin@roaddna.gov` / `AdminPassword123!`

## Spec-aligned structure

- `src/types/` — auth, cluster, workOrder
- `src/lib/api.ts` — Axios + Bearer interceptor
- `src/context/AuthContext.tsx`
- `src/app/(auth)/login`
- `src/app/(dashboard)/map|clusters|work-orders|reports`
- `src/components/map/Heatmap.tsx`
