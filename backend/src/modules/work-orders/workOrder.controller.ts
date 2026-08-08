import { Request, Response } from "express";
import { sendSuccess, sendPaginated } from "../../shared/utils/apiResponse";
import { parsePagination } from "../../shared/utils/pagination";
import * as service from "./workOrder.service";
import {
  CreateWorkOrderInput,
  QueryWorkOrdersInput,
  UpdateWorkOrderInput,
} from "./workOrder.validation";

export async function createWorkOrder(req: Request, res: Response): Promise<void> {
  const result = await service.createWorkOrder(req.body as CreateWorkOrderInput);
  sendSuccess(res, result, 201);
}

export async function getWorkOrders(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as QueryWorkOrdersInput;
  const pagination = parsePagination(query);

  const { rows, total } = await service.getWorkOrders(
    {
      status: query.status,
      assigned_to: query.assigned_to,
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

export async function getWorkOrderById(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await service.getWorkOrderById(id);
  sendSuccess(res, result, 200);
}

export async function updateWorkOrder(req: Request, res: Response): Promise<void> {
  const { id } = req.params;
  const result = await service.updateWorkOrder(id, req.body as UpdateWorkOrderInput);
  sendSuccess(res, result, 200);
}
