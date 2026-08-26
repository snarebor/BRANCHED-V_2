import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ListingStatus } from '@prisma/client';
import { SellerListingCard } from '@/components/dashboard/seller-listing-card';


export default async function SellerListingsPage({
  searchParams,
}: {
  searchParams: {
    status?: string;
  };
}) {


  const session =
    await getServerSession(authOptions);



  const userId =
    (session?.user as { id?: string } | undefined)?.id;



  if (!userId) {
    redirect('/login');
  }
  const status =
  (searchParams.status as ListingStatus | 'ALL') ??
  'ALL';


const [
  allCount,
  activeCount,
  soldCount,
  archivedCount,
  removedCount,
] = await Promise.all([

  prisma.listing.count({
    where: {
      userId,
    },
  }),

  prisma.listing.count({
    where: {
      userId,
      status: 'ACTIVE',
    },
  }),

  prisma.listing.count({
    where: {
      userId,
      status: 'SOLD',
    },
  }),

  prisma.listing.count({
    where: {
      userId,
      status: 'REMOVED',
    },
  }),

  prisma.listing.count({
    where: {
      userId,
      status: 'ARCHIVED',
    },
  }),

]);

  const listings =
    await prisma.listing.findMany({

      where: {
  userId,

  ...(status !== 'ALL'
    ? {
        status,
      }
    : {}),
},


      orderBy: {
        createdAt: 'desc',
      },


      include: {

        category: {
          select: {
            nameEn: true,
          },
        },


        favorites: {
          select: {
            id: true,
          },
        },

      },

    });



  return (

    <div className="container max-w-4xl py-10">


      <h1 className="font-display text-3xl font-semibold text-branch-900">
        Manage Listings
      </h1>


      <p className="mt-2 text-muted-foreground">
        Edit, monitor and manage your marketplace posts.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">

  <Link
    href="/dashboard/listings"
    className={`rounded-full px-4 py-2 text-sm transition ${
      status === 'ALL'
        ? 'bg-branch-600 text-white'
        : 'bg-muted'
    }`}
  >
    All ({allCount})
  </Link>

  <Link
    href="/dashboard/listings?status=ACTIVE"
    className={`rounded-full px-4 py-2 text-sm transition ${
      status === 'ACTIVE'
        ? 'bg-branch-600 text-white'
        : 'bg-muted'
    }`}
  >
    Active ({activeCount})
  </Link>

  <Link
    href="/dashboard/listings?status=SOLD"
    className={`rounded-full px-4 py-2 text-sm transition ${
      status === 'SOLD'
        ? 'bg-branch-600 text-white'
        : 'bg-muted'
    }`}
  >
    Sold ({soldCount})
  </Link>
  <Link
  href="/dashboard/listings?status=ARCHIVED"
  className={`rounded-full px-4 py-2 text-sm transition ${
    status === 'ARCHIVED'
      ? 'bg-branch-600 text-white'
      : 'bg-muted'
  }`}
>
  Archived ({archivedCount})
</Link>

  <Link
    href="/dashboard/listings?status=REMOVED"
    className={`rounded-full px-4 py-2 text-sm transition ${
      status === 'REMOVED'
        ? 'bg-branch-600 text-white'
        : 'bg-muted'
    }`}
  >
    Removed ({removedCount})
  </Link>

</div>



      <div className="mt-8 space-y-4">


        {listings.length === 0 ? (

          <div className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">

            You have no listings yet.

          </div>


        ) : (


          listings.map((listing) => (

            <SellerListingCard
              key={listing.id}
              listing={{
                ...listing,
                price: listing.price
                  ? Number(listing.price)
                  : null,
              }}
            />

          ))


        )}


      </div>


    </div>

  );
}