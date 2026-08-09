// ─── TypeScript interfaces for the sensor-events module ───

export interface SensorEventInput {
  device_id: string;
  timestamp: string; // ISO 8601
  latitude: number;
  longitude: number;
  speed_kmh?: number;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  accel_magnitude: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
}

export interface SensorEventRow {
  event_id: string;
  device_id: string;
  recorded_at: Date;
  latitude: number;
  longitude: number;
  speed_kmh: number | null;
  accel_x: number;
  accel_y: number;
  accel_z: number;
  accel_magnitude: number;
  gyro_x: number;
  gyro_y: number;
  gyro_z: number;
  ingested_at: Date;
}

export interface IngestResult {
  ingested: number;
  event_ids: string[];
}
