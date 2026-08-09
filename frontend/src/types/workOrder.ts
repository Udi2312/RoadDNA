export type WorkOrderStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "completed";

export interface WorkOrderRow {
  work_order_id: string;
  cluster_id: string;
  assigned_to: string | null;
  assigned_to_name: string | null;
  priority_rank: number;
  status: WorkOrderStatus;
  cluster_severity: number;
  cluster_latitude: number;
  cluster_longitude: number;
  created_at?: string;
  completed_at?: string | null;
}

export interface CreateWorkOrderPayload {
  cluster_id: string;
  assigned_to?: string | null;
  priority_rank?: number;
}

export interface CitizenReportRow {
  report_id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  description: string;
  photo_url: string | null;
  linked_cluster_id: string | null;
  created_at: string;
}

export interface CitizenReportPayload {
  device_id: string;
  latitude: number;
  longitude: number;
  description: string;
  photo_url: string | null;
}
