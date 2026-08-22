"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchClusters } from "@/lib/api";
import { CAMPUS_CENTER } from "@/mocks/data";
import { severityColor, severityLevel, severityTone } from "@/types/cluster";
import { useUiStore } from "@/lib/store";
import { Badge, Button, Card, Skeleton } from "@/components/ui";

function BoundsReporter({
  onBbox,
}: {
  onBbox: (bbox: string) => void;
}) {
  const map = useMapEvents({
    moveend: () => {
      try {
        const b = map.getBounds();
        onBbox(
          `${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`,
        );
      } catch {
        // Map may be mid-teardown (React Strict Mode / route change)
      }
    },
  });

  useEffect(() => {
    try {
      const b = map.getBounds();
      onBbox(`${b.getWest()},${b.getSouth()},${b.getEast()},${b.getNorth()}`);
    } catch {
      // ignore first paint races
    }
  }, [map, onBbox]);

  return null;
}

function MapReady({ onReady }: { onReady: () => void }) {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        map.invalidateSize();
        onReady();
      } catch {
        // ignore
      }
    }, 50);
    return () => {
      window.clearTimeout(id);
      try {
        map.stop();
      } catch {
        // ignore
      }
    };
  }, [map, onReady]);
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
    if (lat == null || lng == null) return;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      try {
        // Pane must exist; otherwise Leaflet throws _leaflet_pos
        if (!map.getPane("mapPane")) return;
        map.flyTo([lat, lng], 16, { duration: 0.45 });
      } catch {
        // ignore teardown races
      }
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(id);
      try {
        map.stop();
      } catch {
        // ignore
      }
    };
  }, [lat, lng, map]);
  return null;
}

export function Heatmap({
  heightClass = "h-[560px]",
  filterSeverity = "all",
  status,
  severityMin,
}: {
  heightClass?: string;
  filterSeverity?: "all" | "low" | "moderate" | "severe";
  status?: string;
  severityMin?: number;
}) {
  // Do not drive cluster queries by map viewport bbox
  // (avoid GET /clusters?bbox=... as the map moves)
  const [search, setSearch] = useState("");
  const [mapReady, setMapReady] = useState(false);
  const selectedClusterId = useUiStore((s) => s.selectedClusterId);
  const setSelectedClusterId = useUiStore((s) => s.setSelectedClusterId);

  const onMapReady = useCallback(() => setMapReady(true), []);

  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["clusters", status, severityMin],
    queryFn: () =>
      fetchClusters({
        // intentionally do not send bbox from the map viewport
        status,
        severity_min: severityMin,
        limit: 100,
      }),
    // Keep previous clusters while bbox/filter refetch runs — avoids remounting MapContainer
    placeholderData: keepPreviousData,
  });

  const clusters = useMemo(() => {
    let list = data?.data ?? [];
    if (filterSeverity !== "all") {
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
    return list.filter(
      (c) => Number.isFinite(c.latitude) && Number.isFinite(c.longitude),
    );
  }, [data, filterSeverity, search]);

  const selected = clusters.find((c) => c.cluster_id === selectedClusterId);

  // Only skeleton on the very first load (no data yet). Never unmount the map on refetch.
  const showInitialSkeleton = isLoading && !data;

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
          {clusters.length} cluster{clusters.length === 1 ? "" : "s"} in viewport
        </p>
      </div>

      <div className={`relative ${heightClass}`}>
        {showInitialSkeleton ? (
          <Skeleton className="h-full w-full rounded-none" />
        ) : isError && !data ? (
          <div className="flex h-full items-center justify-center text-sm text-red-600">
            Failed to load clusters.
          </div>
        ) : (
          <MapContainer
            center={[CAMPUS_CENTER.lat, CAMPUS_CENTER.lng]}
            zoom={13}
            className="h-full w-full"
            scrollWheelZoom
            // Prevent React from recreating the map instance unnecessarily
            preferCanvas
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapReady onReady={onMapReady} />
            {/* viewport bbox reporter removed to avoid frequent bbox queries */}
            {mapReady ? (
              <FlyToSelected
                lat={selected?.latitude ?? null}
                lng={selected?.longitude ?? null}
              />
            ) : null}
            {clusters.map((c, idx) => {
              const intensity = Math.min(1, Number(c.severity_score) / 100);
              return (
                <CircleMarker
                  key={c.cluster_id}
                  center={[c.latitude, c.longitude]}
                  radius={8 + intensity * 14}
                  pathOptions={{
                    color: severityColor(c.severity_score),
                    fillColor: severityColor(c.severity_score),
                    fillOpacity: 0.35 + intensity * 0.45,
                    weight: selectedClusterId === c.cluster_id ? 3 : 1,
                  }}
                  eventHandlers={{
                    click: () => setSelectedClusterId(c.cluster_id),
                  }}
                >
                    <Popup>
                    <div className="min-w-[180px] space-y-1 text-sm">
                      <p className="font-semibold">{`Cluster ${idx + 1} · ${c.cluster_id.slice(0, 8)}`}</p>
                      <p>Severity: {Number(c.severity_score).toFixed(1)}</p>
                      <p>
                        Reports: {c.report_count} · Devices:{" "}
                        {c.distinct_devices}
                      </p>
                      <Badge tone={severityTone(c.severity_score)}>
                        {severityLevel(c.severity_score)}
                      </Badge>
                      {/* Details page removed from map popup */}
                    </div>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        )}
      </div>
    </Card>
  );
}
