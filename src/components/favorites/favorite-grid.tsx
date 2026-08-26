import { Heart } from 'lucide-react';
import { ListingGrid } from '@/components/listings/listing-grid';
import type { ListingCardData } from '@/types';


export function FavoriteGrid({
  listings,
}: {
  listings: ListingCardData[];
}) {

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">

        <Heart className="h-10 w-10 text-muted-foreground" />

        <p className="font-display text-lg font-medium">
          No saved listings yet
        </p>

        <p className="max-w-sm text-sm text-muted-foreground">
          Save listings you like and find them here later.
        </p>

      </div>
    );
  }


  return (
    <ListingGrid listings={listings} />
  );

}