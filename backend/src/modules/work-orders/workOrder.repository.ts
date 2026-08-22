import { pool, queryWithRetry } from "../../config/database";
import { WorkOrderRow, WorkOrderFilterParams } from "./workOrder.types";
import { CreateWorkOrderInput, UpdateWorkOrderInput } from "./workOrder.validation";
import { PaginationParams } from "../../shared/utils/pagination";

export async function createWorkOrder(input: CreateWorkOrderInput): Promise<WorkOrderRow> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const insertRes = await client.query<WorkOrderRow>(
      `INSERT INTO work_orders (cluster_id, assigned_to, priority_rank)
       VALUES ($1, $2, $3)
       RETURNING work_order_id, cluster_id, assigned_to, priority_rank, status, created_at, completed_at`,
      [input.cluster_id, input.assigned_to || null, input.priority_rank || 1]
    );

    await client.query(
      `UPDATE pothole_clusters
       SET status = 'queued', updated_at = now()
       WHERE cluster_id = $1 AND status IN ('unconfirmed', 'confirmed')`,
      [input.cluster_id]
    );

    await client.query("COMMIT");
    return insertRes.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function findWorkOrders(
  filters: WorkOrderFilterParams,
  pagination: PaginationParams
): Promise<{ rows: WorkOrderRow[]; total: number }> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;

  if (filters.status) {
    conditions.push(`wo.status = $${idx++}`);
    values.push(filters.status);
  }
  if (filters.assigned_to) {
    conditions.push(`wo.assigned_to = $${idx++}`);
    values.push(filters.assigned_to);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const countRes = await queryWithRetry<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM work_orders wo ${where}`,
    values
  );
  const total = countRes.rows[0]?.total || 0;

  const dataQuery = `
    SELECT wo.work_order_id, wo.cluster_id, wo.assigned_to, wo.priority_rank, wo.status,
           wo.created_at, wo.completed_at,
           u.full_name AS assigned_to_name,
           pc.severity_score AS cluster_severity,
           ST_Y(pc.center_location::geometry) AS cluster_latitude,
           ST_X(pc.center_location::geometry) AS cluster_longitude
    FROM work_orders wo
    LEFT JOIN admin_users u ON wo.assigned_to = u.admin_id
    LEFT JOIN pothole_clusters pc ON wo.cluster_id = pc.cluster_id
    ${where}
    ORDER BY wo.priority_rank ASC, wo.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}
  `;
  const dataValues = [...values, pagination.limit, pagination.offset];

  const dataRes = await queryWithRetry<WorkOrderRow>(dataQuery, dataValues);

  return { rows: dataRes.rows, total };
}

export async function findWorkOrderById(id: string): Promise<WorkOrderRow | null> {
  const query = `
    SELECT wo.work_order_id, wo.cluster_id, wo.assigned_to, wo.priority_rank, wo.status,
           wo.created_at, wo.completed_at,
           u.full_name AS assigned_to_name,
           pc.severity_score AS cluster_severity,
           ST_Y(pc.center_location::geometry) AS cluster_latitude,
           ST_X(pc.center_location::geometry) AS cluster_longitude
    FROM work_orders wo
    LEFT JOIN admin_users u ON wo.assigned_to = u.admin_id
    LEFT JOIN pothole_clusters pc ON wo.cluster_id = pc.cluster_id
    WHERE wo.work_order_id = $1
  `;
  const res = await queryWithRetry<WorkOrderRow>(query, [id]);
  return res.rows[0] || null;
}

export async function updateWorkOrder(
  id: string,
  input: UpdateWorkOrderInput
): Promise<WorkOrderRow | null> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const updates: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${idx++}`);
      values.push(input.status);

      if (input.status === "completed") {
        updates.push(`completed_at = now()`);
      }
    }
    if (input.assigned_to !== undefined) {
      updates.push(`assigned_to = $${idx++}`);
      values.push(input.assigned_to);
    }
    if (input.priority_rank !== undefined) {
      updates.push(`priority_rank = $${idx++}`);
      values.push(input.priority_rank);
    }

    if (updates.length === 0) {
      const existing = await findWorkOrderById(id);
      client.release();
      return existing;
    }

    values.push(id);
    const updateQuery = `
      UPDATE work_orders
      SET ${updates.join(", ")}
      WHERE work_order_id = $${idx}
      RETURNING work_order_id, cluster_id, assigned_to, priority_rank, status, created_at, completed_at
    `;

    const res = await client.query<WorkOrderRow>(updateQuery, values);
    const updated = res.rows[0];

    if (updated && input.status) {
      let clusterStatus: string | null = null;
      if (input.status === "in_progress") clusterStatus = "in_progress";
      if (input.status === "completed") clusterStatus = "fixed";

      if (clusterStatus) {
        await client.query(
          `UPDATE pothole_clusters SET status = $1, updated_at = now() WHERE cluster_id = $2`,
          [clusterStatus, updated.cluster_id]
        );
      }
    }

    await client.query("COMMIT");
    return updated;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
