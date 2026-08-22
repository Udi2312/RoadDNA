import { queryWithRetry } from "../../config/database";
import { ClusterRow, ClusterFilterParams } from "./cluster.types";
import { PaginationParams } from "../../shared/utils/pagination";

export async function findClusters(
  filters: ClusterFilterParams,
  pagination: PaginationParams
): Promise<{ rows: ClusterRow[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`status = $${idx++}`);
    values.push(filters.status);
  }

  if (filters.severity_min !== undefined && !isNaN(filters.severity_min)) {
    conditions.push(`severity_score >= $${idx++}`);
    values.push(filters.severity_min);
  }

  if (filters.bbox) {
    const parts = filters.bbox.split(",").map(Number);
    if (parts.length === 4 && !parts.some(isNaN)) {
      const [minLng, minLat, maxLng, maxLat] = parts;
      conditions.push(
        `center_location::geometry && ST_MakeEnvelope($${idx++}, $${idx++}, $${idx++}, $${idx++}, 4326)`
      );
      values.push(minLng, minLat, maxLng, maxLat);
    }
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countResult = await queryWithRetry<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM pothole_clusters ${where}`,
    values
  );
  const total = countResult.rows[0]?.total || 0;

  const dataQuery = `
    SELECT cluster_id,
           ST_Y(center_location::geometry) AS latitude,
           ST_X(center_location::geometry) AS longitude,
           report_count, distinct_devices, severity_score, status,
           first_reported_at, last_reported_at, updated_at
    FROM pothole_clusters
    ${where}
    ORDER BY severity_score DESC, last_reported_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  const dataValues = [...values, pagination.limit, pagination.offset];

  const dataResult = await queryWithRetry<ClusterRow>(dataQuery, dataValues);

  return { rows: dataResult.rows, total };
}

export async function findClusterById(clusterId: string): Promise<ClusterRow | null> {
  const query = `
    SELECT cluster_id,
           ST_Y(center_location::geometry) AS latitude,
           ST_X(center_location::geometry) AS longitude,
           report_count, distinct_devices, severity_score, status,
           first_reported_at, last_reported_at, updated_at
    FROM pothole_clusters
    WHERE cluster_id = $1
  `;
  const result = await queryWithRetry<ClusterRow>(query, [clusterId]);
  return result.rows[0] || null;
}

export async function findClusterEvents(clusterId: string) {
  const query = `
    SELECT se.event_id, se.device_id, se.recorded_at,
           ST_Y(se.location::geometry) AS latitude,
           ST_X(se.location::geometry) AS longitude,
           se.speed_kmh, se.accel_magnitude,
           ce.predicted_label, ce.confidence
    FROM cluster_events ce_link
    JOIN sensor_events se ON ce_link.event_id = se.event_id
    LEFT JOIN classified_events ce ON se.event_id = ce.event_id
    WHERE ce_link.cluster_id = $1
    ORDER BY se.recorded_at DESC
  `;
  const result = await queryWithRetry(query, [clusterId]);
  return result.rows;
}

export async function updateClusterStatus(
  clusterId: string,
  status: string
): Promise<ClusterRow | null> {
  const query = `
    UPDATE pothole_clusters
    SET status = $1, updated_at = now()
    WHERE cluster_id = $2
    RETURNING cluster_id,
              ST_Y(center_location::geometry) AS latitude,
              ST_X(center_location::geometry) AS longitude,
              report_count, distinct_devices, severity_score, status,
              first_reported_at, last_reported_at, updated_at
  `;
  const result = await queryWithRetry<ClusterRow>(query, [status, clusterId]);
  return result.rows[0] || null;
}
