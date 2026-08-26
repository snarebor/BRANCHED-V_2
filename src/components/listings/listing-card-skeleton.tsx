export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] animate-pulse bg-muted" />

      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />

        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />

        <div className="h-5 w-1/3 animate-pulse rounded bg-muted" />

        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}