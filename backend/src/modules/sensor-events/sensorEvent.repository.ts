// ─── Raw SQL queries for sensor_events + devices tables ───
// This is the ONLY file that touches the database directly.
// Services call these functions — never write SQL in controllers.

import { pool } from "../../config/database";
import { SensorEventInput, SensorEventRow } from "./sensorEvent.types";
import { PaginationParams } from "../../shared/utils/pagination";

/**
 * Insert a single sensor event into the database.
 * Combines lat/lng into a PostGIS GEOGRAPHY point on insert.
 */
export async function insertSensorEvent(
  event: SensorEventInput
): Promise<string> {
  const query = `
    INSERT INTO sensor_events
      (device_id, recorded_at, location, speed_kmh,
       accel_x, accel_y, accel_z, accel_magnitude,
       gyro_x, gyro_y, gyro_z)
    VALUES
      ($1, $2, ST_MakePoint($3, $4)::geography, $5,
       $6, $7, $8, $9, $10, $11, $12)
    RETURNING event_id
  `;
  const values = [
    event.device_id,
    event.timestamp,
    event.longitude, // ST_MakePoint takes (lng, lat) — NOT (lat, lng)!
    event.latitude,
    event.speed_kmh ?? null,
    event.accel_x,
    event.accel_y,
    event.accel_z,
    event.accel_magnitude,
    event.gyro_x,
    event.gyro_y,
    event.gyro_z,
  ];

  const result = await pool.query(query, values);
  return result.rows[0].event_id;
}

/**
 * Upsert a device — insert if new, update last_seen_at if existing.
 * Called automatically on every ingestion batch.
 */
export async function ensureDevice(deviceId: string): Promise<void> {
  await pool.query(
    `INSERT INTO devices (device_id)
     VALUES ($1)
     ON CONFLICT (device_id) DO UPDATE
     SET last_seen_at = now()`,
    [deviceId]
  );
}

/**
 * Query sensor events with optional filters + pagination.
 * Extracts lat/lng back from the PostGIS geography column.
 */
export async function findSensorEvents(
  filters: { device_id?: string; from?: string; to?: string },
  pagination: PaginationParams
): Promise<{ rows: SensorEventRow[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.device_id) {
    conditions.push(`device_id = $${idx++}`);
    values.push(filters.device_id);
  }
  if (filters.from) {
    conditions.push(`recorded_at >= $${idx++}`);
    values.push(filters.from);
  }
  if (filters.to) {
    conditions.push(`recorded_at <= $${idx++}`);
    values.push(filters.to);
  }

  const where =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Count total matching rows
  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM sensor_events ${where}`,
    values
  );
  const total: number = countResult.rows[0].total;

  // Fetch paginated data
  const dataQuery = `
    SELECT event_id, device_id, recorded_at,
           ST_Y(location::geometry) AS latitude,
           ST_X(location::geometry) AS longitude,
           speed_kmh, accel_x, accel_y, accel_z, accel_magnitude,
           gyro_x, gyro_y, gyro_z, ingested_at
    FROM sensor_events
    ${where}
    ORDER BY recorded_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  values.push(pagination.limit, pagination.offset);

  const dataResult = await pool.query(dataQuery, values);

  return { rows: dataResult.rows, total };
}
