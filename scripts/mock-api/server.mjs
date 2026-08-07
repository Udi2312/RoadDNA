/**
 * Lightweight contract mock API for local integration demos.
 * Run: node scripts/mock-api/server.mjs
 * Listens on http://localhost:3001
 */
import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 3001);

const clusters = [
  {
    cluster_id: "cl_north_gate",
    latitude: 28.5449,
    longitude: 77.1929,
    severity_score: 8.6,
    report_count: 6,
    status: "confirmed",
    last_reported_at: "2026-08-06T17:00:00Z",
    first_reported_at: "2026-07-20T10:00:00Z",
    device_count: 4,
    avg_impact: 20.6,
    history: [
      {
        timestamp: "2026-08-06T17:00:00Z",
        device_id: "dev_0001",
        label: "pothole",
        confidence: 0.91,
      },
    ],
  },
  {
    cluster_id: "cl_library_bend",
    latitude: 28.5424,
    longitude: 77.1957,
    severity_score: 9.1,
    report_count: 5,
    status: "confirmed",
    last_reported_at: "2026-08-03T16:40:00Z",
    first_reported_at: "2026-07-18T10:00:00Z",
    device_count: 3,
    avg_impact: 21.1,
    history: [],
  },
];

let workOrders = [
  {
    id: "wo_001",
    cluster_id: "cl_library_bend",
    road_name: "Library Bend",
    severity_score: 9.1,
    report_count: 5,
    priority: 1,
    status: "open",
    assigned_to: null,
    latitude: 28.5424,
    longitude: 77.1957,
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-01T09:00:00Z",
  },
  {
    id: "wo_002",
    cluster_id: "cl_north_gate",
    road_name: "North Gate Road",
    severity_score: 8.6,
    report_count: 6,
    priority: 2,
    status: "assigned",
    assigned_to: "eng_raya",
    latitude: 28.5449,
    longitude: 77.1929,
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-05T12:00:00Z",
  },
];

const analytics = {
  totals: {
    total_reports: 148,
    confirmed_potholes: 32,
    critical_roads: 7,
    active_devices: 18,
    reports_today: 9,
  },
  reports_per_day: [
    { date: "2026-08-01", count: 12 },
    { date: "2026-08-02", count: 18 },
    { date: "2026-08-03", count: 15 },
    { date: "2026-08-04", count: 22 },
    { date: "2026-08-05", count: 19 },
    { date: "2026-08-06", count: 9 },
  ],
  severity_breakdown: [
    { label: "low", count: 40 },
    { label: "moderate", count: 55 },
    { label: "severe", count: 32 },
  ],
  area_comparisons: [
    { area: "North Campus", health_pct: 72, reports: 28 },
    { area: "Hostel Zone", health_pct: 58, reports: 41 },
    { area: "Academic Block", health_pct: 81, reports: 19 },
  ],
  road_health_trend: [
    { date: "2026-08-01", health_pct: 68 },
    { date: "2026-08-06", health_pct: 62 },
  ],
  avg_repair_hours: 36.5,
};

function send(res, status, body) {
  const json = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  });
  res.end(json);
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const { pathname } = url;

  if (req.method === "OPTIONS") {
    return send(res, 204, {});
  }

  try {
    if (req.method === "POST" && pathname === "/api/v1/auth/login") {
      const body = await readJson(req);
      if (body.email === "admin@roaddna.local" && body.password === "password") {
        return send(res, 200, {
          token: "dev-jwt-" + randomUUID(),
          user: {
            id: "usr_001",
            email: body.email,
            name: "Campus Admin",
            role: "admin",
          },
        });
      }
      return send(res, 401, { error: "Invalid credentials" });
    }

    if (req.method === "GET" && pathname === "/api/v1/clusters") {
      return send(res, 200, { clusters });
    }

    if (req.method === "GET" && pathname.startsWith("/api/v1/clusters/")) {
      const id = pathname.split("/").pop();
      const cluster = clusters.find((c) => c.cluster_id === id);
      if (!cluster) return send(res, 404, { error: "Not found" });
      return send(res, 200, cluster);
    }

    if (req.method === "GET" && pathname === "/api/v1/work-orders") {
      const status = url.searchParams.get("status");
      const list = status
        ? workOrders.filter((w) => w.status === status)
        : workOrders;
      return send(res, 200, { work_orders: list });
    }

    if (req.method === "PATCH" && pathname.startsWith("/api/v1/work-orders/")) {
      const id = pathname.split("/").pop();
      const body = await readJson(req);
      const idx = workOrders.findIndex((w) => w.id === id);
      if (idx < 0) return send(res, 404, { error: "Not found" });
      workOrders[idx] = {
        ...workOrders[idx],
        ...body,
        updated_at: new Date().toISOString(),
      };
      return send(res, 200, workOrders[idx]);
    }

    if (req.method === "GET" && pathname === "/api/v1/analytics/summary") {
      return send(res, 200, analytics);
    }

    if (req.method === "POST" && pathname === "/api/v1/sensor-events") {
      const body = await readJson(req);
      console.log("[sensor-events]", body.device_id, body.timestamp);
      return send(res, 201, { ok: true, event_id: "evt_" + randomUUID() });
    }

    if (req.method === "POST" && pathname === "/api/v1/citizen-reports") {
      const body = await readJson(req);
      console.log("[citizen-reports]", body.device_id, body.description);
      return send(res, 201, { ok: true, report_id: "cr_" + randomUUID() });
    }

    return send(res, 404, { error: "Not found", path: pathname });
  } catch (err) {
    console.error(err);
    return send(res, 500, { error: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`RoadDNA mock API listening on http://localhost:${PORT}`);
  console.log("Contract endpoints under /api/v1/*");
});
