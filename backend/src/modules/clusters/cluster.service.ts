import { AppError } from "../../shared/utils/AppError";
import { PaginationParams } from "../../shared/utils/pagination";
import * as repo from "./cluster.repository";
import { ClusterDetailResponse, ClusterFilterParams } from "./cluster.types";

export async function getClusters(
  filters: ClusterFilterParams,
  pagination: PaginationParams
) {
  return repo.findClusters(filters, pagination);
}

export async function getClusterById(clusterId: string): Promise<ClusterDetailResponse> {
  const cluster = await repo.findClusterById(clusterId);
  if (!cluster) {
    throw AppError.notFound("Pothole cluster not found");
  }

  const events = await repo.findClusterEvents(clusterId);

  return {
    cluster,
    events,
  };
}

export async function updateClusterStatus(clusterId: string, status: string) {
  const updated = await repo.updateClusterStatus(clusterId, status);
  if (!updated) {
    throw AppError.notFound("Pothole cluster not found");
  }
  return updated;
}
