import axios from "axios";
import {
  getMockWorkOrders,
  mockAnalytics,
  mockClusterDetails,
  mockClusters,
  MOCK_ADMIN,
  patchMockWorkOrder,
} from "@/mocks/data";
import type {
  AnalyticsSummary,
  CitizenReportPayload,
  ClusterDetail,
  ClustersResponse,
  LoginResponse,
  SensorEventPayload,
  WorkOrder,
  WorkOrdersResponse,
} from "@/lib/types";

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS !== "false" &&
  process.env.NEXT_PUBLIC_USE_MOCKS !== "0";

const baseURL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export const api = axios.create({
  baseURL,
  timeout: 15_000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("roaddna_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

function delay(ms = 280) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  if (USE_MOCKS) {
    await delay();
    if (
      email === MOCK_ADMIN.email &&
      password === MOCK_ADMIN.password
    ) {
      return { token: MOCK_ADMIN.token, user: MOCK_ADMIN.user };
    }
    throw new Error("Invalid email or password");
  }
  const { data } = await api.post<LoginResponse>("/api/v1/auth/login", {
    email,
    password,
  });
  return data;
}

export async function fetchClusters(bounds?: string): Promise<ClustersResponse> {
  if (USE_MOCKS) {
    await delay();
    let clusters = mockClusters;
    if (bounds) {
      const [south, west, north, east] = bounds.split(",").map(Number);
      if ([south, west, north, east].every((n) => !Number.isNaN(n))) {
        clusters = mockClusters.filter(
          (c) =>
            c.latitude >= south &&
            c.latitude <= north &&
            c.longitude >= west &&
            c.longitude <= east,
        );
      }
    }
    return { clusters };
  }
  const { data } = await api.get<ClustersResponse>("/api/v1/clusters", {
    params: bounds ? { bounds } : undefined,
  });
  return data;
}

export async function fetchCluster(id: string): Promise<ClusterDetail> {
  if (USE_MOCKS) {
    await delay();
    const detail = mockClusterDetails[id];
    if (!detail) throw new Error(`Cluster ${id} not found`);
    return detail;
  }
  const { data } = await api.get<ClusterDetail>(`/api/v1/clusters/${id}`);
  return data;
}

export async function fetchWorkOrders(
  status?: string,
): Promise<WorkOrdersResponse> {
  if (USE_MOCKS) {
    await delay();
    return { work_orders: getMockWorkOrders(status) };
  }
  const { data } = await api.get<WorkOrdersResponse>("/api/v1/work-orders", {
    params: status ? { status } : undefined,
  });
  return data;
}

export async function updateWorkOrder(
  id: string,
  patch: { status?: WorkOrder["status"]; assigned_to?: string | null },
): Promise<WorkOrder> {
  if (USE_MOCKS) {
    await delay();
    return patchMockWorkOrder(id, patch);
  }
  const { data } = await api.patch<WorkOrder>(`/api/v1/work-orders/${id}`, patch);
  return data;
}

export async function fetchAnalytics(): Promise<AnalyticsSummary> {
  if (USE_MOCKS) {
    await delay();
    return mockAnalytics;
  }
  const { data } = await api.get<AnalyticsSummary>("/api/v1/analytics/summary");
  return data;
}

export async function postSensorEvent(
  payload: SensorEventPayload,
): Promise<{ ok: boolean; event_id: string }> {
  if (USE_MOCKS) {
    await delay(120);
    return { ok: true, event_id: `evt_mock_${Date.now()}` };
  }
  const { data } = await api.post("/api/v1/sensor-events", payload);
  return data;
}

export async function postCitizenReport(
  payload: CitizenReportPayload,
): Promise<{ ok: boolean; report_id: string }> {
  if (USE_MOCKS) {
    await delay();
    return { ok: true, report_id: `cr_mock_${Date.now()}` };
  }
  const { data } = await api.post("/api/v1/citizen-reports", payload);
  return data;
}

export function isMockMode() {
  return USE_MOCKS;
}
