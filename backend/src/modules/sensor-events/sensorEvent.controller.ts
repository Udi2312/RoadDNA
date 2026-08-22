// ─── Request handlers for sensor event endpoints ───
// Controllers: parse request → call service → send response.
// No business logic or SQL here.

import { Request, Response } from "express";
import * as service from "./sensorEvent.service";
import { sendSuccess, sendPaginated } from "../../shared/utils/apiResponse";
import { parsePagination } from "../../shared/utils/pagination";
import { IngestEventsBody, QueryEventsParams } from "./sensorEvent.validation";

/**
 * POST /api/v1/sensor-events
 * Ingests a batch of sensor events from the mobile app.
 */
export async function ingestEvents(
  req: Request,
  res: Response
): Promise<void> {
  const { events } = req.body as IngestEventsBody;
  const normalized = events.map((e) => {
    const mag =
      e.accel_magnitude ??
      Math.sqrt(e.accel_x ** 2 + e.accel_y ** 2 + e.accel_z ** 2);
    return { ...e, accel_magnitude: mag };
  });
  const result = await service.ingestEvents(normalized);
  sendSuccess(res, result, 201);
}

/**
 * GET /api/v1/sensor-events
 * Query sensor events with optional filters + pagination.
 */
export async function getEvents(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as QueryEventsParams;
  const pagination = parsePagination(query);

  const { rows, total } = await service.queryEvents(
    {
      device_id: query.device_id,
      from: query.from,
      to: query.to,
    },
    pagination
  );

  sendPaginated(res, rows, {
    page: pagination.page,
    limit: pagination.limit,
    total,
    totalPages: Math.ceil(total / pagination.limit),
  });
}
