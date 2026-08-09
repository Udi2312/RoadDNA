"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchCitizenReports } from "@/lib/api";
import { Badge, Card, Skeleton } from "@/components/ui";

export default function ReportsPage() {
  const [photo, setPhoto] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["citizen-reports"],
    queryFn: () => fetchCitizenReports({ limit: 50 }),
  });

  const rows = data?.data ?? [];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Citizen reports
        </h1>
        <p className="mt-1 text-sm text-[var(--rd-muted)]">
          Manual reports with photo preview and auto-linked cluster badges
          (25 m spatial link on backend).
        </p>
      </div>

      {isError ? (
        <p className="text-sm text-red-600">Failed to load citizen reports.</p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 w-full" />
            ))
          : rows.map((r) => (
              <Card key={r.report_id} className="overflow-hidden">
                {r.photo_url ? (
                  <button
                    type="button"
                    className="block w-full"
                    onClick={() => setPhoto(r.photo_url)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={r.photo_url}
                      alt="Citizen report"
                      className="h-40 w-full object-cover"
                    />
                  </button>
                ) : (
                  <div className="flex h-40 items-center justify-center bg-[var(--rd-hover)] text-sm text-[var(--rd-muted)]">
                    No photo
                  </div>
                )}
                <div className="space-y-2 p-4">
                  <p className="text-sm font-medium leading-snug">
                    {r.description}
                  </p>
                  <p className="text-xs text-[var(--rd-muted)]">
                    {r.device_id} · {r.latitude.toFixed(4)},{" "}
                    {r.longitude.toFixed(4)}
                  </p>
                  <p className="text-xs text-[var(--rd-muted)]">
                    {new Date(r.created_at).toLocaleString()}
                  </p>
                  {r.linked_cluster_id ? (
                    <Link href={`/clusters/${r.linked_cluster_id}`}>
                      <Badge tone="green">
                        Linked: {r.linked_cluster_id.slice(0, 8)}…
                      </Badge>
                    </Link>
                  ) : (
                    <Badge tone="yellow">Unlinked</Badge>
                  )}
                </div>
              </Card>
            ))}
      </div>

      {!isLoading && rows.length === 0 ? (
        <p className="text-sm text-[var(--rd-muted)]">No citizen reports yet.</p>
      ) : null}

      {photo ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPhoto(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo}
            alt="Report"
            className="max-h-[85vh] max-w-full rounded-xl"
          />
        </div>
      ) : null}
    </div>
  );
}
