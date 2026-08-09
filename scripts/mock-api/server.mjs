/**
 * Phase 1/2 contract mock API (matches Shankar backend shapes).
 * Run: npm run mock-api
 * Listens on http://localhost:5000  (paths under /api/v1)
 */
import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 5000);

const admin = {
  admin_id: "2f74d8db-868c-4ac5-8432-ed906fd78adb",
  email: "admin@roaddna.gov",
  full_name: "Lead City Engineer",
  role: "admin",
};

const clusters = [
  {
    cluster_id: "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
    latitude: 28.6139,
    longitude: 77.209,
    report_count: 5,
    distinct_devices: 3,
    severity_score: 85.5,
    status: "unconfirmed",
    last_reported_at: "2026-08-07T20:20:00Z",
  },
  {
    cluster_id: "cl_library_bend",
    latitude: 28.5424,
    longitude: 77.1957,
    report_count: 5,
    distinct_devices: 3,
    severity_score: 91,
    status: "queued",
    last_reported_at: "2026-08-03T16:40:00Z",
  },
];

let workOrders = [
  {
    work_order_id: "51b6630f-8453-41c9-9ee0-ebf9955a203f",
    cluster_id: "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
    assigned_to: admin.admin_id,
    assigned_to_name: admin.full_name,
    priority_rank: 1,
    status: "open",
    cluster_severity: 85.5,
    cluster_latitude: 28.6139,
    cluster_longitude: 77.209,
    created_at: "2026-08-07T20:21:34Z",
    completed_at: null,
  },
];

let reports = [
  {
    report_id: "1917e2ce-aaaa-4bbb-8ccc-ddddeeeeffff",
    device_id: "dev_0001",
    latitude: 28.6139,
    longitude: 77.209,
    description: "Large pothole observed near market intersection",
    photo_url: null,
    linked_cluster_id: "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
    created_at: "2026-08-07T20:20:44Z",
  },
];

function send(res, status, body) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,OPTIONS",
  });
  res.end(JSON.stringify(body));
}

function ok(res, data, pagination) {
  send(res, 200, pagination ? { success: true, data, pagination } : { success: true, data });
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function paginate(items, url) {
  const page = Number(url.searchParams.get("page") || 1);
  const limit = Number(url.searchParams.get("limit") || 20);
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || "/", `http://localhost:${PORT}`);
  const path = url.pathname.replace(/\/$/, "") || "/";

  if (req.method === "OPTIONS") return send(res, 204, {});

  try {
    if (req.method === "POST" && path === "/api/v1/auth/login") {
      const body = await readJson(req);
      if (body.email === admin.email && body.password === "AdminPassword123!") {
        return ok(res, {
          token: "dev-jwt-" + randomUUID(),
          refreshToken: "dev-refresh-" + randomUUID(),
          user: admin,
        });
      }
      return send(res, 401, { success: false, error: "Invalid credentials" });
    }

    if (req.method === "GET" && path === "/api/v1/auth/me") {
      return ok(res, admin);
    }

    if (req.method === "GET" && path === "/api/v1/clusters") {
      let list = [...clusters];
      const status = url.searchParams.get("status");
      const severityMin = url.searchParams.get("severity_min");
      const bbox = url.searchParams.get("bbox");
      if (status) list = list.filter((c) => c.status === status);
      if (severityMin) list = list.filter((c) => c.severity_score >= Number(severityMin));
      if (bbox) {
        const [minLng, minLat, maxLng, maxLat] = bbox.split(",").map(Number);
        list = list.filter(
          (c) =>
            c.longitude >= minLng &&
            c.longitude <= maxLng &&
            c.latitude >= minLat &&
            c.latitude <= maxLat,
        );
      }
      const page = paginate(list, url);
      return ok(res, page.data, page.pagination);
    }

    if (req.method === "GET" && path.startsWith("/api/v1/clusters/")) {
      const id = path.split("/").pop();
      const cluster = clusters.find((c) => c.cluster_id === id);
      if (!cluster) return send(res, 404, { success: false, error: "Not found" });
      return ok(res, {
        cluster,
        events: [
          {
            event_id: randomUUID(),
            device_id: "dev_001",
            accel_magnitude: 18.2,
            predicted_label: "pothole",
            confidence: 0.95,
          },
        ],
      });
    }

    if (req.method === "GET" && path === "/api/v1/work-orders") {
      let list = [...workOrders];
      const status = url.searchParams.get("status");
      if (status) list = list.filter((w) => w.status === status);
      const page = paginate(list, url);
      return ok(res, page.data, page.pagination);
    }

    if (req.method === "POST" && path === "/api/v1/work-orders") {
      const body = await readJson(req);
      const cluster = clusters.find((c) => c.cluster_id === body.cluster_id);
      if (!cluster) return send(res, 404, { success: false, error: "Cluster not found" });
      cluster.status = "queued";
      const row = {
        work_order_id: randomUUID(),
        cluster_id: body.cluster_id,
        assigned_to: body.assigned_to ?? null,
        assigned_to_name: body.assigned_to === admin.admin_id ? admin.full_name : null,
        priority_rank: body.priority_rank ?? 1,
        status: "open",
        cluster_severity: cluster.severity_score,
        cluster_latitude: cluster.latitude,
        cluster_longitude: cluster.longitude,
        created_at: new Date().toISOString(),
        completed_at: null,
      };
      workOrders = [row, ...workOrders];
      return ok(res, row);
    }

    if (req.method === "PATCH" && path.startsWith("/api/v1/work-orders/")) {
      const id = path.split("/").pop();
      const body = await readJson(req);
      const idx = workOrders.findIndex((w) => w.work_order_id === id);
      if (idx < 0) return send(res, 404, { success: false, error: "Not found" });
      workOrders[idx] = {
        ...workOrders[idx],
        ...body,
        completed_at:
          body.status === "completed"
            ? new Date().toISOString()
            : workOrders[idx].completed_at,
      };
      if (body.status === "completed") {
        const c = clusters.find((x) => x.cluster_id === workOrders[idx].cluster_id);
        if (c) c.status = "fixed";
      }
      return ok(res, workOrders[idx]);
    }

    if (req.method === "GET" && path === "/api/v1/citizen-reports") {
      const page = paginate(reports, url);
      return ok(res, page.data, page.pagination);
    }

    if (req.method === "POST" && path === "/api/v1/citizen-reports") {
      const body = await readJson(req);
      const linked =
        clusters.find(
          (c) =>
            Math.hypot(c.latitude - body.latitude, c.longitude - body.longitude) <
            0.002,
        )?.cluster_id ?? null;
      const row = {
        report_id: randomUUID(),
        device_id: body.device_id,
        latitude: body.latitude,
        longitude: body.longitude,
        description: body.description,
        photo_url: body.photo_url ?? null,
        linked_cluster_id: linked,
        created_at: new Date().toISOString(),
      };
      reports = [row, ...reports];
      return ok(res, row);
    }

    if (req.method === "POST" && path === "/api/v1/sensor-events") {
      const body = await readJson(req);
      console.log("[sensor-events]", Array.isArray(body) ? `batch ${body.length}` : body.device_id);
      return ok(res, { event_id: randomUUID() });
    }

    return send(res, 404, { success: false, error: "Not found", path });
  } catch (err) {
    console.error(err);
    return send(res, 500, { success: false, error: "Server error" });
  }
});

server.listen(PORT, () => {
  console.log(`RoadDNA Phase 1/2 mock API on http://localhost:${PORT}/api/v1`);
});
