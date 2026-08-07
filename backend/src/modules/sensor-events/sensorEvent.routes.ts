// ─── Route definitions for /api/v1/sensor-events ───

import { Router } from "express";
import * as controller from "./sensorEvent.controller";
import { validate } from "../../middleware/validator.middleware";
import {
  ingestEventsSchema,
  queryEventsSchema,
} from "./sensorEvent.validation";

const router = Router();

// POST /api/v1/sensor-events — ingest batch of events from mobile app
router.post("/", validate(ingestEventsSchema), controller.ingestEvents);

// GET  /api/v1/sensor-events — query events with filters + pagination
router.get("/", validate(queryEventsSchema, "query"), controller.getEvents);

export default router;
