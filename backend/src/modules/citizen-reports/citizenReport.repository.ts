import { queryWithRetry } from "../../config/database";
import { CitizenReportRow, CreateCitizenReportInput } from "./citizenReport.types";
import { PaginationParams } from "../../shared/utils/pagination";

export async function findNearestCluster(
  latitude: number,
  longitude: number,
  distanceMeters = 25
): Promise<string | null> {
  const query = `
    SELECT cluster_id
    FROM pothole_clusters
    WHERE ST_DWithin(
      center_location,
      ST_MakePoint($1, $2)::geography,
      $3
    )
    ORDER BY ST_Distance(center_location, ST_MakePoint($1, $2)::geography) ASC
    LIMIT 1
  `;
  const result = await queryWithRetry<{ cluster_id: string }>(query, [longitude, latitude, distanceMeters]);
  return result.rows[0]?.cluster_id || null;
}

export async function createCitizenReport(
  input: CreateCitizenReportInput,
  linkedClusterId: string | null
): Promise<CitizenReportRow> {
  const query = `
    INSERT INTO citizen_reports (device_id, location, photo_url, description, linked_cluster_id)
    VALUES ($1, ST_MakePoint($2, $3)::geography, $4, $5, $6)
    RETURNING report_id, device_id,
              ST_Y(location::geometry) AS latitude,
              ST_X(location::geometry) AS longitude,
              photo_url, description, linked_cluster_id, created_at
  `;
  const values = [
    input.device_id,
    input.longitude,
    input.latitude,
    input.photo_url || null,
    input.description || null,
    linkedClusterId,
  ];

  const result = await queryWithRetry<CitizenReportRow>(query, values);
  return result.rows[0];
}

export async function findCitizenReports(
  filters: { device_id?: string; linked_cluster_id?: string },
  pagination: PaginationParams
): Promise<{ rows: CitizenReportRow[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.device_id) {
    conditions.push(`device_id = $${idx++}`);
    values.push(filters.device_id);
  }
  if (filters.linked_cluster_id) {
    conditions.push(`linked_cluster_id = $${idx++}`);
    values.push(filters.linked_cluster_id);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await queryWithRetry<{ total: number }>(`SELECT COUNT(*)::int AS total FROM citizen_reports ${where}`, values);
  const total = countRes.rows[0]?.total || 0;

  const dataQuery = `
    SELECT report_id, device_id,
           ST_Y(location::geometry) AS latitude,
           ST_X(location::geometry) AS longitude,
           photo_url, description, linked_cluster_id, created_at
    FROM citizen_reports
    ${where}
    ORDER BY created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  const dataValues = [...values, pagination.limit, pagination.offset];

  const dataRes = await queryWithRetry<CitizenReportRow>(dataQuery, dataValues);

  return { rows: dataRes.rows, total };
}
