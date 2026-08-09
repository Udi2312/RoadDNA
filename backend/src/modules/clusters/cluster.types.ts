import { ClusterStatus } from "../../shared/constants";

export interface ClusterRow {
  cluster_id: string;
  center_location: string;
  latitude: number;
  longitude: number;
  report_count: number;
  distinct_devices: number;
  severity_score: number;
  status: ClusterStatus;
  first_reported_at: Date;
  last_reported_at: Date;
  updated_at: Date;
}

export interface ClusterDetailResponse {
  cluster: ClusterRow;
  events: Array<{
    event_id: string;
    device_id: string;
    recorded_at: Date;
    latitude: number;
    longitude: number;
    speed_kmh: number | null;
    accel_magnitude: number;
    predicted_label?: string;
    confidence?: number;
  }>;
}

export interface ClusterFilterParams {
  status?: ClusterStatus;
  severity_min?: number;
  bbox?: string; // min_lng,min_lat,max_lng,max_lat
  page?: number;
  limit?: number;
}
