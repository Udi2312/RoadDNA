import { Request, Response } from "express";
import { sendSuccess, sendPaginated } from "../../shared/utils/apiResponse";
import { parsePagination } from "../../shared/utils/pagination";
import * as service from "./citizenReport.service";
import {
  CreateCitizenReportInputType,
  QueryCitizenReportsInputType,
} from "./citizenReport.validation";

export async function createReport(req: Request, res: Response): Promise<void> {
  const result = await service.createReport(req.body as CreateCitizenReportInputType);
  sendSuccess(res, result, 201);
}

export async function getReports(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as QueryCitizenReportsInputType;
  const pagination = parsePagination(query);

  const { rows, total } = await service.getReports(
    {
      device_id: query.device_id,
      linked_cluster_id: query.linked_cluster_id,
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
