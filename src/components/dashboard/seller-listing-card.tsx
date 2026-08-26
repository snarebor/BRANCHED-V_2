import Image from 'next/image';
import Link from 'next/link';
import {
  Eye,
  Heart,
  Pencil,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { DeleteListingButton } from '@/components/listings/delete-listing-button';
import { formatPrice } from '@/lib/utils';
import { ListingStatusActions } from '@/components/dashboard/listing-status-actions';
type SellerListingCardProps = {
  listing: {
    id: string;
    title: string;
    price: number | null;
    currency: string;
    images: string[];
    views: number;
    status: string;
    favorites: {
      id: string;
    }[];
    category: {
      nameEn: string;
    };
  };
};


export function SellerListingCard({
  listing,
}: SellerListingCardProps) {

  const cover = listing.images?.[0];


  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4 sm:flex-row">

      <div className="relative h-32 w-full overflow-hidden rounded-xl bg-muted sm:w-40">

        {cover ? (

          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover"
          />

        ) : (

          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>

        )}

      </div>



      <div className="flex flex-1 flex-col justify-between">


        <div>

          <div className="flex items-start justify-between gap-3">

            <div>

              <Link
                href={`/listings/${listing.id}`}
                className="font-semibold hover:text-branch-600"
              >
                {listing.title}
              </Link>


              <p className="mt-1 text-sm text-muted-foreground">
                {listing.category.nameEn}
              </p>

            </div>


            <Badge>
              {listing.status}
            </Badge>

          </div>



          <p className="mt-3 font-mono font-semibold text-branch-600">

            {formatPrice(
              listing.price,
              listing.currency
            )}

          </p>



          <div className="mt-3 flex gap-4 text-sm text-muted-foreground">

            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {listing.views}
            </span>


            <span className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              {listing.favorites.length}
            </span>

          </div>

        </div>




   <div className="mt-4 flex flex-wrap items-center gap-2">

  <Button
    asChild
    variant="outline"
  >
    <Link href={`/listings/${listing.id}/edit`}>
      <Pencil className="mr-2 h-4 w-4" />
      Edit
    </Link>
  </Button>

  <ListingStatusActions
    listingId={listing.id}
    status={
      listing.status as
        | 'ACTIVE'
        | 'SOLD'
        | 'ARCHIVED'
        | 'REMOVED'
    }
  />

  <DeleteListingButton
    listingId={listing.id}
  />

</div>


      </div>


    </div>
  );
}