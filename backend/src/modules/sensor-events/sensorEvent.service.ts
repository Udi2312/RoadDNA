// ─── Business logic for sensor event ingestion ───
// Orchestrates device registration + event insertion.
// Later: this is where we'll trigger the AI classification job.

import { SensorEventInput, IngestResult } from "./sensorEvent.types";
import * as repo from "./sensorEvent.repository";
import { PaginationParams } from "../../shared/utils/pagination";
import { logger } from "../../config/logger";

/**
 * Ingest a batch of sensor events from the mobile app.
 * 1. Auto-register (or touch) all unique devices
 * 2. Insert every event into sensor_events
 * 3. (TODO) Queue events for AI classification
 */
export async function ingestEvents(
  events: SensorEventInput[]
): Promise<IngestResult> {
  // 1. Deduplicate device IDs and upsert them
  const uniqueDevices = [...new Set(events.map((e) => e.device_id))];
  await Promise.all(uniqueDevices.map((id) => repo.ensureDevice(id)));

  // 2. Insert all sensor events
  const eventIds = await Promise.all(
    events.map((event) => repo.insertSensorEvent(event))
  );

  logger.info(
    { count: eventIds.length, devices: uniqueDevices.length },
    "Ingested sensor events"
  );

  // TODO: Step 1.7 from the plan — push eventIds to BullMQ
  //       so the classification job sends them to the AI service

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
