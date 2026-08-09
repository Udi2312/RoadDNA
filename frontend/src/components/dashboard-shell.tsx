"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  ClipboardList,
  FileWarning,
  LogOut,
  Map,
  Menu,
  Wrench,
  X,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useUiStore } from "@/lib/store";
import { isMockMode } from "@/lib/api";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/map", label: "Heatmap", icon: Map },
  { href: "/clusters", label: "Clusters", icon: ClipboardList },
  { href: "/work-orders", label: "Work Orders", icon: Wrench },
  { href: "/reports", label: "Citizen Reports", icon: FileWarning },
];

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);

  function onLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <div className="flex min-h-screen bg-[var(--rd-bg)] text-[var(--rd-fg)]">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[var(--rd-border)] bg-[var(--rd-panel)] transition-transform lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center gap-3 border-b border-[var(--rd-border)] px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--rd-accent)] text-white">
            <Activity className="h-5 w-5" />
          </div>
          <div>
            <p className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              RoadDNA
            </p>
            <p className="text-xs text-[var(--rd-muted)]">Municipality Ops</p>
          </div>
          <button
            type="button"
            className="ml-auto rounded-md p-1 lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {nav.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[var(--rd-accent-soft)] text-[var(--rd-accent)]"
                    : "text-[var(--rd-muted)] hover:bg-[var(--rd-hover)] hover:text-[var(--rd-fg)]",
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-[var(--rd-border)] p-4">
          {isMockMode() && (
            <p className="mb-3 rounded-md bg-amber-500/15 px-2 py-1 text-[11px] font-medium text-amber-700 dark:text-amber-300">
              Mock mode — set NEXT_PUBLIC_USE_MOCKS=false for live API
            </p>
          )}
          <div className="mb-3">
            <p className="text-sm font-medium">
              {user?.full_name ?? "Operator"}
            </p>
            <p className="text-xs text-[var(--rd-muted)]">
              {user?.email} · {user?.role}
            </p>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--rd-muted)] transition hover:bg-[var(--rd-hover)] hover:text-[var(--rd-fg)]"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          aria-label="Close overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-[var(--rd-border)] bg-[var(--rd-panel)]/90 px-4 py-3 backdrop-blur lg:px-6">
          <button
            type="button"
            className="rounded-md p-2 hover:bg-[var(--rd-hover)] lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <p className="text-sm text-[var(--rd-muted)]">Phase 1 & 2 dashboard</p>
            <p className="font-medium">Road health operations</p>
          </div>
          <div className="hidden items-center gap-3 text-xs sm:flex">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Low
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" /> Moderate
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Severe
            </span>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
