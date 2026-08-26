import { PackageSearch } from 'lucide-react';
import { ListingCard } from '@/components/listings/listing-card';
import type { ListingCardData } from '@/types';

type Props = {
  listings: ListingCardData[];
  emptyMessage?: string;
};


export function ListingGrid({
  listings,
  emptyMessage,
}: Props) {


  if (listings.length === 0) {

    return (

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border py-24 text-center">

        <PackageSearch className="h-10 w-10 text-muted-foreground"/>


        <p className="font-display text-lg font-medium">
          "No listings found"
        </p>


        <p className="max-w-sm text-sm text-muted-foreground">

          {emptyMessage ??
            "Try adjusting your search or filters, or be the first person to create a listing."
          }

        </p>


      </div>

    );

  }



  return (

    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">

      {listings.map((listing)=>(

        <ListingCard
          key={listing.id}
          listing={listing}
        />

      ))}

    </div>

  );

}