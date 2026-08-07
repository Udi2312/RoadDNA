"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useQuery } from "@tanstack/react-query";
import { fetchClusters } from "@/lib/api";
import { CAMPUS_CENTER } from "@/mocks/data";
import { severityColor, severityLevel } from "@/lib/types";
import { useUiStore } from "@/lib/store";
import { Badge, Button, Card, Skeleton } from "@/components/ui";

function BoundsReporter({
  onBounds,
}: {
  onBounds: (bounds: string) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBounds(
        `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`,
      );
    },
  });

  useEffect(() => {
    const b = map.getBounds();
    onBounds(`${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`);
  }, [map, onBounds]);

  return null;
}

function FlyToSelected({
  lat,
  lng,
}: {
  lat: number | null;
  lng: number | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (lat != null && lng != null) {
      map.flyTo([lat, lng], 17, { duration: 0.6 });
    }
  }, [lat, lng, map]);
  return null;
}

export function ClusterMap({
  heightClass = "h-[560px]",
  filterSeverity,
}: {
  heightClass?: string;
  filterSeverity?: "all" | "low" | "moderate" | "severe";
}) {
  const [bounds, setBounds] = useState<string | undefined>();
  const [search, setSearch] = useState("");
  const selectedClusterId = useUiStore((s) => s.selectedClusterId);
  const setSelectedClusterId = useUiStore((s) => s.setSelectedClusterId);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["clusters", bounds],
    queryFn: () => fetchClusters(bounds),
  });

  const clusters = useMemo(() => {
    let list = data?.clusters ?? [];
    if (filterSeverity && filterSeverity !== "all") {
      list = list.filter((c) => severityLevel(c.severity_score) === filterSeverity);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.cluster_id.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q),
      );
    }
    return list;
  }, [data, filterSeverity, search]);

  const selected = clusters.find((c) => c.cluster_id === selectedClusterId);

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-[var(--rd-border)] px-4 py-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search clusters…"
          className="h-9 min-w-[180px] flex-1 rounded-lg border border-[var(--rd-border)] bg-[var(--rd-bg)] px-3 text-sm outline-none focus:border-[var(--rd-accent)]"
        />
        <Button variant="secondary" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? "Refreshing…" : "Refresh"}
        </Button>
        <p className="text-xs text-[var(--rd-muted)]">
          {clusters.length} cluster{clusters.length === 1 ? "" : "s"} in view
        </p>
      </div>

      <div className={heightClass}>
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-none" />
        ) : isError ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600">
            Failed to load clusters.
          </div>
        ) : (
          <MapContainer
            center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
            zoom={15}
            className="h-full w-full"
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <BoundsReporter onBounds={setBounds} />
            <FlyToSelected
              lat={selected?.latitude ?? null}
              lng={selected?.longitude ?? null}
            />
            {clusters.map((c) => (
              <CircleMarker
                key={c.cluster_id}
                center={[c.latitude, c.longitude]}
                radius={10 + Math.min(c.report_count, 8)}
                pathOptions={{
                  color: severityColor(c.severity_score),
                  fillColor: severityColor(c.severity_score),
                  fillOpacity: 0.75,
                  weight: selectedClusterId === c.cluster_id ? 3 : 1,
                }}
                eventHandlers={{
                  click: () => setSelectedClusterId(c.cluster_id),
                }}
              >
                <Popup>
                  <div className="min-w-[180px] space-y-1 text-sm">
                    <p className="font-semibold">{c.cluster_id}</p>
                    <p>Severity: {c.severity_score.toFixed(1)}</p>
                    <p>Reports: {c.report_count}</p>
                    <Badge
                      tone={
                        severityLevel(c.severity_score) === "severe"
                          ? "red"
                          : severityLevel(c.severity_score) === "moderate"
                            ? "yellow"
                            : "green"
                      }
                    >
                      {severityLevel(c.severity_score)}
                    </Badge>
                    <div className="pt-2">
                      <Link
                        href={`/dashboard/clusters/${c.cluster_id}`}
                        className="text-[var(--rd-accent)] underline"
                      >
                        Open detail
                      </Link>
                    </div>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        )}
      </div>
    </Card>
  );
}
