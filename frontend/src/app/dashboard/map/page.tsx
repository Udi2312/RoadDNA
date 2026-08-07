"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui";

const ClusterMap = dynamic(
  () => import("@/components/cluster-map").then((m) => m.ClusterMap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[640px] w-full" />,
  },
);

export default function MapPage() {
  const [severity, setSeverity] = useState<
    "all" | "low" | "moderate" | "severe"
  >("all");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            Live map
          </h1>
          <p className="mt-1 text-sm text-[var(--rd-muted)]">
            Heatmap-style cluster markers for the campus demo area. Zoom, search,
            and filter by severity.
          </p>
        </div>
        <label className="text-sm">
          <span className="mb-1 block text-[var(--rd-muted)]">Severity</span>
          <select
            value={severity}
            onChange={(e) =>
              setSeverity(e.target.value as typeof severity)
            }
            className="h-10 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
          >
            <option value="all">All</option>
            <option value="low">Good / low</option>
            <option value="moderate">Moderate</option>
            <option value="severe">Severe</option>
          </select>
        </label>
      </div>
      <ClusterMap heightClass="h-[640px]" filterSeverity={severity} />
    </div>
  );
}
