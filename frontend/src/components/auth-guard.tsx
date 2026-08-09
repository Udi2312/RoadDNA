"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { DashboardShell } from "@/components/dashboard-shell";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (!loading && !token) {
      router.replace("/login");
    }
  }, [token, loading, router]);

  if (loading || !token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--rd-bg)] text-[var(--rd-muted)]">
        Checking session…
      </div>
    );
  }

  return <DashboardShell>{children}</DashboardShell>;
}
