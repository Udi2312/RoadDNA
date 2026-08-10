# RoadDNA API Contract — Phase 1 & 2 (aligned with Shankar backend)

Source of truth for frontend (`frontend/`) and mobile (`mobile/`).

**Base URL:** `http://localhost:5000/api/v1`  
**Frontend env:** `NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1`  
**Auth header:** `Authorization: Bearer <token>`

All success responses use:

```json
{ "success": true, "data": ... , "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 } }
```

(`pagination` only on list endpoints.)

When `NEXT_PUBLIC_USE_MOCKS=true`, the dashboard uses fixtures matching these shapes.

---

## Endpoints

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| `/auth/login` | POST | Public | Admin login → JWT + refresh |
| `/auth/me` | GET | Bearer | Current admin profile |
| `/clusters` | GET | Public | List clusters (`status`, `severity_min`, `bbox`, `page`, `limit`) |
| `/clusters/:id` | GET | Public | Cluster + linked events |
| `/work-orders` | GET | Bearer | List work orders |
| `/work-orders` | POST | Bearer (admin/engineer) | Create work order |
| `/work-orders/:id` | PATCH | Bearer (admin/engineer) | Update status |
| `/citizen-reports` | POST | Public | Manual citizen report |
| `/citizen-reports` | GET | Bearer* | List reports (dashboard; mock + expected) |
| `/sensor-events` | POST | Public | Mobile telemetry batch |

\* GET citizen-reports may be provided later by backend; frontend mocks it for the Phase 2 reports UI.

---

## POST `/auth/login`

```json
{ "email": "admin@roaddna.gov", "password": "AdminPassword123!" }
```

```json
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "refreshToken": "eyJ...",
    "user": {
      "admin_id": "2f74d8db-868c-4ac5-8432-ed906fd78adb",
      "email": "admin@roaddna.gov",
      "full_name": "Lead City Engineer",
      "role": "admin"
    }
  }
}
```

---

## GET `/clusters?bbox=&status=&severity_min=&page=1&limit=20`

`bbox` = `min_lng,min_lat,max_lng,max_lat`

Severity is **0–100**. UI bands: &lt;40 low, 40–70 moderate, ≥70 severe.

```json
{
  "success": true,
  "data": [
    {
      "cluster_id": "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "report_count": 5,
      "distinct_devices": 3,
      "severity_score": 85.5,
      "status": "unconfirmed",
      "last_reported_at": "2026-08-07T20:20:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1, "totalPages": 1 }
}
```

---

## GET `/clusters/:id`

```json
{
  "success": true,
  "data": {
    "cluster": { "cluster_id": "...", "severity_score": 85.5, "status": "queued" },
    "events": [
      {
        "event_id": "...",
        "device_id": "dev_001",
        "accel_magnitude": 18.2,
        "predicted_label": "pothole",
        "confidence": 0.95
      }
    ]
  }
}
```

---

## Work orders

Lifecycle: `open` → `assigned` → `in_progress` → `completed`  
Completing sets cluster status to `fixed`. Creating sets cluster to `queued`.

**POST `/work-orders`**

```json
{
  "cluster_id": "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
  "assigned_to": "2f74d8db-868c-4ac5-8432-ed906fd78adb",
  "priority_rank": 1
}
```

**PATCH `/work-orders/:id`**

```json
{ "status": "completed" }
```

---

## POST `/citizen-reports`

```json
{
  "device_id": "dev_0001",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "description": "Large pothole observed near market intersection",
  "photo_url": "https://example.com/photo.jpg"
}
```