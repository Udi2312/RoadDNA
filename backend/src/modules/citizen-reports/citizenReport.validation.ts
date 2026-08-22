import { z } from "zod";

export const createCitizenReportSchema = z.object({
  device_id: z.string().min(1).max(32),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  photo_url: z.string().url().optional(),
  description: z.string().max(1000).optional(),
});

export const queryCitizenReportsSchema = z.object({
  device_id: z.string().optional(),
  linked_cluster_id: z.string().optional(),
  page: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  limit: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
});

export type CreateCitizenReportInputType = z.infer<typeof createCitizenReportSchema>;
export type QueryCitizenReportsInputType = z.infer<typeof queryCitizenReportsSchema>;
