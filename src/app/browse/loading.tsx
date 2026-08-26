import { ListingCardSkeleton } from '@/components/listings/listing-card-skeleton';

export default function BrowseLoading() {
  return (
    <div className="container py-8">
      <div className="mb-8 flex flex-col gap-5">
        <div>
          <div className="h-9 w-64 animate-pulse rounded bg-muted" />
          <div className="mt-3 h-4 w-96 max-w-full animate-pulse rounded bg-muted" />
        </div>

        <div className="h-11 w-full animate-pulse rounded-xl bg-muted" />

        <div className="h-10 w-full animate-pulse rounded-xl bg-muted" />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="h-10 w-48 animate-pulse rounded-full bg-muted" />

          <div className="h-9 w-80 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <div className="mb-5 h-5 w-32 animate-pulse rounded bg-muted" />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ListingCardSkeleton key={index} />
        ))}
      </div>
    </div>
  );
}