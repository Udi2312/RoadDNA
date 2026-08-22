import { z } from "zod";
import { WORK_ORDER_STATUSES } from "../../shared/constants";

export const createWorkOrderSchema = z.object({
  cluster_id: z.string().uuid("Invalid cluster ID format"),
  assigned_to: z.string().uuid("Invalid admin user ID format").optional(),
  priority_rank: z.number().int().optional(),
});

export const updateWorkOrderSchema = z.object({
  status: z.enum(WORK_ORDER_STATUSES).optional(),
  assigned_to: z.string().uuid("Invalid admin user ID format").optional().nullable(),
  priority_rank: z.number().int().optional(),
});

export const queryWorkOrdersSchema = z.object({
  status: z.enum(WORK_ORDER_STATUSES).optional(),
  assigned_to: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>;
export type UpdateWorkOrderInput = z.infer<typeof updateWorkOrderSchema>;
export type QueryWorkOrdersInput = z.infer<typeof queryWorkOrdersSchema>;
