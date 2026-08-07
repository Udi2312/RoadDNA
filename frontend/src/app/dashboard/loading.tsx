export default function DashboardLoading() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-8 w-56 rounded-lg bg-[var(--rd-border)]" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl bg-[var(--rd-border)]" />
        ))}
      </div>
      <div className="h-80 rounded-xl bg-[var(--rd-border)]" />
    </div>
  );
}
