import { Router } from "express";
import { validate } from "../../middleware/validator.middleware";
import { authenticate, requireRole } from "../../middleware/auth.middleware";
import * as controller from "./workOrder.controller";
import {
  createWorkOrderSchema,
  queryWorkOrdersSchema,
  updateWorkOrderSchema,
} from "./workOrder.validation";

const router = Router();

// All work order endpoints require authentication
router.use(authenticate);

// GET /api/v1/work-orders
router.get("/", validate(queryWorkOrdersSchema, "query"), controller.getWorkOrders);

// GET /api/v1/work-orders/:id
router.get("/:id", controller.getWorkOrderById);

// POST /api/v1/work-orders (Admin / Engineer only)
router.post(
  "/",
  requireRole("admin", "engineer"),
  validate(createWorkOrderSchema),
  controller.createWorkOrder
);

// PATCH /api/v1/work-orders/:id (Admin / Engineer only)
router.patch(
  "/:id",
  requireRole("admin", "engineer"),
  validate(updateWorkOrderSchema),
  controller.updateWorkOrder
);

export default router;
