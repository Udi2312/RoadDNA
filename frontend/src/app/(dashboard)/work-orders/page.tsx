"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkOrder,
  fetchClusters,
  fetchWorkOrders,
  updateWorkOrder,
} from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import type { WorkOrderRow, WorkOrderStatus } from "@/types/workOrder";
import { severityTone } from "@/types/cluster";
import { Badge, Button, Card, CardHeader, Skeleton } from "@/components/ui";

const COLUMNS: WorkOrderStatus[] = [
  "open",
  "assigned",
  "in_progress",
  "completed",
];

export default function WorkOrdersPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [clusterId, setClusterId] = useState("");
  const [priority, setPriority] = useState(1);

  const query = useQuery({
    queryKey: ["work-orders"],
    queryFn: () => fetchWorkOrders({ limit: 100 }),
  });

  const clusters = useQuery({
    queryKey: ["clusters-for-wo"],
    queryFn: () => fetchClusters({ limit: 100 }),
    enabled: modalOpen,
  });

  const patch = useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: WorkOrderStatus;
    }) => updateWorkOrder(id, { status }),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["work-orders"] }),
  });

  const create = useMutation({
    mutationFn: () =>
      createWorkOrder({
        cluster_id: clusterId,
        assigned_to: user?.admin_id,
        priority_rank: priority,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["clusters"] });
      setModalOpen(false);
      setClusterId("");
    },
  });

  const byStatus = useMemo(() => {
    const map: Record<WorkOrderStatus, WorkOrderRow[]> = {
      open: [],
      assigned: [],
      in_progress: [],
      completed: [],
    };
    for (const wo of query.data?.data ?? []) {
      if (map[wo.status]) map[wo.status].push(wo);
    }
    return map;
  }, [query.data]);

  const nextStatus = (status: WorkOrderStatus): WorkOrderStatus | null => {
    const idx = COLUMNS.indexOf(status);
    if (idx < 0 || idx >= COLUMNS.length - 1) return null;
    return COLUMNS[idx + 1];
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Work orders
          </h1>
          <p className="mt-1 text-sm text-[var(--rd-muted)]">
            Kanban board: open → assigned → in_progress → completed.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>Create work order</Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        {COLUMNS.map((col) => (
          <Card key={col} className="flex min-h-[320px] flex-col">
            <CardHeader
              title={col.replace("_", " ")}
              description={`${byStatus[col].length} order(s)`}
            />
            <div className="flex flex-1 flex-col gap-3 p-3">
              {query.isLoading
                ? Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-28 w-full" />
                  ))
                : byStatus[col].map((wo) => {
                    const nxt = nextStatus(wo.status);
                    return (
                      <div
                        key={wo.work_order_id}
                        className="rounded-xl border border-[var(--rd-border)] bg-[var(--rd-bg)] p-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/clusters/${wo.cluster_id}`}
                            className="text-sm font-medium text-[var(--rd-accent)] hover:underline"
                          >
                            {wo.cluster_id.slice(0, 13)}…
                          </Link>
                          <Badge tone={severityTone(wo.cluster_severity)}>
                            {wo.cluster_severity.toFixed(0)}
                          </Badge>
                        </div>
                        <p className="mt-2 text-xs text-[var(--rd-muted)]">
                          Priority P{wo.priority_rank}
                        </p>
                        <p className="text-xs text-[var(--rd-muted)]">
                          {wo.assigned_to_name ?? "Unassigned"}
                        </p>
                        {nxt ? (
                          <Button
                            className="mt-3 w-full"
                            variant="secondary"
                            disabled={patch.isPending}
                            onClick={() =>
                              patch.mutate({
                                id: wo.work_order_id,
                                status: nxt,
                              })
                            }
                          >
                            Mark {nxt.replace("_", " ")}
                          </Button>
                        ) : (
                          <p className="mt-3 text-center text-xs text-emerald-600">
                            Completed
                            {wo.completed_at
                              ? ` · ${new Date(wo.completed_at).toLocaleDateString()}`
                              : ""}
                          </p>
                        )}
                      </div>
                    );
                  })}
            </div>
          </Card>
        ))}
      </div>

      {modalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-5">
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
              Create work order
            </h2>
            <p className="mt-1 text-sm text-[var(--rd-muted)]">
              POST /work-orders — cluster moves to queued.
            </p>
            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-[var(--rd-muted)]">Cluster</span>
              <select
                value={clusterId}
                onChange={(e) => setClusterId(e.target.value)}
                className="h-10 w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-bg)] px-3"
              >
                <option value="">Select cluster…</option>
                {(clusters.data?.data ?? []).map((c) => (
                  <option key={c.cluster_id} value={c.cluster_id}>
                    {c.cluster_id} (sev {c.severity_score.toFixed(0)})
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-3 block text-sm">
              <span className="mb-1 block text-[var(--rd-muted)]">
                Priority rank
              </span>
              <input
                type="number"
                min={1}
                value={priority}
                onChange={(e) => setPriority(Number(e.target.value))}
                className="h-10 w-full rounded-lg border border-[var(--rd-border)] bg-[var(--rd-bg)] px-3"
              />
            </label>
            <div className="mt-5 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button
                disabled={!clusterId || create.isPending}
                onClick={() => create.mutate()}
              >
                {create.isPending ? "Creating…" : "Create"}
              </Button>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
