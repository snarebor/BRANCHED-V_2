import { ListingCardSkeleton } from '@/components/listings/listing-card-skeleton';

function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <ListingCardSkeleton key={index} />
      ))}
    </div>
  );
}

export default function Loading() {
  return (
    <div>
      <section className="border-b border-border bg-gradient-to-b from-branch-50/60 to-background">
        <div className="container flex flex-col items-center gap-8 py-16 sm:py-24">
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />

          <div className="h-12 w-full max-w-2xl animate-pulse rounded bg-muted" />

          <div className="h-6 w-full max-w-xl animate-pulse rounded bg-muted" />

          <div className="h-12 w-full max-w-xl animate-pulse rounded-xl bg-muted" />
        </div>
      </section>

      <section className="container py-12">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-20 animate-pulse rounded-2xl bg-muted"
            />
          ))}
        </div>
      </section>

      <section className="container pb-12">
        <div className="mb-5 h-8 w-48 animate-pulse rounded bg-muted" />
        <SkeletonGrid />
      </section>

      <section className="container pb-12">
        <div className="mb-5 h-8 w-48 animate-pulse rounded bg-muted" />
        <SkeletonGrid />
      </section>

      <section className="container pb-24">
        <div className="mb-6">
          <div className="h-8 w-48 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-muted" />
        </div>

        <SkeletonGrid />
      </section>
    </div>
  );
}