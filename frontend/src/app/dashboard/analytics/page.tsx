"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { fetchAnalytics } from "@/lib/api";
import { Card, CardHeader, Skeleton, StatCard } from "@/components/ui";

const PIE_COLORS = ["#22c55e", "#eab308", "#ef4444"];

export default function AnalyticsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["analytics"],
    queryFn: fetchAnalytics,
  });

  if (isError) {
    return (
      <p className="text-sm text-red-600">Failed to load analytics summary.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-[var(--rd-muted)]">
          Trends, area comparisons, and repair performance for the campus demo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))
        ) : (
          <>
            <StatCard
              label="Avg repair time"
              value={`${data.avg_repair_hours}h`}
              hint="Mean hours open → fixed"
            />
            <StatCard
              label="Confirmed potholes"
              value={data.totals.confirmed_potholes}
            />
            <StatCard
              label="Critical roads"
              value={data.totals.critical_roads}
            />
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title="Reports per day" />
          <div className="h-72 p-4">
            {isLoading || !data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.reports_per_day}>
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
          <CardHeader title="Damage severity mix" />
          <div className="h-72 p-4">
            {isLoading || !data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.severity_breakdown}
                    dataKey="count"
                    nameKey="label"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                  >
                    {data.severity_breakdown.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Area comparisons"
            description="Road health % by campus zone"
          />
          <div className="h-72 p-4">
            {isLoading || !data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.area_comparisons} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--rd-border)" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis
                    type="category"
                    dataKey="area"
                    width={110}
                    tick={{ fontSize: 11 }}
                  />
                  <Tooltip />
                  <Bar dataKey="health_pct" fill="#0ea5e9" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card>
          <CardHeader title="Road health trend" />
          <div className="h-72 p-4">
            {isLoading || !data ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.road_health_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--rd-border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="health_pct"
                    stroke="var(--rd-accent)"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Worst areas" description="Highest report volume" />
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-[var(--rd-border)] text-xs uppercase text-[var(--rd-muted)]">
              <tr>
                <th className="px-5 py-3 text-left">Area</th>
                <th className="px-5 py-3 text-left">Health %</th>
                <th className="px-5 py-3 text-left">Reports</th>
              </tr>
            </thead>
            <tbody>
              {(data?.area_comparisons ?? [])
                .slice()
                .sort((a, b) => b.reports - a.reports)
                .map((row) => (
                  <tr
                    key={row.area}
                    className="border-b border-[var(--rd-border)] last:border-0"
                  >
                    <td className="px-5 py-3 font-medium">{row.area}</td>
                    <td className="px-5 py-3">{row.health_pct}%</td>
                    <td className="px-5 py-3">{row.reports}</td>
                  </tr>
                ))}
              {isLoading
                ? Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={3} className="px-5 py-3">
                        <Skeleton className="h-6 w-full" />
                      </td>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
