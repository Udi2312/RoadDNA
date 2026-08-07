"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchWorkOrders, updateWorkOrder } from "@/lib/api";
import type { WorkOrderStatus } from "@/lib/types";
import { severityLevel } from "@/lib/types";
import { Badge, Button, Card, Skeleton } from "@/components/ui";

const STATUSES: Array<WorkOrderStatus | "all"> = [
  "all",
  "open",
  "assigned",
  "in_progress",
  "fixed",
  "rejected",
];

const ENGINEERS = ["eng_raya", "eng_kabir", "eng_meera"];

export default function QueuePage() {
  const [status, setStatus] = useState<(typeof STATUSES)[number]>("all");
  const [sortKey, setSortKey] = useState<"priority" | "severity" | "reports">(
    "priority",
  );
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["work-orders", status],
    queryFn: () => fetchWorkOrders(status === "all" ? undefined : status),
  });

  const mutation = useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: { status?: WorkOrderStatus; assigned_to?: string | null };
    }) => updateWorkOrder(id, patch),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
    },
  });

  const rows = useMemo(() => {
    const list = [...(query.data?.work_orders ?? [])];
    list.sort((a, b) => {
      if (sortKey === "severity") return b.severity_score - a.severity_score;
      if (sortKey === "reports") return b.report_count - a.report_count;
      return a.priority - b.priority;
    });
    return list;
  }, [query.data, sortKey]);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Repair priority queue
        </h1>
        <p className="mt-1 text-sm text-[var(--rd-muted)]">
          Assign engineers and move work orders through the repair lifecycle.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-[var(--rd-muted)]">Status</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="h-10 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--rd-muted)]">Sort by</span>
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
            className="h-10 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
          >
            <option value="priority">Priority</option>
            <option value="severity">Severity</option>
            <option value="reports">Report count</option>
          </select>
        </label>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--rd-border)] bg-[var(--rd-hover)]/50 text-xs uppercase tracking-wide text-[var(--rd-muted)]">
              <tr>
                <th className="px-4 py-3">Road</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Priority</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Engineer</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {query.isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((wo) => (
                    <tr
                      key={wo.id}
                      className="border-b border-[var(--rd-border)] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/dashboard/clusters/${wo.cluster_id}`}
                          className="font-medium text-[var(--rd-accent)] hover:underline"
                        >
                          {wo.road_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          tone={
                            severityLevel(wo.severity_score) === "severe"
                              ? "red"
                              : severityLevel(wo.severity_score) === "moderate"
                                ? "yellow"
                                : "green"
                          }
                        >
                          {wo.severity_score.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{wo.report_count}</td>
                      <td className="px-4 py-3">P{wo.priority}</td>
                      <td className="px-4 py-3">
                        <Badge tone="blue">{wo.status.replace("_", " ")}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={wo.assigned_to ?? ""}
                          className="h-9 rounded-md border border-[var(--rd-border)] bg-[var(--rd-bg)] px-2"
                          onChange={(e) =>
                            mutation.mutate({
                              id: wo.id,
                              patch: {
                                assigned_to: e.target.value || null,
                                status: e.target.value
                                  ? "assigned"
                                  : wo.status,
                              },
                            })
                          }
                        >
                          <option value="">Unassigned</option>
                          {ENGINEERS.map((eng) => (
                            <option key={eng} value={eng}>
                              {eng}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="secondary"
                            disabled={mutation.isPending}
                            onClick={() =>
                              mutation.mutate({
                                id: wo.id,
                                patch: {
                                  status: "in_progress",
                                  assigned_to:
                                    wo.assigned_to ?? ENGINEERS[0],
                                },
                              })
                            }
                          >
                            In progress
                          </Button>
                          <Button
                            disabled={mutation.isPending}
                            onClick={() =>
                              mutation.mutate({
                                id: wo.id,
                                patch: { status: "fixed" },
                              })
                            }
                          >
                            Fixed
                          </Button>
                          <Button
                            variant="danger"
                            disabled={mutation.isPending}
                            onClick={() =>
                              mutation.mutate({
                                id: wo.id,
                                patch: { status: "rejected" },
                              })
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {!query.isLoading && rows.length === 0 ? (
            <p className="px-4 py-10 text-center text-sm text-[var(--rd-muted)]">
              No work orders for this filter.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
