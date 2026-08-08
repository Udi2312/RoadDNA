import * as repo from "./citizenReport.repository";
import { CreateCitizenReportInput } from "./citizenReport.types";
import { ensureDevice } from "../sensor-events/sensorEvent.repository";
import { PaginationParams } from "../../shared/utils/pagination";

export async function createReport(input: CreateCitizenReportInput) {
  // 1. Ensure device is registered
  await ensureDevice(input.device_id);

  // 2. Spatial lookup: find nearest cluster within 25m
  const linkedClusterId = await repo.findNearestCluster(input.latitude, input.longitude, 25);

  // 3. Create report
  return repo.createCitizenReport(input, linkedClusterId);
}

export async function getReports(
  filters: { device_id?: string; linked_cluster_id?: string },
  pagination: PaginationParams
) {
  return repo.findCitizenReports(filters, pagination);
}
