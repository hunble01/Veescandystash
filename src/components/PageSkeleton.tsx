import { Container } from "./ui";

// Brief placeholder while a product or occasion page loads its content.
export function PageSkeleton() {
  return (
    <Container className="grid gap-8 py-10 lg:grid-cols-2" aria-busy>
      <div className="aspect-square animate-pulse rounded-[var(--radius-card)] bg-orange-soft" />
      <div className="space-y-4">
        <div className="h-6 w-24 animate-pulse rounded-full bg-pink-soft" />
        <div className="h-14 w-3/4 animate-pulse rounded-2xl bg-cream-deep" />
        <div className="h-5 w-full animate-pulse rounded-full bg-cream-deep" />
        <div className="h-5 w-2/3 animate-pulse rounded-full bg-cream-deep" />
      </div>
      <span className="sr-only">Loading…</span>
    </Container>
  );
}
