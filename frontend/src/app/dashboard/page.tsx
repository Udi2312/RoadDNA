"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAnalytics, fetchWorkOrders } from "@/lib/api";
import { Badge, Card, CardHeader, Skeleton, StatCard } from "@/components/ui";
import { severityLevel } from "@/lib/types";

const ClusterMap = dynamic(
  () => import("@/components/cluster-map").then((m) => m.ClusterMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[360px] w-full" />,
  },
);

export default function DashboardPage() {
  const analytics = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });
  const queue = useQuery({
    queryKey: ["work-orders", "preview"],
    queryFn: () => fetchWorkOrders(),
  });

  const totals = analytics.data?.totals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Operations overview
        </h1>
        <p className="mt-1 text-sm text-[var(--rd-muted)]">
          Live campus road health from crowdsourced sensor clusters.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {analytics.isLoading || !totals ? (
          Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <StatCard label="Total Reports" value={totals.total_reports} />
            <StatCard
              label="Confirmed Potholes"
              value={totals.confirmed_potholes}
            />
            <StatCard label="Critical Roads" value={totals.critical_roads} />
            <StatCard label="Active Devices" value={totals.active_devices} />
            <StatCard label="Reports Today" value={totals.reports_today} />
          </>
        )}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ClusterMap heightClass="h-[360px]" />
        </div>
        <Card>
          <CardHeader
            title="Priority queue"
            description="Top open repairs"
            action={
              <Link
                href="/dashboard/queue"
                className="text-sm text-[var(--rd-accent)] hover:underline"
              >
                View all
              </Link>
            }
          />
          <div className="divide-y divide-[var(--rd-border)]">
            {queue.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              : (queue.data?.work_orders ?? []).slice(0, 5).map((wo) => (
                  <div key={wo.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {wo.road_name}
                      </p>
                      <p className="text-xs text-[var(--rd-muted)]">
                        {wo.report_count} reports · P{wo.priority}
                      </p>
                    </div>
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
                  </div>
                ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Reports per day" description="Last 6 days" />
          <div className="h-64 p-4">
            {analytics.isLoading || !analytics.data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.data.reports_per_day}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--rd-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--rd-accent)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card>
          <CardHeader title="Road health trend" description="Campus health %" />
          <div className="h-64 p-4">
            {analytics.isLoading || !analytics.data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.data.road_health_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--rd-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="health_pct"
                    stroke="var(--rd-accent)"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
