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

      {/* Breadcrumbs */}
      <div className="mb-5 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href="/browse"
          className="hover:text-foreground"
        >
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


      {/* Gallery */}
      <ListingGallery
        images={listing.images}
        title={listing.title}
      />


      {/* Main listing content */}
      <div className="mt-8">

        {/* Price */}
        <div className="text-3xl font-bold tracking-tight text-branch-600 sm:text-4xl">
          {formatPrice(
            listing.price as unknown as number | null
          )}
        </div>


        {/* Title + metadata */}
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <h1 className="font-display text-2xl font-semibold text-branch-900 sm:text-3xl">
              {listing.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">

              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {listing.location}
              </span>

              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
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


        {/* Status */}
        {listing.status !== 'ACTIVE' && (
          <div className="mt-5 rounded-xl border border-border bg-muted px-4 py-3">
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


        {/* Contact seller */}
        {!isOwner && listing.status === 'ACTIVE' && (
          <div className="mt-6 max-w-md">
            <ContactSellerButton
              listingId={listing.id}
              sellerId={listing.user.id}
            />
          </div>
        )}


        {/* Owner controls */}
        {isOwner && (
          <div className="mt-6 flex flex-wrap gap-2">

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
              <RenewListingButton
                listingId={listing.id}
              />
            )}

            <DeleteListingButton
              listingId={listing.id}
            />

          </div>
        )}


        {/* Listing details */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-5 sm:p-6">

          <div className="mb-5">
            <h2 className="font-display text-lg font-semibold text-branch-900">
              Listing details
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Information about this listing.
            </p>
          </div>


          <div className="grid gap-x-8 gap-y-5 sm:grid-cols-2">

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Type of ad
              </p>

              <p className="mt-1 font-medium text-foreground">
                {listing.category.nameEn}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Location
              </p>

              <p className="mt-1 font-medium text-foreground">
                {listing.location}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Category
              </p>

              <p className="mt-1 font-medium text-foreground">
                {listing.category.nameRu}
              </p>
            </div>


            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Posted
              </p>

              <p className="mt-1 font-medium text-foreground">
                {formatRelativeTime(listing.createdAt)}
              </p>
            </div>

          </div>

        </section>


        {/* Description */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5 sm:p-6">

          <h2 className="font-display text-lg font-semibold text-branch-900">
            Description
          </h2>

          <div className="mt-4 whitespace-pre-wrap text-sm leading-7 text-foreground sm:text-base">
            {listing.description}
          </div>

        </section>


        {/* Report listing */}
        {!isOwner && (
          <div className="mt-4 flex items-center border-t border-border pt-4">
            <ReportButton
              listingId={listing.id}
              label="Report this listing"
            />
          </div>
        )}


        {/* Seller */}
        <section className="mt-8 rounded-2xl border border-border bg-card p-5">

          <div className="mb-4 flex items-center justify-between">

            <div>
              <h2 className="font-display text-lg font-semibold text-branch-900">
                Seller
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                About the person behind this listing.
              </p>
            </div>

            <Link
              href={`/profile/${listing.user.id}`}
              className="text-sm font-medium text-branch-600 hover:underline"
            >
              View profile
            </Link>

          </div>


          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            <Link
              href={`/profile/${listing.user.id}`}
              className="flex items-center gap-3 rounded-xl p-2 -m-2 transition hover:bg-muted/60"
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


            <div className="sm:min-w-[260px]">
              <SellerStats
                listingsCount={listing.user.listings.length}
                totalViews={sellerTotalViews}
                favoritesCount={sellerTotalFavorites}
                createdAt={listing.user.createdAt}
              />
            </div>

          </div>


          {/* Report seller */}
          {!isOwner && (
            <div className="mt-4 border-t border-border pt-4">
              <ReportButton
                reportedUserId={listing.user.id}
                label="Report this user"
              />
            </div>
          )}

        </section>


        {/* Safety */}
        <section className="mt-6 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">

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

        </section>

      </div>

    </div>
  );
}