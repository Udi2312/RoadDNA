export interface CitizenReportRow {
  report_id: string;
  device_id: string;
  latitude: number;
  longitude: number;
  photo_url: string | null;
  description: string | null;
  linked_cluster_id: string | null;
  created_at: Date;
}

export interface CreateCitizenReportInput {
  device_id: string;
  latitude: number;
  longitude: number;
  photo_url?: string;
  description?: string;
}
