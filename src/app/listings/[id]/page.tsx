import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';

import {
  MapPin,
  Calendar,
  ShieldCheck,
  Pencil,
} from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import {
  formatPrice,
  formatRelativeTime,
  initials,
} from '@/lib/utils';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from '@/components/ui/avatar';

import { SellerStats } from '@/components/seller/seller-stats';
import { TrustBadge } from '@/components/ui/trust-badge';
import { calculateTrustLevel } from '@/lib/trust';
import { FavoriteButton } from '@/components/listings/favorite-button';
import { ListingGallery } from '@/components/listings/listing-gallery';
import { ContactSellerButton } from '@/components/listings/contact-seller-button';
import { ReportButton } from '@/components/report-button';
import { DeleteListingButton } from '@/components/listings/delete-listing-button';
import { RenewListingButton } from '@/components/listings/renew-listing-button';
import { ListingStatusActions } from '@/components/listings/listing-status-actions';

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: {
      id,
    },
  });
  

  if (!listing || listing.status === 'REMOVED') {
    return notFound();
  }

  if (listing.status === 'ACTIVE') {
    await prisma.listing.update({
      where: {
        id,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });
  }


  return prisma.listing.findUnique({
    where: {
      id,
    },

    include: {
      category: {
        select: {
          id: true,
          slug: true,
          nameRu: true,
          nameEn: true,
        },
      },

      user: {
        select: {
          id: true,
          name: true,
          image: true,
          location: true,
          isVerified: true,
          createdAt: true,

          listings: {
            where: {
              status: 'ACTIVE',
            },

            select: {
              id: true,
              views: true,

              favorites: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      },
    },
  });
}


export default async function ListingDetailPage({
  params,
}: {
  params: {
    id: string;
  };
}) {

  const [listing, session] = await Promise.all([
    getListing(params.id),
    getServerSession(authOptions),
  ]);


  if (!listing || listing.status === 'REMOVED') {
    notFound();
  }


  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id;


  const isOwner =
    currentUserId === listing.userId;


  let favorited = false;


  if (currentUserId) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: {
          userId: currentUserId,
          listingId: listing.id,
        },
      },
    });

    favorited = !!fav;
  }


  const sellerTotalViews = listing.user.listings.reduce(
    (total, item) => total + item.views,
    0
  );


  const sellerTotalFavorites = listing.user.listings.reduce(
    (total, item) => total + item.favorites.length,
    0
  );


  const sellerTrust = calculateTrustLevel({
    isVerified: listing.user.isVerified,
    listingsCount: listing.user.listings.length,
    totalViews: sellerTotalViews,
    favoritesCount: sellerTotalFavorites,
    createdAt: listing.user.createdAt,
  });


  return (
    <div className="container max-w-5xl py-8">

      <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">

        <Link href="/browse" className="hover:text-foreground">
          Browse
        </Link>

        <span>/</span>

        <Link
          href={`/browse?category=${listing.category.slug}`}
          className="hover:text-foreground"
        >
          {listing.category.nameRu}
        </Link>

      </div>


      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

        <div className="lg:col-span-2">

          <ListingGallery
            images={listing.images}
            title={listing.title}
          />

          </div>

          <div className="mt-8 flex items-start justify-between gap-4">

            <div>

              <Badge variant="secondary" className="mb-2">
                {listing.category.nameEn}
              </Badge>
              {listing.status !== 'ACTIVE' && (
  <div className="mb-3 rounded-xl border border-border bg-muted px-4 py-3">
    <p className="text-sm font-semibold text-foreground">
      {listing.status === 'SOLD'
        ? 'This listing has been sold'
        : 'This listing is archived'}
    </p>

    <p className="mt-1 text-xs text-muted-foreground">
      {listing.status === 'SOLD'
        ? 'The seller has marked this item as sold.'
        : 'This listing is no longer actively available.'}
    </p>
  </div>
)}


              <h1 className="font-display text-2xl font-semibold text-branch-900 sm:text-3xl">
                {listing.title}
              </h1>


              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">

                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {listing.location}
                </span>


                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  Posted {formatRelativeTime(listing.createdAt)}
                </span>

              </div>

            </div>


            {!isOwner && (
  <FavoriteButton
    listingId={listing.id}
    initialFavorited={favorited}
  />
)}

          </div>



          <p className="mt-2 font-mono text-2xl font-semibold text-branch-600">
            {formatPrice(listing.price as unknown as number | null)}
          </p>



          <div className="prose prose-sm mt-6 max-w-none whitespace-pre-wrap text-foreground">
            {listing.description}
          </div>



         <div className="mt-6 flex items-center border-t border-border pt-4">
  <ReportButton
    listingId={listing.id}
    label="Report this listing"
  />
</div>


        </div>




        <aside className="flex flex-col gap-4">


          <div className="rounded-2xl border border-border bg-card p-5">


            <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Seller
            </p>



            <Link
  href={`/profile/${listing.user.id}`}
  className="flex items-center gap-3 rounded-xl p-2 -mx-2 transition hover:bg-muted/60"
>

              <Avatar className="h-12 w-12">

                <AvatarImage
                  src={listing.user.image ?? undefined}
                  alt={listing.user.name ?? 'Seller'}
                />

                <AvatarFallback>
                  {initials(listing.user.name)}
                </AvatarFallback>

              </Avatar>



              <div>

                <div className="flex flex-wrap items-center gap-2">

                  <p className="flex items-center gap-1 font-medium">

                    {listing.user.name}

                    {listing.user.isVerified && (
                      <ShieldCheck className="h-4 w-4 text-branch-500" />
                    )}

                  </p>


                  <TrustBadge trust={sellerTrust} />

                </div>



                <p className="text-xs text-muted-foreground">
                  {listing.user.location ?? 'Location not provided'}
                </p>


              </div>


            </Link>



            <div className="mt-5">

              <SellerStats
                listingsCount={listing.user.listings.length}
                totalViews={sellerTotalViews}
                favoritesCount={sellerTotalFavorites}
                createdAt={listing.user.createdAt}
              />

            </div>



            <div className="mt-4 flex flex-col gap-2">


              {isOwner ? (
  <>
    <Button
      asChild
      variant="outline"
    >
      <Link href={`/listings/${listing.id}/edit`}>
        <Pencil className="h-4 w-4" />
        Edit listing
      </Link>
    </Button>
    <ListingStatusActions
  listingId={listing.id}
  status={listing.status}
/>

    {(listing.status === 'ARCHIVED' ||
  listing.status === 'SOLD') && (
  <RenewListingButton listingId={listing.id} />
)}
    <DeleteListingButton listingId={listing.id} />
  </>


              ) : listing.status === 'ACTIVE' ? (
  <div className="w-full">
    <ContactSellerButton
      listingId={listing.id}
      sellerId={listing.user.id}
    />
  </div>
) : (
                <div className="rounded-xl bg-muted px-4 py-3 text-center text-sm text-muted-foreground">
                  This listing is no longer available for contact.
                </div>
              )}



             {!isOwner && (
  <div className="pt-1">
    <ReportButton
      reportedUserId={listing.user.id}
      label="Report this user"
    />
  </div>
)}


            </div>


          </div>





          <div className="rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">


            <p className="font-medium text-foreground">
              Stay safe
            </p>


            <ul className="mt-2 list-disc space-y-1 pl-4">

              <li>
                Meet in public places for item exchanges.
              </li>

              <li>
                Never send money before seeing an item or apartment in person.
              </li>

              <li>
                Report anything that feels off.
              </li>

            </ul>


          </div>



        </aside>


      </div>


    
  );
}