# RoadDNA API Contract

Source of truth for frontend (`frontend/`), mobile (`mobile/`), and backend (`backend/`).  
Update this file together whenever an endpoint shape changes.

Base URL (local): `http://localhost:3001`  
Frontend env: `NEXT_PUBLIC_API_BASE_URL`  
Mobile env: `API_BASE_URL`

When `NEXT_PUBLIC_USE_MOCKS=true` (default), the dashboard serves fixtures that match these shapes exactly.

---

## Endpoints

| Endpoint | Method | Purpose | Owner |
|----------|--------|---------|-------|
| `/api/v1/auth/login` | POST | Admin/engineer login | Shanky |
| `/api/v1/clusters?bounds=` | GET | Clusters within map viewport | Shanky |
| `/api/v1/clusters/:id` | GET | Single cluster detail | Shanky |
| `/api/v1/work-orders?status=` | GET | Repair priority queue | Shanky |
| `/api/v1/work-orders/:id` | PATCH | Update repair status | Shanky |
| `/api/v1/analytics/summary` | GET | Trends for charts | Shanky |
| `/api/v1/sensor-events` | POST | Mobile detected event | Shanky |
| `/api/v1/citizen-reports` | POST | Manual report with photo | Shanky |

---

## POST `/api/v1/auth/login`

**Request**

```json
{
  "email": "admin@roaddna.local",
  "password": "password"
}
```

**Response**

```json
{
  "token": "jwt-token-here",
  "user": {
    "id": "usr_001",
    "email": "admin@roaddna.local",
    "name": "Campus Admin",
    "role": "admin"
  }
}
```

---

## POST `/api/v1/sensor-events`

```json
{
  "device_id": "dev_0033",
  "timestamp": "2026-08-06T09:15:40Z",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "speed_kmh": 34.5,
  "accel_x": -0.42,
  "accel_y": 0.18,
  "accel_z": -21.3,
  "gyro_x": 0.06,
  "gyro_y": -0.12,
  "gyro_z": 0.02
}
```

**Response:** `{ "ok": true, "event_id": "evt_uuid" }`

---

## GET `/api/v1/clusters?bounds=`

`bounds` = `south,west,north,east` (optional).

```json
{
  "clusters": [
    {
      "cluster_id": "uuid",
      "latitude": 28.6142,
      "longitude": 77.2095,
      "severity_score": 8.4,
      "report_count": 12,
      "status": "confirmed",
      "last_reported_at": "2026-08-05T18:30:00Z"
    }
  ]
}
```

Severity guide for UI coloring:

- `severity_score < 4` → good / low (green)
- `4 <= severity_score < 7` → moderate (yellow)
- `severity_score >= 7` → severe (red)

---

## GET `/api/v1/clusters/:id`

```json
{
  "cluster_id": "uuid",
  "latitude": 28.6142,
  "longitude": 77.2095,
  "severity_score": 8.4,
  "report_count": 12,
  "status": "confirmed",
  "last_reported_at": "2026-08-05T18:30:00Z",
  "first_reported_at": "2026-07-20T10:00:00Z",
  "device_count": 5,
  "avg_impact": 18.2,
  "history": [
    {
      "timestamp": "2026-08-05T18:30:00Z",
      "device_id": "dev_0033",
      "label": "pothole",
      "confidence": 0.91
    }
  ]
}
```

---

## GET `/api/v1/work-orders?status=`

`status` optional: `open` | `assigned` | `in_progress` | `fixed` | `rejected`

```json
{
  "work_orders": [
    {
      "id": "wo_001",
      "cluster_id": "uuid",
      "road_name": "North Gate Road",
      "severity_score": 8.4,
      "report_count": 12,
      "priority": 1,
      "status": "open",
      "assigned_to": null,
      "latitude": 28.6142,
      "longitude": 77.2095,
      "created_at": "2026-08-01T09:00:00Z",
      "updated_at": "2026-08-01T09:00:00Z"
    }
  ]
}
```

---

## PATCH `/api/v1/work-orders/:id`

```json
{
  "status": "assigned",
  "assigned_to": "eng_raya"
}
```

Allowed `status`: `open` | `assigned` | `in_progress` | `fixed` | `rejected`

**Response:** updated work-order object.

---

## GET `/api/v1/analytics/summary`

```json
{
  "totals": {
    "total_reports": 148,
    "confirmed_potholes": 32,
    "critical_roads": 7,
    "active_devices": 18,
    "reports_today": 9
  },
  "reports_per_day": [
    { "date": "2026-08-01", "count": 12 }
  ],
  "severity_breakdown": [
    { "label": "low", "count": 40 },
    { "label": "moderate", "count": 55 },
    { "label": "severe", "count": 32 }
  ],
  "area_comparisons": [
    { "area": "North Campus", "health_pct": 72, "reports": 28 }
  ],
  "road_health_trend": [
    { "date": "2026-08-01", "health_pct": 68 }
  ],
  "avg_repair_hours": 36.5
}
```

---

## POST `/api/v1/citizen-reports`

Multipart preferred; JSON mock accepted:

```json
{
  "device_id": "dev_0033",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "description": "Large pothole near hostel gate",
  "photo_base64": null
}
```

**Response:** `{ "ok": true, "report_id": "cr_uuid" }`
