// Shown inside the account frame while a page's orders/requests load.
export default function Loading() {
  return (
    <div className="space-y-5" aria-busy>
      <div className="h-12 w-1/2 animate-pulse rounded-2xl bg-white/70" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
        ))}
      </div>
      <div className="h-56 animate-pulse rounded-[var(--radius-card)] bg-white/70" />
      <p className="sr-only">Loading…</p>
    </div>
  );
}
