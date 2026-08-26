import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ListingForm } from '@/components/listings/listing-form';

export default async function EditListingPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/login');
  }

  const [user, listing, categories] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBanned: true,
      },
    }),

    prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        category: {
          select: {
            slug: true,
          },
        },
      },
    }),

    prisma.category.findMany({
      orderBy: { nameRu: 'asc' },
      select: {
        id: true,
        slug: true,
        nameRu: true,
        nameEn: true,
        icon: true,
      },
    }),
  ]);

  if (!user) {
    redirect('/login');
  }

  if (user.isBanned) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-branch-900">
            Account restricted
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been banned and you cannot edit listings.
          </p>
        </div>
      </div>
    );
  }

  if (!listing) {
    notFound();
  }

  if (userId !== listing.userId) {
    redirect(`/listings/${listing.id}`);
  }

  if (listing.status === 'REMOVED') {
    return (
      <div className="container max-w-2xl py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-branch-900">
            Listing unavailable
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            This listing was removed and cannot be edited.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-display text-2xl font-semibold text-branch-900">
        Edit listing
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Update details, photos, or mark this as sold.
      </p>

      <div className="mt-8">
        <ListingForm
          categories={categories}
          listingId={listing.id}
          initialValues={{
            title: listing.title,
            description: listing.description,
            price: listing.price ? String(listing.price) : '',
            location: listing.location,
            images: listing.images,
            categorySlug: listing.category.slug,
          }}
        />
      </div>
    </div>
  );
}