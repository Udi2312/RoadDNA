// ─── App-wide constants and enum-like types ───

export const PREDICTED_LABELS = [
  "pothole",
  "speed_breaker",
  "hard_brake",
  "normal",
] as const;
export type PredictedLabel = (typeof PREDICTED_LABELS)[number];

export const CLUSTER_STATUSES = [
  "unconfirmed",
  "confirmed",
  "queued",
  "in_progress",
  "fixed",
  "rejected",
] as const;
export type ClusterStatus = (typeof CLUSTER_STATUSES)[number];

export const WORK_ORDER_STATUSES = [
  "open",
  "assigned",
  "in_progress",
  "completed",
  "cancelled",
] as const;
export type WorkOrderStatus = (typeof WORK_ORDER_STATUSES)[number];

export const ADMIN_ROLES = ["engineer", "admin", "viewer"] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

// ─── Pagination defaults ───
export const MAX_BATCH_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
