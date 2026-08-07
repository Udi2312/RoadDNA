"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchCluster } from "@/lib/api";
import { severityLevel } from "@/lib/types";
import { Badge, Card, CardHeader, Skeleton } from "@/components/ui";

export default function ClusterDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cluster", id],
    queryFn: () => fetchCluster(id),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-red-600">Cluster not found.</p>
        <Link href="/dashboard/map" className="text-[var(--rd-accent)] underline">
          Back to map
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/dashboard/map"
          className="text-sm text-[var(--rd-accent)] hover:underline"
        >
          ← Back to map
        </Link>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          {data.cluster_id}
        </h1>
        <p className="mt-1 text-sm text-[var(--rd-muted)]">
          {data.latitude.toFixed(5)}, {data.longitude.toFixed(5)}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Severity</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-semibold">{data.severity_score.toFixed(1)}</p>
            <Badge
              tone={
                severityLevel(data.severity_score) === "severe"
                  ? "red"
                  : severityLevel(data.severity_score) === "moderate"
                    ? "yellow"
                    : "green"
              }
            >
              {severityLevel(data.severity_score)}
            </Badge>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Reports</p>
          <p className="mt-2 text-2xl font-semibold">{data.report_count}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Devices</p>
          <p className="mt-2 text-2xl font-semibold">{data.device_count}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Status</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{data.status}</p>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Timeline" description="First and last reports" />
          <div className="space-y-3 px-5 py-4 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-[var(--rd-muted)]">First reported</span>
              <span>{new Date(data.first_reported_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--rd-muted)]">Last reported</span>
              <span>{new Date(data.last_reported_at).toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[var(--rd-muted)]">Avg impact</span>
              <span>{data.avg_impact.toFixed(1)}</span>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader title="Event history" description="Recent classified events" />
          <div className="divide-y divide-[var(--rd-border)]">
            {data.history.map((h, i) => (
              <div key={`${h.timestamp}-${i}`} className="px-5 py-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium capitalize">{h.label}</p>
                  <Badge tone="blue">{(h.confidence * 100).toFixed(0)}%</Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--rd-muted)]">
                  {h.device_id} · {new Date(h.timestamp).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
