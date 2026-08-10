import { config } from "../config";
import { logger } from "../config/logger";
import type { SensorEventInput } from "../modules/sensor-events/sensorEvent.types";

export interface ClassificationResult {
  event_id: string;
  predicted_label: string;
  confidence: number;
  model_version: string;
}

/**
 * Call the FastAPI AI microservice POST /classify.
 * Soft-fails (returns []) if the service is down so ingestion is never blocked.
 */
export async function classifyEvents(
  events: Array<SensorEventInput & { event_id: string }>
): Promise<ClassificationResult[]> {
  if (!config.aiServiceUrl || events.length === 0) {
    return [];
  }

  const url = `${config.aiServiceUrl.replace(/\/$/, "")}/classify`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8_000);

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: events.map((e) => ({
          event_id: e.event_id,
          device_id: e.device_id,
          latitude: e.latitude,
          longitude: e.longitude,
          speed_kmh: e.speed_kmh ?? null,
          accel_x: e.accel_x,
          accel_y: e.accel_y,
          accel_z: e.accel_z,
          accel_magnitude: e.accel_magnitude,
          gyro_x: e.gyro_x,
          gyro_y: e.gyro_y,
          gyro_z: e.gyro_z,
        })),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const text = await res.text();
      logger.warn({ status: res.status, text }, "AI classify failed");
      return [];
    }

    const body = (await res.json()) as { results?: ClassificationResult[] };
    return body.results ?? [];
  } catch (err) {
    logger.warn({ err }, "AI service unreachable — skipping classification");
    return [];
  }
}
