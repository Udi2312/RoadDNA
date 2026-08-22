"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createWorkOrder, fetchCluster } from "@/lib/api";
import { severityTone } from "@/types/cluster";
import { useAuth } from "@/context/AuthContext";
import { Badge, Button, Card, CardHeader, Skeleton } from "@/components/ui";

export default function ClusterDetailPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(params.id);
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["cluster", id],
    queryFn: () => fetchCluster(id),
    enabled: Boolean(id),
  });

  const createWo = useMutation({
    mutationFn: () =>
      createWorkOrder({
        cluster_id: id,
        assigned_to: user?.admin_id,
        priority_rank: 1,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["cluster", id] });
      router.push("/work-orders");
    },
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
        <Link href="/clusters" className="text-[var(--rd-accent)] underline">
          Back to clusters
        </Link>
      </div>
    );
  }

  const cluster = data.cluster;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/clusters"
            className="text-sm text-[var(--rd-accent)] hover:underline"
          >
            ← Back to clusters
          </Link>
          <h1 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            {cluster.cluster_id}
          </h1>
          <p className="mt-1 text-sm text-[var(--rd-muted)]">
            {cluster.latitude.toFixed(5)}, {cluster.longitude.toFixed(5)}
          </p>
        </div>
        <Button
          disabled={createWo.isPending || cluster.status === "queued"}
          onClick={() => createWo.mutate()}
        >
          {createWo.isPending ? "Creating…" : "Create work order"}
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Severity</p>
          <div className="mt-2 flex items-center gap-2">
            <p className="text-2xl font-semibold">
              {cluster.severity_score.toFixed(1)}
            </p>
            <Badge tone={severityTone(cluster.severity_score)}>
              {cluster.severity_score >= 70
                ? "severe"
                : cluster.severity_score >= 40
                  ? "moderate"
                  : "low"}
            </Badge>
          </div>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Reports</p>
          <p className="mt-2 text-2xl font-semibold">{cluster.report_count}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Distinct devices</p>
          <p className="mt-2 text-2xl font-semibold">
            {cluster.distinct_devices}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-[var(--rd-muted)]">Status</p>
          <p className="mt-2 text-2xl font-semibold capitalize">{cluster.status}</p>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Linked sensor events"
          description="AI-labeled telemetry from GET /clusters/:id"
        />
        <div className="divide-y divide-[var(--rd-border)]">
          {data.events.length === 0 ? (
            <p className="px-5 py-8 text-sm text-[var(--rd-muted)]">
              No linked events.
            </p>
          ) : (
            data.events.map((h) => (
              <div key={h.event_id} className="px-5 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-medium capitalize">{h.predicted_label}</p>
                  <Badge tone="blue">
                    {(h.confidence * 100).toFixed(0)}% conf
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-[var(--rd-muted)]">
                  {h.device_id} · magnitude {h.accel_magnitude.toFixed(1)}
                  {h.timestamp
                    ? ` · ${new Date(h.timestamp).toLocaleString()}`
                    : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
