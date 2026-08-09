import type { LoginData, UserResponse } from "@/types/auth";
import type { ClusterDetailData, ClusterRow } from "@/types/cluster";
import type {
  CitizenReportPayload,
  CitizenReportRow,
  CreateWorkOrderPayload,
  WorkOrderRow,
  WorkOrderStatus,
} from "@/types/workOrder";

export const CAMPUS_CENTER = { lat: 28.6139, lng: 77.209 };

export const MOCK_ADMIN = {
  email: "admin@roaddna.gov",
  password: "AdminPassword123!",
  token: "mock-jwt-access",
  refreshToken: "mock-jwt-refresh",
  user: {
    admin_id: "2f74d8db-868c-4ac5-8432-ed906fd78adb",
    email: "admin@roaddna.gov",
    full_name: "Lead City Engineer",
    role: "admin" as const,
  } satisfies UserResponse,
};

export const mockClusters: ClusterRow[] = [
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
    cluster_id: "cl_north_gate",
    latitude: 28.5449,
    longitude: 77.1929,
    report_count: 6,
    distinct_devices: 4,
    severity_score: 86,
    status: "queued",
    last_reported_at: "2026-08-06T17:00:00Z",
  },
  {
    cluster_id: "cl_hostel_loop",
    latitude: 28.547,
    longitude: 77.1905,
    report_count: 4,
    distinct_devices: 3,
    severity_score: 72,
    status: "confirmed",
    last_reported_at: "2026-08-06T17:00:00Z",
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
  {
    cluster_id: "cl_sports_complex",
    latitude: 28.5497,
    longitude: 77.1942,
    report_count: 3,
    distinct_devices: 2,
    severity_score: 54,
    status: "confirmed",
    last_reported_at: "2026-08-04T12:20:00Z",
  },
  {
    cluster_id: "cl_east_parking",
    latitude: 28.5462,
    longitude: 77.1962,
    report_count: 3,
    distinct_devices: 2,
    severity_score: 31,
    status: "unconfirmed",
    last_reported_at: "2026-08-06T13:40:00Z",
  },
];

export const mockClusterDetails: Record<string, ClusterDetailData> =
  Object.fromEntries(
    mockClusters.map((c) => [
      c.cluster_id,
      {
        cluster: {
          ...c,
          first_reported_at: "2026-07-20T10:00:00Z",
        },
        events: Array.from({ length: Math.min(c.report_count, 4) }, (_, i) => ({
          event_id: `evt_${c.cluster_id}_${i}`,
          device_id: `dev_${String(i + 1).padStart(3, "0")}`,
          accel_magnitude: 12 + c.severity_score / 10 + i,
          predicted_label: c.severity_score >= 40 ? "pothole" : "normal",
          confidence: 0.72 + i * 0.05,
          timestamp: new Date(
            Date.parse(c.last_reported_at) - i * 86_400_000,
          ).toISOString(),
        })),
      },
    ]),
  );

let workOrderStore: WorkOrderRow[] = [
  {
    work_order_id: "51b6630f-8453-41c9-9ee0-ebf9955a203f",
    cluster_id: "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
    assigned_to: MOCK_ADMIN.user.admin_id,
    assigned_to_name: MOCK_ADMIN.user.full_name,
    priority_rank: 1,
    status: "open",
    cluster_severity: 85.5,
    cluster_latitude: 28.6139,
    cluster_longitude: 77.209,
    created_at: "2026-08-07T20:21:34Z",
    completed_at: null,
  },
  {
    work_order_id: "wo_north_gate",
    cluster_id: "cl_north_gate",
    assigned_to: MOCK_ADMIN.user.admin_id,
    assigned_to_name: MOCK_ADMIN.user.full_name,
    priority_rank: 2,
    status: "assigned",
    cluster_severity: 86,
    cluster_latitude: 28.5449,
    cluster_longitude: 77.1929,
    created_at: "2026-08-05T12:00:00Z",
    completed_at: null,
  },
  {
    work_order_id: "wo_library",
    cluster_id: "cl_library_bend",
    assigned_to: "eng_kabir",
    assigned_to_name: "Kabir Singh",
    priority_rank: 3,
    status: "in_progress",
    cluster_severity: 91,
    cluster_latitude: 28.5424,
    cluster_longitude: 77.1957,
    created_at: "2026-08-04T09:00:00Z",
    completed_at: null,
  },
  {
    work_order_id: "wo_sports",
    cluster_id: "cl_sports_complex",
    assigned_to: "eng_meera",
    assigned_to_name: "Meera Joshi",
    priority_rank: 4,
    status: "completed",
    cluster_severity: 54,
    cluster_latitude: 28.5497,
    cluster_longitude: 77.1942,
    created_at: "2026-08-01T09:00:00Z",
    completed_at: "2026-08-06T15:00:00Z",
  },
];

let reportStore: CitizenReportRow[] = [
  {
    report_id: "1917e2ce-aaaa-4bbb-8ccc-ddddeeeeffff",
    device_id: "dev_0001",
    latitude: 28.6139,
    longitude: 77.209,
    description: "Large pothole observed near market intersection",
    photo_url: "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=400",
    linked_cluster_id: "63a64ab2-5a25-49d4-87d6-7820bfb256c2",
    created_at: "2026-08-07T20:20:44Z",
  },
  {
    report_id: "cr_hostel_01",
    device_id: "dev_0005",
    latitude: 28.547,
    longitude: 77.1905,
    description: "Deep crack on hostel loop after rain",
    photo_url: null,
    linked_cluster_id: "cl_hostel_loop",
    created_at: "2026-08-06T11:10:00Z",
  },
  {
    report_id: "cr_unlinked_01",
    device_id: "dev_0012",
    latitude: 28.55,
    longitude: 77.2,
    description: "Bump near south parking — needs inspection",
    photo_url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?w=400",
    linked_cluster_id: null,
    created_at: "2026-08-05T08:00:00Z",
  },
];

export function getMockClusters(params?: {
  bbox?: string;
  status?: string;
  severity_min?: number;
}): ClusterRow[] {
  let list = [...mockClusters];
  if (params?.status) {
    list = list.filter((c) => c.status === params.status);
  }
  if (params?.severity_min != null) {
    list = list.filter((c) => c.severity_score >= params.severity_min!);
  }
  if (params?.bbox) {
    const [minLng, minLat, maxLng, maxLat] = params.bbox.split(",").map(Number);
    if ([minLng, minLat, maxLng, maxLat].every((n) => !Number.isNaN(n))) {
      list = list.filter(
        (c) =>
          c.longitude >= minLng &&
          c.longitude <= maxLng &&
          c.latitude >= minLat &&
          c.latitude <= maxLat,
      );
    }
  }
  return list;
}

export function getMockWorkOrders(status?: string): WorkOrderRow[] {
  const sorted = [...workOrderStore].sort(
    (a, b) => a.priority_rank - b.priority_rank,
  );
  if (!status) return sorted;
  return sorted.filter((w) => w.status === status);
}

export function patchMockWorkOrder(
  id: string,
  patch: { status?: WorkOrderStatus; assigned_to?: string | null },
): WorkOrderRow {
  const idx = workOrderStore.findIndex((w) => w.work_order_id === id);
  if (idx < 0) throw new Error(`Work order ${id} not found`);
  const nextStatus = patch.status ?? workOrderStore[idx].status;
  workOrderStore[idx] = {
    ...workOrderStore[idx],
    ...patch,
    status: nextStatus,
    completed_at:
      nextStatus === "completed"
        ? new Date().toISOString()
        : workOrderStore[idx].completed_at,
    assigned_to_name:
      patch.assigned_to === MOCK_ADMIN.user.admin_id
        ? MOCK_ADMIN.user.full_name
        : patch.assigned_to
          ? patch.assigned_to
          : workOrderStore[idx].assigned_to_name,
  };
  return workOrderStore[idx];
}

export function createMockWorkOrder(
  payload: CreateWorkOrderPayload,
): WorkOrderRow {
  const cluster = mockClusters.find((c) => c.cluster_id === payload.cluster_id);
  if (!cluster) throw new Error("Cluster not found");
  const row: WorkOrderRow = {
    work_order_id: `wo_${crypto.randomUUID?.() ?? Date.now()}`,
    cluster_id: payload.cluster_id,
    assigned_to: payload.assigned_to ?? null,
    assigned_to_name:
      payload.assigned_to === MOCK_ADMIN.user.admin_id
        ? MOCK_ADMIN.user.full_name
        : payload.assigned_to ?? null,
    priority_rank: payload.priority_rank ?? workOrderStore.length + 1,
    status: "open",
    cluster_severity: cluster.severity_score,
    cluster_latitude: cluster.latitude,
    cluster_longitude: cluster.longitude,
    created_at: new Date().toISOString(),
    completed_at: null,
  };
  workOrderStore = [row, ...workOrderStore];
  cluster.status = "queued";
  return row;
}

export function getMockReports(): CitizenReportRow[] {
  return [...reportStore].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}

export function createMockCitizenReport(
  payload: CitizenReportPayload,
): CitizenReportRow {
  const linked =
    mockClusters.find(
      (c) =>
        Math.hypot(c.latitude - payload.latitude, c.longitude - payload.longitude) <
        0.002,
    )?.cluster_id ?? null;
  const row: CitizenReportRow = {
    report_id: `cr_${Date.now()}`,
    device_id: payload.device_id,
    latitude: payload.latitude,
    longitude: payload.longitude,
    description: payload.description,
    photo_url: payload.photo_url,
    linked_cluster_id: linked,
    created_at: new Date().toISOString(),
  };
  reportStore = [row, ...reportStore];
  return row;
}

export function mockLogin(email: string, password: string): LoginData {
  if (email === MOCK_ADMIN.email && password === MOCK_ADMIN.password) {
    return {
      token: MOCK_ADMIN.token,
      refreshToken: MOCK_ADMIN.refreshToken,
      user: MOCK_ADMIN.user,
    };
  }
  throw new Error("Invalid email or password");
}
