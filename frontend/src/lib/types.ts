export type UserRole = "admin" | "engineer" | "viewer";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}

export type ClusterStatus = "confirmed" | "candidate" | "resolved";

export interface Cluster {
  cluster_id: string;
  latitude: number;
  longitude: number;
  severity_score: number;
  report_count: number;
  status: ClusterStatus;
  last_reported_at: string;
}

export interface ClusterHistoryItem {
  timestamp: string;
  device_id: string;
  label: string;
  confidence: number;
}

export interface ClusterDetail extends Cluster {
  first_reported_at: string;
  device_count: number;
  avg_impact: number;
  history: ClusterHistoryItem[];
}

export interface ClustersResponse {
  clusters: Cluster[];
}

export type WorkOrderStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "fixed"
  | "rejected";

export interface WorkOrder {
  id: string;
  cluster_id: string;
  road_name: string;
  severity_score: number;
  report_count: number;
  priority: number;
  status: WorkOrderStatus;
  assigned_to: string | null;
  latitude: number;
  longitude: number;
  created_at: string;
  updated_at: string;
}

export interface WorkOrdersResponse {
  work_orders: WorkOrder[];
}

export interface AnalyticsSummary {
  totals: {
    total_reports: number;
    confirmed_potholes: number;
    critical_roads: number;
    active_devices: number;
    reports_today: number;
  };
  reports_per_day: { date: string; count: number }[];
  severity_breakdown: { label: string; count: number }[];
  area_comparisons: { area: string; health_pct: number; reports: number }[];
  road_health_trend: { date: string; health_pct: number }[];
  avg_repair_hours: number;
}

export interface SensorEventPayload {
  device_id: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  speed_kmh: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
}

export interface CitizenReportPayload {
  device_id: string;
  latitude: number;
  longitude: number;
  description: string;
  photo_base64: string | null;
}

export function severityLevel(
  score: number,
): "low" | "moderate" | "severe" {
  if (score < 4) return "low";
  if (score < 7) return "moderate";
  return "severe";
}

export function severityColor(score: number): string {
  const level = severityLevel(score);
  if (level === "low") return "#22c55e";
  if (level === "moderate") return "#eab308";
  return "#ef4444";
}
