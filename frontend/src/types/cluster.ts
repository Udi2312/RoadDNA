export type ClusterStatus =
  | "unconfirmed"
  | "confirmed"
  | "queued"
  | "fixed"
  | "candidate";

export interface ClusterRow {
  cluster_id: string;
  latitude: number;
  longitude: number;
  report_count: number;
  distinct_devices: number;
  severity_score: number;
  status: ClusterStatus | string;
  last_reported_at: string;
}

export interface ClusterEventRow {
  event_id: string;
  device_id: string;
  accel_magnitude: number;
  predicted_label: string;
  confidence: number;
  timestamp?: string;
}

export interface ClusterDetailData {
  cluster: ClusterRow & {
    first_reported_at?: string;
  };
  events: ClusterEventRow[];
}

/** Severity is 0–100 from Phase 1/2 backend. */
export function severityLevel(
  score: number,
): "low" | "moderate" | "severe" {
  if (score < 40) return "low";
  if (score < 70) return "moderate";
  return "severe";
}

export function severityColor(score: number): string {
  const level = severityLevel(score);
  if (level === "low") return "#22c55e";
  if (level === "moderate") return "#eab308";
  return "#ef4444";
}

export function severityTone(
  score: number,
): "green" | "yellow" | "red" {
  const level = severityLevel(score);
  if (level === "low") return "green";
  if (level === "moderate") return "yellow";
  return "red";
}
