# RoadDNA

AI-powered crowdsourced road health monitoring. Monorepo for a 2-person team:

| Folder | Owner | Role |
|--------|-------|------|
| `frontend/` | Udit | Municipality Next.js dashboard |
| `mobile/` | Udit | Flutter citizen sensing app |
| `backend/` | Shankar | APIs, DB, AI, clustering |
| `docs/` | Shared | API contract (Phase 1 & 2) |
| `sample-data/` | Shared | Demo CSV |

## Quick start — Dashboard (Udit)

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 → login:

- Email: `admin@roaddna.gov`
- Password: `AdminPassword123!`

### Pages (Phase 1 & 2 spec)

| Route | Purpose |
|-------|---------|
| `/login` | JWT admin login |
| `/map` | GIS heatmap (`GET /clusters?bbox=...`) |
| `/clusters` | Paginated cluster table |
| `/clusters/[id]` | Detail + sensor events + create work order |
| `/work-orders` | Kanban (open → assigned → in_progress → completed) |
| `/reports` | Citizen reports grid + photo modal |

### Wire to Shankar’s backend

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_USE_MOCKS=false
```

Or run the local contract mock: `npm run mock-api` (port 5000).

## Mobile

Default API base: `http://10.0.2.2:5000/api/v1` (Android emulator).

```bash
cd mobile
flutter pub get
flutter run
```

## Contract

See [`docs/api-contract.md`](docs/api-contract.md) — must stay aligned with Shankar’s Phase 1/2 API.
