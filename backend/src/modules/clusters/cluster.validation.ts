import { z } from "zod";
import { CLUSTER_STATUSES } from "../../shared/constants";

export const queryClustersSchema = z.object({
  status: z.enum(CLUSTER_STATUSES).optional(),
  severity_min: z
    .string()
    .optional()
    .transform((v) => (v ? parseFloat(v) : undefined)),
  bbox: z.string().optional(), // format: "min_lng,min_lat,max_lng,max_lat"
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});

export const updateClusterStatusSchema = z.object({
  status: z.enum(CLUSTER_STATUSES),
});

export type QueryClustersInput = z.infer<typeof queryClustersSchema>;
export type UpdateClusterStatusInput = z.infer<typeof updateClusterStatusSchema>;
