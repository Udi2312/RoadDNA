"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store";
import { DashboardShell } from "@/components/dashboard-shell";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrateFromStorage = useAuthStore((s) => s.hydrateFromStorage);

  useEffect(() => {
    hydrateFromStorage();
  }, [hydrateFromStorage]);

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--rd-bg)] text-[var(--rd-muted)]">
        Checking session…
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
