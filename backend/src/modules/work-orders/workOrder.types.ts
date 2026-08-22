import { WorkOrderStatus } from "../../shared/constants";

export interface WorkOrderRow {
  work_order_id: string;
  cluster_id: string;
  assigned_to: string | null;
  priority_rank: number | null;
  status: WorkOrderStatus;
  created_at: Date;
  completed_at: Date | null;
  // Joined fields
  assigned_to_name?: string | null;
  cluster_severity?: number;
  cluster_latitude?: number;
  cluster_longitude?: number;
}

export interface WorkOrderFilterParams {
  status?: WorkOrderStatus;
  assigned_to?: string;
  page?: number;
  limit?: number;
}
