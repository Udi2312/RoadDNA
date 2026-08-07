// ─── Zod schemas for sensor event API validation ───

import { z } from "zod";
import { MAX_BATCH_SIZE } from "../../shared/constants";

// Single sensor event (as sent by the mobile app)
const sensorEventSchema = z.object({
  device_id: z.string().min(1).max(32),
  timestamp: z.string(), // ISO 8601 datetime
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  speed_kmh: z.number().min(0).optional(),
  accel_x: z.number(),
  accel_y: z.number(),
  accel_z: z.number(),
  accel_magnitude: z.number().min(0),
  gyro_x: z.number(),
  gyro_y: z.number(),
  gyro_z: z.number(),
});

// POST /api/v1/sensor-events — batch of up to 50 events
export const ingestEventsSchema = z.object({
  events: z.array(sensorEventSchema).min(1).max(MAX_BATCH_SIZE),
});

// GET /api/v1/sensor-events — query filters
export const queryEventsSchema = z.object({
  device_id: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});

// Inferred types for use in controllers
export type IngestEventsBody = z.infer<typeof ingestEventsSchema>;
export type QueryEventsParams = z.infer<typeof queryEventsSchema>;
