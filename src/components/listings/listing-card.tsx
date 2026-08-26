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



          <div className="absolute left-3 top-3 flex flex-col gap-2">

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
              className="bg-card/90"
            >
              {listing.category.nameEn}
            </Badge>

          </div>


        </div>

      </Link>



      <div className="absolute right-3 top-3">

        <FavoriteButton
          listingId={listing.id}
          initialFavorited={!!listing._favorited}
          floating
        />

      </div>





      <Link
        href={`/listings/${listing.id}`}
        className="flex flex-1 flex-col gap-2 p-4"
      >


        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug">
          {listing.title}
        </h3>



        <p className="font-mono text-base font-semibold text-branch-600">
          {formatPrice(
            listing.price,
            listing.currency
          )}
        </p>




        <div className="mt-auto flex flex-col gap-1 pt-2 text-xs text-muted-foreground">


          <span className="flex items-center gap-1">

            <MapPin className="h-3 w-3"/>

            {listing.location}

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