import Link from 'next/link';
import Image from 'next/image';
import { MapPin, ImageOff, Eye } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { TrustBadge } from '@/components/ui/trust-badge';

import { formatPrice, formatRelativeTime, formatCompactNumber } from '@/lib/utils';

import type { ListingCardData } from '@/types';


export function ListingCard({
  listing,
}: {
  listing: ListingCardData;
}) {

  const cover = listing.images?.[0];


  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition hover:shadow-md">


      <Link
        href={`/listings/${listing.id}`}
        className="block"
      >

        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">


          {cover ? (

            <Image
              src={cover}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width:768px) 50vw, 33vw"
            />

          ) : (

            <div className="flex h-full items-center justify-center text-muted-foreground">
              <ImageOff className="h-8 w-8"/>
            </div>

          )}



          <div className="absolute left-2 top-2 flex max-w-[65%] flex-col gap-1 sm:left-3 sm:top-3 sm:gap-2">

            {listing.featured && (
  <Badge
    variant="secondary"
    className="bg-branch-500 text-white"
  >
    Featured
  </Badge>
)}

            <Badge
              variant="secondary"
              className="max-w-full truncate bg-card/90 text-[10px] sm:text-xs"
            >
              {listing.category.nameEn}
            </Badge>

          </div>


        </div>

      </Link>



      <div className="absolute right-2 top-2 sm:right-3 sm:top-3">

        <FavoriteButton
          listingId={listing.id}
          initialFavorited={!!listing._favorited}
          floating
        />

      </div>





      <Link
        href={`/listings/${listing.id}`}
        className="flex flex-1 flex-col gap-2 p-3 sm:p-4"
      >


        <h3 className="line-clamp-2 font-display text-sm font-semibold leading-snug sm:text-base">
          {listing.title}
        </h3>



        <p className="break-words font-mono text-sm font-semibold text-branch-600 sm:text-base">
          {formatPrice(
            listing.price,
            listing.currency
          )}
        </p>




        <div className="mt-auto flex flex-col gap-1 pt-2 text-xs text-muted-foreground">


          <span className="flex min-w-0 items-center gap-1">
  <MapPin className="h-3 w-3 shrink-0" />
  <span className="truncate">{listing.location}</span>
</span>



          <div className="flex items-center justify-between">


            <span>
              {formatRelativeTime(listing.createdAt)}
            </span>



            <span className="flex items-center gap-1">

              <Eye className="h-3 w-3"/>

              {formatCompactNumber(listing.views)}

            </span>


          </div>


        </div>


      </Link>


    </div>
  );
}