import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  MapPin,
  Calendar,
  ShieldCheck,
  Pencil,
  ChevronRight,
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

const CHARACTERISTIC_LABELS: Record<string, string> = {
  condition: 'Condition',
  brand: 'Brand',
  model: 'Model',
  specifications: 'Specifications',

  make: 'Make',
  year: 'Year',
  mileage: 'Mileage',
  transmission: 'Transmission',
  fuel: 'Fuel type',

  propertyType: 'Property type',
  rooms: 'Rooms',
  area: 'Area',
  floor: 'Floor',
  totalFloors: 'Total floors',
  furnished: 'Furnished',
  rentalType: 'Listing type',

  employmentType: 'Employment type',
  schedule: 'Schedule',
  experience: 'Experience',
  salary: 'Salary',

  serviceType: 'Service type',
  availability: 'Availability',
  format: 'Format',

  details: 'Details',

  type: 'Type',
  subject: 'Subject',
  level: 'Level',

  eventType: 'Event type',
  date: 'Date',
  time: 'Time',
};

function getCharacteristicLabel(key: string) {
  return (
    CHARACTERISTIC_LABELS[key] ??
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (char) => char.toUpperCase())
  );
}

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

  const sellerTotalViews =
    listing.user.listings.reduce(
      (total, item) => total + item.views,
      0,
    );

  const sellerTotalFavorites =
    listing.user.listings.reduce(
      (total, item) =>
        total + item.favorites.length,
      0,
    );

  const sellerTrust = calculateTrustLevel({
    isVerified: listing.user.isVerified,
    listingsCount:
      listing.user.listings.length,
    totalViews: sellerTotalViews,
    favoritesCount: sellerTotalFavorites,
    createdAt: listing.user.createdAt,
  });

  const characteristics =
    (listing.characteristics as Record<
      string,
      string
    > | null) ?? {};

  const visibleCharacteristics =
    Object.entries(characteristics).filter(
      ([, value]) => value?.trim(),
    );

  return (
    <div className="container max-w-5xl px-4 py-5 sm:py-8">
      {/* Breadcrumbs */}
      <div className="mb-4 flex min-w-0 items-center gap-1 overflow-hidden text-sm text-muted-foreground sm:mb-6">
        <Link
          href="/browse"
          className="shrink-0transition hover:text-foreground"
        >
          Browse
        </Link>

        <ChevronRight className="h-4 w-4 shrink-0"/>

        <Link
          href={`/browse?category=${listing.category.slug}`}
          className="transition hover:text-foreground"
        >
          {listing.category.nameRu}
        </Link>

        <ChevronRight className="h-4 w-4" />

        <span className="truncate text-foreground">
          {listing.title}
        </span>
      </div>

      {/* Gallery */}
      <ListingGallery
        images={listing.images}
        title={listing.title}
      />

      <div className="mt-8">
        {/* Main listing information */}
        <section>
          {/* Category + status */}
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">
              {listing.category.nameEn}
            </Badge>

            {listing.status !== 'ACTIVE' && (
              <Badge
                variant={
                  listing.status === 'SOLD'
                    ? 'default'
                    : 'outline'
                }
              >
                {listing.status === 'SOLD'
                  ? 'Sold'
                  : 'Archived'}
              </Badge>
            )}
          </div>

          {/* Price */}
         <p className="break-words font-mono text-2xl font-semibold tracking-tight text-branch-600 sm:text-3xl">
            {formatPrice(
              listing.price as unknown as
                number | null,
            )}
          </p>

          {/* Title */}
          <h1 className="mt-2 max-w-3xl break-words font-display text-2xl font-semibold tracking-tight text-branch-900 sm:text-4xl">
            {listing.title}
          </h1>

          {/* Location + date */}
          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex min-w-0 items-center gap-1.5">
  <MapPin className="h-4 w-4 shrink-0" />
  <span className="break-words">{listing.location}</span>
</span>

            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              Posted{' '}
              {formatRelativeTime(
                listing.createdAt,
              )}
            </span>
          </div>

          {/* Status notice */}
          {listing.status !== 'ACTIVE' && (
            <div className="mt-6 rounded-2xl border border-border bg-muted/50 p-4">
              <p className="text-sm font-semibold text-foreground">
                {listing.status === 'SOLD'
                  ? 'This listing has been sold'
                  : 'This listing is archived'}
              </p>

              <p className="mt-1 text-sm text-muted-foreground">
                {listing.status === 'SOLD'
                  ? 'The seller has marked this item as sold.'
                  : 'This listing is no longer actively available.'}
              </p>
            </div>
          )}

          {/* Primary actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isOwner &&
              listing.status === 'ACTIVE' && (
                <div className="flex-1 sm:max-w-sm">
                  <ContactSellerButton
                    listingId={listing.id}
                    sellerId={listing.user.id}
                  />
                </div>
              )}

            {!isOwner && (
              <FavoriteButton
                listingId={listing.id}
                initialFavorited={favorited}
              />
            )}

            {isOwner && (
              <div className="flex flex-wrap gap-2">
                <Button
                  asChild
                  variant="outline"
                >
                  <Link
                    href={`/listings/${listing.id}/edit`}
                  >
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
          </div>

          {/* Characteristics */}
          {visibleCharacteristics.length > 0 && (
            <section className="mt-10 border-t border-border pt-8">
              <h2 className="font-display text-xl font-semibold text-branch-900">
                Details
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
                {visibleCharacteristics.map(
                  ([key, value]) => (
                    <div
                      key={key}
                      className="bg-card px-4 py-4"
                    >
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {getCharacteristicLabel(
                          key,
                        )}
                      </p>

                      <p className="mt-1 text-sm font-medium text-foreground">
                        {value}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          {/* Description */}
          <section className="mt-10 border-t border-border pt-8">
            <h2 className="font-display text-xl font-semibold text-branch-900">
              Description
            </h2>

            <div className="prose prose-sm mt-4 max-w-none break-words whitespace-pre-wrap text-foreground">
              {listing.description}
            </div>
          </section>

          {/* Report */}
          {!isOwner && (
            <div className="mt-8 flex items-center border-t border-border pt-5">
              <ReportButton
                listingId={listing.id}
                label="Report this listing"
              />
            </div>
          )}
        </section>

        {/* Seller */}
        <section className="mt-12 border-t border-border pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Seller
              </p>

              <Link
                href={`/profile/${listing.user.id}`}
                className="mt-3 flex items-center gap-3 rounded-xl transition hover:opacity-80"
              >
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      listing.user.image ??
                      undefined
                    }
                    alt={
                      listing.user.name ??
                      'Seller'
                    }
                  />

                  <AvatarFallback>
                    {initials(
                      listing.user.name,
                    )}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="flex items-center gap-1 font-medium text-foreground">
                      {listing.user.name}
                      {listing.user.isVerified && (
                        <ShieldCheck className="h-4 w-4 text-branch-500" />
                      )}
                    </p>

                    <TrustBadge
                      trust={sellerTrust}
                    />
                  </div>

                  <p className="text-xs text-muted-foreground">
                    {listing.user.location ??
                      'Location not provided'}
                  </p>
                </div>
              </Link>
            </div>

            <div className="sm:max-w-md">
              <SellerStats
                listingsCount={
                  listing.user.listings.length
                }
                totalViews={sellerTotalViews}
                favoritesCount={
                  sellerTotalFavorites
                }
                createdAt={
                  listing.user.createdAt
                }
              />
            </div>
          </div>

          {!isOwner && (
            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                View the seller's profile and
                other active listings.
              </p>

              <Button
                asChild
                variant="outline"
              >
                <Link
                  href={`/profile/${listing.user.id}`}
                >
                  View profile
                </Link>
              </Button>
            </div>
          )}

          {!isOwner && (
            <div className="mt-4">
              <ReportButton
                reportedUserId={listing.user.id}
                label="Report this user"
              />
            </div>
          )}
        </section>

        {/* Safety */}
        <section className="mt-8 rounded-2xl border border-dashed border-border p-5 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">
            Stay safe
          </p>

          <ul className="mt-2 list-disc space-y-1 pl-4">
            <li>
              Meet in public places for item
              exchanges.
            </li>

            <li>
              Never send money before seeing an
              item or apartment in person.
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