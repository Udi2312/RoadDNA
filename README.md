# RoadDNA

AI-powered crowdsourced road health monitoring. Monorepo for a 2-person team:

| Folder | Owner | Role |
|--------|-------|------|
| `frontend/` | Udit | Municipality Next.js dashboard |
| `mobile/` | Udit | Flutter citizen sensing app |
| `backend/` | Shanky | APIs, DB, AI, clustering |
| `docs/` | Shared | API contract |
| `sample-data/` | Shared | Demo CSV |

## Demo scope

One campus-scale area (mock data centered near South Delhi campus coords), not a whole city.

## Quick start — Dashboard (Udit)

```bash
cd frontend
cp .env.example .env.local   # already uses mocks by default
npm install
npm run dev
```

Open http://localhost:3000 → login with:

- Email: `admin@roaddna.local`
- Password: `password`

### Local HTTP integration (without Shanky’s backend yet)

```bash
# terminal 1 — contract-compatible mock API
npm run mock-api

# terminal 2 — dashboard against real HTTP
# set in frontend/.env.local:
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
# NEXT_PUBLIC_USE_MOCKS=false
cd frontend && npm run dev
```

Mobile can POST sensor events / citizen reports to the same `http://localhost:3001` (use `http://10.0.2.2:3001` on Android emulator).

### Swap mocks for Shanky’s real API

In `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_USE_MOCKS=false
```

UI code already calls the contract endpoints in [`docs/api-contract.md`](docs/api-contract.md). No page rewrites needed if the contract holds.

### Dashboard pages

1. `/login` — JWT admin login (mock or real)
2. `/dashboard` — stat cards + map preview + charts
3. `/dashboard/map` — interactive Leaflet heatmap/clusters
4. `/dashboard/queue` — repair priority queue (assign / in-progress / fixed / reject)
5. `/dashboard/clusters/[id]` — cluster detail + history
6. `/dashboard/analytics` — trends and area comparisons

## Quick start — Mobile (Udit)

Flutter SDK required. If platforms are missing:

```bash
cd mobile
flutter create . --project-name roaddna_mobile
# Re-apply permissions from android/PERMISSIONS.md if overwritten
flutter pub get
flutter run
```

App features:

- Sensor permissions + GPS status
- Start/Stop monitoring with **local spike detection**
- Offline queue (SharedPreferences) + sync when online
- Manual photo report → `POST /api/v1/citizen-reports`
- API base URL editable in settings (emulator default `http://10.0.2.2:3001`)

## Demo walkthrough (campus)

1. Sign into the dashboard with the demo admin account (mock mode).
2. Open **Live Map** — green / yellow / red clusters from sample CSV groupings.
3. Click a severe cluster → open detail (report count, history).
4. Open **Repair Queue** — assign an engineer, mark in progress, then fixed.
5. Open **Analytics** — reports/day, severity mix, area health.
6. On a device/emulator, start monitoring, bump the phone to queue spikes, tap sync.
7. When backend is live, set `NEXT_PUBLIC_USE_MOCKS=false` and point mobile API URL at Shanky’s server — live trips should feed clusters.

## Contract first

Keep [`docs/api-contract.md`](docs/api-contract.md) in sync. Sample sensor CSV: [`sample-data/sample_sensor_events.csv`](sample-data/sample_sensor_events.csv).
