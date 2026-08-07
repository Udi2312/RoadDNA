import type {
  AnalyticsSummary,
  Cluster,
  ClusterDetail,
  WorkOrder,
  WorkOrderStatus,
} from "@/lib/types";

/** Campus demo center (approx. South Delhi / IIT-style campus coords). */
export const CAMPUS_CENTER = { lat: 28.5455, lng: 77.1935 };

/**
 * Clusters derived by grouping nearby sample_sensor_events.csv rows
 * (~15–20m fake proximity) into confirmed pothole clusters.
 */
export const mockClusters: Cluster[] = [
  {
    cluster_id: "cl_north_gate",
    latitude: 28.5449,
    longitude: 77.1929,
    severity_score: 8.6,
    report_count: 6,
    status: "confirmed",
    last_reported_at: "2026-08-06T17:00:00Z",
  },
  {
    cluster_id: "cl_hostel_loop",
    latitude: 28.5470,
    longitude: 77.1905,
    severity_score: 7.2,
    report_count: 4,
    status: "confirmed",
    last_reported_at: "2026-08-06T17:00:00Z",
  },
  {
    cluster_id: "cl_library_bend",
    latitude: 28.5424,
    longitude: 77.1957,
    severity_score: 9.1,
    report_count: 5,
    status: "confirmed",
    last_reported_at: "2026-08-03T16:40:00Z",
  },
  {
    cluster_id: "cl_sports_complex",
    latitude: 28.5497,
    longitude: 77.1942,
    severity_score: 5.4,
    report_count: 3,
    status: "confirmed",
    last_reported_at: "2026-08-04T12:20:00Z",
  },
  {
    cluster_id: "cl_south_service",
    latitude: 28.5412,
    longitude: 77.1912,
    severity_score: 6.8,
    report_count: 3,
    status: "confirmed",
    last_reported_at: "2026-08-05T08:10:00Z",
  },
  {
    cluster_id: "cl_academic_ring",
    latitude: 28.5484,
    longitude: 77.1972,
    severity_score: 7.8,
    report_count: 3,
    status: "confirmed",
    last_reported_at: "2026-08-05T15:30:00Z",
  },
  {
    cluster_id: "cl_main_avenue",
    latitude: 28.5437,
    longitude: 77.1940,
    severity_score: 4.2,
    report_count: 3,
    status: "candidate",
    last_reported_at: "2026-08-06T09:15:40Z",
  },
  {
    cluster_id: "cl_east_parking",
    latitude: 28.5462,
    longitude: 77.1962,
    severity_score: 3.1,
    report_count: 3,
    status: "candidate",
    last_reported_at: "2026-08-06T13:40:00Z",
  },
];

const roadNames: Record<string, string> = {
  cl_north_gate: "North Gate Road",
  cl_hostel_loop: "Hostel Loop",
  cl_library_bend: "Library Bend",
  cl_sports_complex: "Sports Complex Approach",
  cl_south_service: "South Service Lane",
  cl_academic_ring: "Academic Ring Road",
  cl_main_avenue: "Main Avenue",
  cl_east_parking: "East Parking Access",
};

export const mockClusterDetails: Record<string, ClusterDetail> =
  Object.fromEntries(
    mockClusters.map((c) => [
      c.cluster_id,
      {
        ...c,
        first_reported_at: "2026-07-20T10:00:00Z",
        device_count: Math.max(2, Math.ceil(c.report_count * 0.7)),
        avg_impact: 12 + c.severity_score,
        history: Array.from({ length: Math.min(c.report_count, 4) }, (_, i) => ({
          timestamp: new Date(
            Date.parse(c.last_reported_at) - i * 86_400_000,
          ).toISOString(),
          device_id: `dev_${String(i + 1).padStart(4, "0")}`,
          label: c.severity_score >= 4 ? "pothole" : "candidate",
          confidence: 0.72 + (c.severity_score / 50),
        })),
      },
    ]),
  );

let workOrderStore: WorkOrder[] = mockClusters
  .filter((c) => c.status === "confirmed")
  .map((c, index) => {
    const status: WorkOrderStatus =
      index === 0 ? "assigned" : index === 1 ? "in_progress" : "open";
    return {
      id: `wo_${String(index + 1).padStart(3, "0")}`,
      cluster_id: c.cluster_id,
      road_name: roadNames[c.cluster_id] ?? c.cluster_id,
      severity_score: c.severity_score,
      report_count: c.report_count,
      priority: index + 1,
      status,
      assigned_to: index === 0 ? "eng_raya" : index === 1 ? "eng_kabir" : null,
      latitude: c.latitude,
      longitude: c.longitude,
      created_at: "2026-08-01T09:00:00Z",
      updated_at: "2026-08-05T12:00:00Z",
    };
  })
  .sort((a, b) => b.severity_score - a.severity_score)
  .map((wo, index) => ({ ...wo, priority: index + 1 }));

export function getMockWorkOrders(status?: string): WorkOrder[] {
  const sorted = [...workOrderStore].sort((a, b) => a.priority - b.priority);
  if (!status) return sorted;
  return sorted.filter((w) => w.status === status);
}

export function patchMockWorkOrder(
  id: string,
  patch: Partial<Pick<WorkOrder, "status" | "assigned_to">>,
): WorkOrder {
  const idx = workOrderStore.findIndex((w) => w.id === id);
  if (idx < 0) throw new Error(`Work order ${id} not found`);
  workOrderStore[idx] = {
    ...workOrderStore[idx],
    ...patch,
    updated_at: new Date().toISOString(),
  };
  return workOrderStore[idx];
}

export const mockAnalytics: AnalyticsSummary = {
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
    { area: "Sports Complex", health_pct: 65, reports: 24 },
    { area: "South Gate", health_pct: 49, reports: 36 },
  ],
  road_health_trend: [
    { date: "2026-08-01", health_pct: 68 },
    { date: "2026-08-02", health_pct: 66 },
    { date: "2026-08-03", health_pct: 64 },
    { date: "2026-08-04", health_pct: 63 },
    { date: "2026-08-05", health_pct: 61 },
    { date: "2026-08-06", health_pct: 62 },
  ],
  avg_repair_hours: 36.5,
};

export const MOCK_ADMIN = {
  email: "admin@roaddna.local",
  password: "password",
  token: "mock-jwt-campus-admin",
  user: {
    id: "usr_001",
    email: "admin@roaddna.local",
    name: "Campus Admin",
    role: "admin" as const,
  },
};
