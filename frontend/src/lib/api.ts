import axios from "axios";
import {
  createMockCitizenReport,
  createMockWorkOrder,
  getMockClusters,
  getMockReports,
  getMockWorkOrders,
  mockClusterDetails,
  mockLogin,
  MOCK_ADMIN,
  patchMockWorkOrder,
} from "@/mocks/data";
import type { ApiSuccess, PaginatedResponse, UserResponse } from "@/types/auth";
import type { ClusterDetailData, ClusterRow } from "@/types/cluster";
import type {
  CitizenReportPayload,
  CitizenReportRow,
  CreateWorkOrderPayload,
  WorkOrderRow,
  WorkOrderStatus,
} from "@/types/workOrder";

const USE_MOCKS =
  process.env.NEXT_PUBLIC_USE_MOCKS !== "false" &&
  process.env.NEXT_PUBLIC_USE_MOCKS !== "0";

/** Spec: NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1 */
const baseURL =
  process.env.NEXT_PUBLIC_API_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://localhost:5000/api/v1";

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

function paginate<T>(
  items: T[],
  page = 1,
  limit = 20,
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const start = (page - 1) * limit;
  return {
    success: true,
    data: items.slice(start, start + limit),
    pagination: { page, limit, total, totalPages },
  };
}

function unwrap<T>(payload: ApiSuccess<T> | T): T {
  if (
    payload &&
    typeof payload === "object" &&
    "success" in payload &&
    (payload as ApiSuccess<T>).success === true &&
    "data" in payload
  ) {
    return (payload as ApiSuccess<T>).data;
  }
  return payload as T;
}

export async function login(email: string, password: string) {
  if (USE_MOCKS) {
    await delay();
    return mockLogin(email, password);
  }
  const { data } = await api.post<ApiSuccess<ReturnType<typeof mockLogin>>>(
    "/auth/login",
    { email, password },
  );
  return unwrap(data);
}

export async function fetchMe(): Promise<UserResponse> {
  if (USE_MOCKS) {
    await delay(120);
    return MOCK_ADMIN.user;
  }
  const { data } = await api.get<ApiSuccess<UserResponse>>("/auth/me");
  return unwrap(data);
}

export async function fetchClusters(params?: {
  bbox?: string;
  status?: string;
  severity_min?: number;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<ClusterRow>> {
  if (USE_MOCKS) {
    await delay();
    return paginate(
      getMockClusters(params),
      params?.page ?? 1,
      params?.limit ?? 50,
    );
  }
  const { data } = await api.get<PaginatedResponse<ClusterRow>>("/clusters", {
    params,
  });
  return data;
}

export async function fetchCluster(id: string): Promise<ClusterDetailData> {
  if (USE_MOCKS) {
    await delay();
    const detail = mockClusterDetails[id];
    if (!detail) throw new Error(`Cluster ${id} not found`);
    return detail;
  }
  const { data } = await api.get<ApiSuccess<ClusterDetailData>>(
    `/clusters/${id}`,
  );
  return unwrap(data);
}

export async function fetchWorkOrders(params?: {
  status?: string;
  assigned_to?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<WorkOrderRow>> {
  if (USE_MOCKS) {
    await delay();
    return paginate(
      getMockWorkOrders(params?.status),
      params?.page ?? 1,
      params?.limit ?? 50,
    );
  }
  const { data } = await api.get<PaginatedResponse<WorkOrderRow>>(
    "/work-orders",
    { params },
  );
  return data;
}

export async function createWorkOrder(
  payload: CreateWorkOrderPayload,
): Promise<WorkOrderRow> {
  if (USE_MOCKS) {
    await delay();
    return createMockWorkOrder(payload);
  }
  const { data } = await api.post<ApiSuccess<WorkOrderRow>>(
    "/work-orders",
    payload,
  );
  return unwrap(data);
}

export async function updateWorkOrder(
  id: string,
  patch: { status?: WorkOrderStatus; assigned_to?: string | null },
): Promise<WorkOrderRow> {
  if (USE_MOCKS) {
    await delay();
    return patchMockWorkOrder(id, patch);
  }
  const { data } = await api.patch<ApiSuccess<WorkOrderRow>>(
    `/work-orders/${id}`,
    patch,
  );
  return unwrap(data);
}

export async function fetchCitizenReports(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<CitizenReportRow>> {
  if (USE_MOCKS) {
    await delay();
    return paginate(getMockReports(), params?.page ?? 1, params?.limit ?? 50);
  }
  const { data } = await api.get<PaginatedResponse<CitizenReportRow>>(
    "/citizen-reports",
    { params },
  );
  return data;
}

export async function postCitizenReport(
  payload: CitizenReportPayload,
): Promise<CitizenReportRow> {
  if (USE_MOCKS) {
    await delay();
    return createMockCitizenReport(payload);
  }
  const { data } = await api.post<ApiSuccess<CitizenReportRow>>(
    "/citizen-reports",
    payload,
  );
  return unwrap(data);
}

export function isMockMode() {
  return USE_MOCKS;
}
