"use client";

import Link from "next/link";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchClusters } from "@/lib/api";
import { severityTone } from "@/types/cluster";
import { Badge, Card, Skeleton } from "@/components/ui";

export default function ClustersPage() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["clusters-table", status, page],
    queryFn: () =>
      fetchClusters({
        status: status || undefined,
        page,
        limit: 20,
      }),
  });

  const rows = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Clusters
          </h1>
          <p className="mt-1 text-sm text-[var(--rd-muted)]">
            Paginated cluster list with severity badges and report counts.
          </p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--rd-muted)]">Status</span>
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
          >
            <option value="">All</option>
            <option value="unconfirmed">unconfirmed</option>
            <option value="confirmed">confirmed</option>
            <option value="queued">queued</option>
            <option value="fixed">fixed</option>
          </select>
        </label>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--rd-border)] bg-[var(--rd-hover)]/50 text-xs uppercase tracking-wide text-[var(--rd-muted)]">
              <tr>
                <th className="px-4 py-3">Cluster</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Severity</th>
                <th className="px-4 py-3">Reports</th>
                <th className="px-4 py-3">Devices</th>
                <th className="px-4 py-3">Last reported</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-4 py-3">
                        <Skeleton className="h-8 w-full" />
                      </td>
                    </tr>
                  ))
                : rows.map((c) => (
                    <tr
                      key={c.cluster_id}
                      className="border-b border-[var(--rd-border)] last:border-0"
                    >
                      <td className="px-4 py-3">
                        <Link
                          href={`/clusters/${c.cluster_id}`}
                          className="font-medium text-[var(--rd-accent)] hover:underline"
                        >
                          {c.cluster_id}
                        </Link>
                        <p className="text-xs text-[var(--rd-muted)]">
                          {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone="blue">{c.status}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={severityTone(c.severity_score)}>
                          {c.severity_score.toFixed(1)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{c.report_count}</td>
                      <td className="px-4 py-3">{c.distinct_devices}</td>
                      <td className="px-4 py-3 text-[var(--rd-muted)]">
                        {new Date(c.last_reported_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
          {isError ? (
            <p className="px-4 py-8 text-center text-sm text-red-600">
              Failed to load clusters.
            </p>
          ) : null}
          {!isLoading && rows.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-[var(--rd-muted)]">
              No clusters for this filter.
            </p>
          ) : null}
        </div>
        {pagination ? (
          <div className="flex items-center justify-between border-t border-[var(--rd-border)] px-4 py-3 text-sm">
            <p className="text-[var(--rd-muted)]">
              Page {pagination.page} of {pagination.totalPages} ·{" "}
              {pagination.total} total
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-lg border border-[var(--rd-border)] px-3 py-1.5 disabled:opacity-40"
              >
                Prev
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-[var(--rd-border)] px-3 py-1.5 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
