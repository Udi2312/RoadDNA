// ─── Raw SQL queries for sensor_events + devices tables ───

import { queryWithRetry } from "../../config/database";
import { SensorEventInput, SensorEventRow } from "./sensorEvent.types";
import { PaginationParams } from "../../shared/utils/pagination";

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
    event.longitude,
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

  const result = await queryWithRetry<{ event_id: string }>(query, values);
  return result.rows[0].event_id;
}

export async function ensureDevice(deviceId: string): Promise<void> {
  await queryWithRetry(
    `INSERT INTO devices (device_id)
     VALUES ($1)
     ON CONFLICT (device_id) DO UPDATE
     SET last_seen_at = now()`,
    [deviceId]
  );
}

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

  const countResult = await queryWithRetry<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM sensor_events ${where}`,
    values
  );
  const total: number = countResult.rows[0]?.total || 0;

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
  const dataValues = [...values, pagination.limit, pagination.offset];

  const dataResult = await queryWithRetry<SensorEventRow>(dataQuery, dataValues);

  return { rows: dataResult.rows, total };
}
