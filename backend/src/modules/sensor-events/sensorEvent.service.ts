// ─── Business logic for sensor event ingestion ───
// Orchestrates device registration + event insertion + AI classification.

import { SensorEventInput, IngestResult } from "./sensorEvent.types";
import * as repo from "./sensorEvent.repository";
import { PaginationParams } from "../../shared/utils/pagination";
import { logger } from "../../config/logger";
import { classifyEvents } from "../../services/aiClient";

/**
 * Ingest a batch of sensor events from the mobile app.
 * 1. Auto-register (or touch) all unique devices
 * 2. Insert every event into sensor_events
 * 3. Call AI /classify and persist into classified_events (best-effort)
 */
export async function ingestEvents(
  events: SensorEventInput[]
): Promise<IngestResult> {
  const uniqueDevices = [...new Set(events.map((e) => e.device_id))];
  await Promise.all(uniqueDevices.map((id) => repo.ensureDevice(id)));

  const eventIds = await Promise.all(
    events.map((event) => repo.insertSensorEvent(event))
  );

  logger.info(
    { count: eventIds.length, devices: uniqueDevices.length },
    "Ingested sensor events"
  );

  const withIds = events.map((event, i) => ({
    ...event,
    event_id: eventIds[i],
  }));

  const results = await classifyEvents(withIds);
  if (results.length > 0) {
    const saved = await repo.upsertClassifications(results);
    logger.info({ saved }, "Persisted AI classifications");
  }

  return { ingested: eventIds.length, event_ids: eventIds };
}

/**
 * Query sensor events with optional filters + pagination.
 */
export async function queryEvents(
  filters: { device_id?: string; from?: string; to?: string },
  pagination: PaginationParams
) {
  return repo.findSensorEvents(filters, pagination);
}
