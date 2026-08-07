"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Activity } from "lucide-react";
import { login } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("admin@roaddna.local");
  const [password, setPassword] = useState("password");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(email, password);
      setSession(res.token, res.user, remember);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 20% 20%, #0f7a4e33, transparent), radial-gradient(ellipse 70% 50% at 80% 80%, #1d4ed833, transparent), linear-gradient(160deg, #0c1210, #14241c 45%, #0c1210)",
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-md rounded-2xl border border-white/10 bg-[#141c18]/90 p-8 text-[#e8f0eb] shadow-2xl backdrop-blur"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f7a4e] text-white">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
              RoadDNA
            </h1>
            <p className="text-sm text-[#9aaba2]">Municipality sign-in</p>
          </div>
        </div>

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block text-[#9aaba2]">Email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 outline-none focus:border-[#3ecf8e]"
          />
        </label>

        <label className="mb-4 block text-sm">
          <span className="mb-1.5 block text-[#9aaba2]">Password</span>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-11 w-full rounded-lg border border-white/10 bg-black/30 px-3 outline-none focus:border-[#3ecf8e]"
          />
        </label>

        <label className="mb-6 flex items-center gap-2 text-sm text-[#9aaba2]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="rounded"
          />
          Remember me
        </label>

        {error ? (
          <p className="mb-4 rounded-lg bg-red-500/15 px-3 py-2 text-sm text-red-300">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={loading}
          className="h-11 w-full bg-[#0f7a4e] hover:opacity-90"
        >
          {loading ? "Signing in…" : "Sign in"}
        </Button>

        <p className="mt-5 text-center text-xs text-[#9aaba2]">
          Demo: admin@roaddna.local / password
        </p>
      </form>
    </div>
  );
}
