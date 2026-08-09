import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-[var(--rd-border)] bg-[var(--rd-panel)] shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-[var(--rd-border)] px-5 py-4">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-0.5 text-sm text-[var(--rd-muted)]">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card className="p-5">
      <p className="text-sm text-[var(--rd-muted)]">{label}</p>
      <p className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-[var(--rd-muted)]">{hint}</p> : null}
    </Card>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--rd-border)]/70",
        className,
      )}
    />
  );
}

export function Button({
  children,
  className,
  variant = "primary",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
}) {
  const styles = {
    primary:
      "bg-[var(--rd-accent)] text-white hover:opacity-90 disabled:opacity-50",
    secondary:
      "border border-[var(--rd-border)] bg-[var(--rd-panel)] hover:bg-[var(--rd-hover)]",
    danger: "bg-red-600 text-white hover:bg-red-500 disabled:opacity-50",
    ghost: "hover:bg-[var(--rd-hover)] text-[var(--rd-muted)]",
  } as const;

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition disabled:cursor-not-allowed",
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "green" | "yellow" | "red" | "blue";
}) {
  const tones = {
    neutral: "bg-zinc-500/15 text-zinc-700 dark:text-zinc-300",
    green: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    yellow: "bg-yellow-500/15 text-yellow-800 dark:text-yellow-200",
    red: "bg-red-500/15 text-red-700 dark:text-red-300",
    blue: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
        tones[tone],
      )}
    >
      {children}
    </span>
  );
}
