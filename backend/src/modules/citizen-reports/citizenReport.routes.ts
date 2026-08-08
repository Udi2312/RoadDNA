import { Router } from "express";
import { validate } from "../../middleware/validator.middleware";
import * as controller from "./citizenReport.controller";
import {
  createCitizenReportSchema,
  queryCitizenReportsSchema,
} from "./citizenReport.validation";

const router = Router();

// POST /api/v1/citizen-reports (Public submission from mobile app)
router.post("/", validate(createCitizenReportSchema), controller.createReport);

// GET /api/v1/citizen-reports (Query reports)
router.get("/", validate(queryCitizenReportsSchema, "query"), controller.getReports);

export default router;
