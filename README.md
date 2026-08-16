# RoadDNA

Crowdsourced road health monitoring — monorepo.

| Folder | Owner | Status |
|--------|-------|--------|
| `frontend/` | Udit | Phase 1–2 dashboard wired to backend |
| `mobile/` | Udit | Sensing + offline queue → backend ingest |
| `backend/` | Shankar | Express `/api/v1` on `:5000` |
| `ai-service/` | Shankar | FastAPI classify on `:8000` |
| `docs/` | Shared | API contract |

## Run the full stack (local)

**1. Database** — PostgreSQL + PostGIS with `DATABASE_URL` in `backend/.env`  
(seed admin + sample data via backend scripts)

**2. AI service**
```bash
cd ai-service
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload --port 8000
```

**3. Backend**
```bash
cd backend
cp .env.example .env   # set real DATABASE_URL + AI_SERVICE_URL=http://localhost:8000
npm install
npm run db:migrate && npm run db:seed:admin && npm run db:seed
npm run dev            # http://localhost:5000
```

**4. Frontend**
```bash
cd frontend
# .env.local already points at live API:
# NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
# NEXT_PUBLIC_USE_MOCKS=false
npm install && npm run dev
```
Login: `admin@roaddna.gov` / seed password from `backend/.env` (default `AdminPassword123!`)

**5. Mobile**
```bash
cd mobile
flutter run
# API base: http://10.0.2.2:5000/api/v1 (emulator) or http://<LAN-IP>:5000/api/v1
```

## Data flow

```
Phone sensors → POST /api/v1/sensor-events
             → Backend persists events
             → Backend calls AI POST /classify
             → classified_events stored
             → Clusters / work orders / reports on dashboard
```

Frontend never calls the AI service directly.

## Mock fallback

Set `NEXT_PUBLIC_USE_MOCKS=true` in `frontend/.env.local` to run the dashboard without backend.
