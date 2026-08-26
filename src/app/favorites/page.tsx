import Link from 'next/link';
import { Heart } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { FavoriteGrid } from '@/components/favorites/favorite-grid';


export default async function FavoritesPage() {

  const session = await getServerSession(authOptions);


  const userId =
    (session?.user as { id?: string } | undefined)?.id;


  if (!userId) {
    redirect('/login');
  }



  const favorites = await prisma.favorite.findMany({

    where: {
      userId,
    },


    orderBy: {
      createdAt: 'desc',
    },


    include: {

      listing: {

        include: {

          category: {

            select: {

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

            },

          },

        },

      },

    },

  });





  const listings = favorites

    .filter(
      (favorite) =>
        favorite.listing.status === 'ACTIVE'
    )


    .map((favorite) => ({

      ...favorite.listing,


      price: favorite.listing.price
        ? Number(favorite.listing.price)
        : null,


      _favorited: true,

    }));





  return (

    <div className="container py-10">


      <div className="mb-8">

        <h1 className="font-display text-3xl font-semibold text-branch-900">
          Saved listings
        </h1>


        <p className="mt-2 text-muted-foreground">
          Listings you saved for later.
        </p>

      </div>





      {listings.length === 0 ? (

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">

          <Heart className="h-10 w-10 text-branch-500" />


          <h2 className="mt-4 text-xl font-semibold text-branch-900">
            No saved listings yet
          </h2>


          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            Save listings you like and they will appear here for easy access.
          </p>



          <Link
            href="/browse"
            className="mt-6 rounded-xl bg-branch-600 px-5 py-3 text-sm font-medium text-white hover:bg-branch-700"
          >
            Browse listings
          </Link>


        </div>


      ) : (

        <FavoriteGrid listings={listings as any} />

      )}



    </div>

  );

}