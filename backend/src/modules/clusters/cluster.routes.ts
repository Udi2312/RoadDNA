import { Router } from "express";
import { validate } from "../../middleware/validator.middleware";
import { authenticate, requireRole } from "../../middleware/auth.middleware";
import * as controller from "./cluster.controller";
import { queryClustersSchema, updateClusterStatusSchema } from "./cluster.validation";

const router = Router();

// GET /api/v1/clusters (Public/Dashboard Heatmap read)
router.get("/", validate(queryClustersSchema, "query"), controller.getClusters);

// GET /api/v1/clusters/:id
router.get("/:id", controller.getClusterById);

// PATCH /api/v1/clusters/:id (Admin / Engineer only)
router.patch(
  "/:id",
  authenticate,
  requireRole("admin", "engineer"),
  validate(updateClusterStatusSchema),
  controller.updateClusterStatus
);

export default router;
