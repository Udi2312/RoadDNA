import { AppError } from "../../shared/utils/AppError";
import { PaginationParams } from "../../shared/utils/pagination";
import * as repo from "./workOrder.repository";
import { WorkOrderFilterParams } from "./workOrder.types";
import { CreateWorkOrderInput, UpdateWorkOrderInput } from "./workOrder.validation";

export async function createWorkOrder(input: CreateWorkOrderInput) {
  return repo.createWorkOrder(input);
}

export async function getWorkOrders(
  filters: WorkOrderFilterParams,
  pagination: PaginationParams
) {
  return repo.findWorkOrders(filters, pagination);
}

export async function getWorkOrderById(id: string) {
  const wo = await repo.findWorkOrderById(id);
  if (!wo) {
    throw AppError.notFound("Work order not found");
  }
  return wo;
}

export async function updateWorkOrder(id: string, input: UpdateWorkOrderInput) {
  const updated = await repo.updateWorkOrder(id, input);
  if (!updated) {
    throw AppError.notFound("Work order not found");
  }
  return updated;
}
