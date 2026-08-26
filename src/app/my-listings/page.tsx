import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Plus } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ListingStatusActions } from '@/components/listings/listing-status-actions';
import { DeleteListingButton } from '@/components/listings/delete-listing-button';
import { RenewListingButton } from '@/components/listings/renew-listing-button';

export default async function MyListingsPage() {
  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-branch-900">
            Sign in to view your listings
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            You need to be signed in to manage your listings.
          </p>

          <Button asChild className="mt-5">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isBanned: true,
    },
  });

  if (!user) {
    return (
      <div className="container max-w-4xl py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-xl font-semibold text-branch-900">
            Account unavailable
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            We could not find your account.
          </p>
        </div>
      </div>
    );
  }

  const listings = await prisma.listing.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      category: {
        select: {
          nameEn: true,
          nameRu: true,
        },
      },
    },
  });

  const activeListings = listings.filter(
    (listing) => listing.status === 'ACTIVE'
  );

  const archivedListings = listings.filter(
    (listing) => listing.status === 'ARCHIVED'
  );

  const soldListings = listings.filter(
    (listing) => listing.status === 'SOLD'
  );

  const removedListings = listings.filter(
    (listing) => listing.status === 'REMOVED'
  );

  return (
    <div className="container max-w-5xl py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-branch-900">
            My Listings
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Manage the items you have posted on BRANCHED.
          </p>
        </div>

        {!user.isBanned && (
          <Button asChild>
            <Link href="/listings/new">
              <Plus className="h-4 w-4" />
              Post a listing
            </Link>
          </Button>
        )}
      </div>

      {user.isBanned ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-xl font-semibold text-branch-900">
            Account restricted
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been banned. You can view your existing listings,
            but you cannot create, edit, renew, or manage them.
          </p>
        </div>
      ) : listings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
          <h2 className="font-display text-xl font-semibold text-branch-900">
            You have no listings yet
          </h2>

          <p className="mt-2 text-sm text-muted-foreground">
            Post your first listing to start selling on BRANCHED.
          </p>

          <Button asChild className="mt-6">
            <Link href="/listings/new">
              <Plus className="h-4 w-4" />
              Post your first listing
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-8">
          <ListingSection
            title="Active"
            count={activeListings.length}
            listings={activeListings}
            isBanned={user.isBanned}
          />

          <ListingSection
            title="Archived"
            count={archivedListings.length}
            listings={archivedListings}
            isBanned={user.isBanned}
          />

          <ListingSection
            title="Sold"
            count={soldListings.length}
            listings={soldListings}
            isBanned={user.isBanned}
          />

          <ListingSection
            title="Removed"
            count={removedListings.length}
            listings={removedListings}
            isBanned={user.isBanned}
          />
        </div>
      )}
    </div>
  );
}

function ListingSection({
  title,
  count,
  listings,
  isBanned,
}: {
  title: string;
  count: number;
  isBanned: boolean;
  listings: Array<{
    id: string;
    title: string;
    price: unknown;
    location: string;
    images: string[];
    views: number;
    status: string;
    category: {
      nameEn: string;
      nameRu: string;
    };
  }>;
}) {
  if (listings.length === 0) {
    return null;
  }

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h2 className="font-display text-lg font-semibold text-branch-900">
          {title}
        </h2>

        <Badge variant="secondary">
          {count}
        </Badge>
      </div>

      <div className="space-y-3">
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  href={`/listings/${listing.id}`}
                  className="font-medium text-branch-900 hover:underline"
                >
                  {listing.title}
                </Link>

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{listing.category.nameEn}</span>
                  <span>{listing.location}</span>
                  <span>{listing.views} views</span>
                </div>

                <p className="mt-2 font-mono font-semibold text-branch-600">
                  {listing.price
                    ? `${Number(listing.price).toLocaleString()} ₽`
                    : 'Price on request'}
                </p>
              </div>

              {!isBanned && listing.status !== 'REMOVED' && (
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link href={`/listings/${listing.id}`}>
                      View
                    </Link>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                  >
                    <Link href={`/listings/${listing.id}/edit`}>
                      Edit
                    </Link>
                  </Button>

                  <ListingStatusActions
                    listingId={listing.id}
                    status={listing.status as any}
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
          </div>
        ))}
      </div>
    </section>
  );
}