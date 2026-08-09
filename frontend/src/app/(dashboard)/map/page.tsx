"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Skeleton } from "@/components/ui";

const Heatmap = dynamic(
  () => import("@/components/map/Heatmap").then((m) => m.Heatmap),
  {
    ssr: false,
    loading: () => <Skeleton className="h-[640px] w-full" />,
  },
);

export default function MapPage() {
  const [severity, setSeverity] = useState<
    "all" | "low" | "moderate" | "severe"
  >("all");
  const [status, setStatus] = useState("");
  const [severityMin, setSeverityMin] = useState("");

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
            GIS heatmap
          </h1>
          <p className="mt-1 text-sm text-[var(--rd-muted)]">
            Clusters from GET /clusters?bbox=min_lng,min_lat,max_lng,max_lat as
            the map viewport moves.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <label className="text-sm">
            <span className="mb-1 block text-[var(--rd-muted)]">Severity band</span>
            <select
              value={severity}
              onChange={(e) =>
                setSeverity(e.target.value as typeof severity)
              }
              className="h-10 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
            >
              <option value="all">All</option>
              <option value="low">Low (&lt;40)</option>
              <option value="moderate">Moderate</option>
              <option value="severe">Severe (≥70)</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--rd-muted)]">Status</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="h-10 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
            >
              <option value="">Any</option>
              <option value="unconfirmed">unconfirmed</option>
              <option value="confirmed">confirmed</option>
              <option value="queued">queued</option>
              <option value="fixed">fixed</option>
            </select>
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-[var(--rd-muted)]">Min severity</span>
            <input
              type="number"
              min={0}
              max={100}
              value={severityMin}
              onChange={(e) => setSeverityMin(e.target.value)}
              placeholder="e.g. 40"
              className="h-10 w-28 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-panel)] px-3"
            />
          </label>
        </div>
      </div>
      <Heatmap
        heightClass="h-[640px]"
        filterSeverity={severity}
        status={status || undefined}
        severityMin={severityMin ? Number(severityMin) : undefined}
      />
    </div>
  );
}
