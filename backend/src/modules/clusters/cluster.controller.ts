import { Request, Response } from "express";
import { sendSuccess, sendPaginated } from "../../shared/utils/apiResponse";
import { parsePagination } from "../../shared/utils/pagination";
import * as service from "./cluster.service";
import { QueryClustersInput, UpdateClusterStatusInput } from "./cluster.validation";

export async function getClusters(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as QueryClustersInput;
  const pagination = parsePagination(query);

  const { rows, total } = await service.getClusters(
    {
      status: query.status,
      severity_min: query.severity_min,
      bbox: query.bbox,
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

export async function getClusterById(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const clusterDetail = await service.getClusterById(id);
  sendSuccess(res, clusterDetail, 200);
}

export async function updateClusterStatus(req: Request, res: Response): Promise<void> {
  const id = String(req.params.id);
  const { status } = req.body as UpdateClusterStatusInput;
  const updatedCluster = await service.updateClusterStatus(id, status);
  sendSuccess(res, updatedCluster, 200);
}
