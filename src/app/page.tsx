import Link from 'next/link';
import {
  ShieldCheck,
  Search as SearchIcon,
  MessagesSquare,
  Star,
  Flame,
  Clock,
} from 'lucide-react';

import { SearchBar } from '@/components/search/search-bar';
import { ListingGrid } from '@/components/listings/listing-grid';
import { Button } from '@/components/ui/button';

import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';


async function getListings(userId?: string) {

  const listings = await prisma.listing.findMany({

    where: {
      status: 'ACTIVE',

      OR: [
        {
          expiresAt: null,
        },
        {
          expiresAt: {
            gt: new Date(),
          },
        },
      ],
    },


    orderBy: [
      {
        featured: 'desc',
      },
      {
        createdAt: 'desc',
      },
    ],


    take: 8,


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
          isVerified: true,
        },
      },


      favorites: userId
        ? {
            where: {
              userId,
            },
            select: {
              id: true,
            },
          }
        : false,

    },

  });



  return listings.map((listing) => ({

    ...listing,

    price: listing.price
      ? Number(listing.price)
      : null,


    _favorited:
      userId && 'favorites' in listing
        ? listing.favorites.length > 0
        : false,

  }));

}




async function getFeaturedListings() {

  const listings = await prisma.listing.findMany({

    where: {
      status: 'ACTIVE',
      featured: true,
    },


    orderBy: {
      createdAt: 'desc',
    },


    take: 4,


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
          isVerified: true,
        },
      },

    },

  });



  return listings.map((listing) => ({
    ...listing,
    price: listing.price
      ? Number(listing.price)
      : null,
  }));

}




async function getPopularListings() {

  const listings = await prisma.listing.findMany({

    where: {
      status: 'ACTIVE',
    },


    orderBy: {
      views: 'desc',
    },


    take: 4,


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
          isVerified: true,
        },
      },

    },

  });



  return listings.map((listing) => ({
    ...listing,

    price: listing.price
      ? Number(listing.price)
      : null,

  }));

}





const CATEGORY_SHORTCUTS = [

  {
    slug: 'housing',
    name: 'Housing',
    blurb: 'Rooms, apartments, sublets',
  },

  {
    slug: 'jobs',
    name: 'Jobs',
    blurb: 'Remote and local work',
  },

  {
    slug: 'marketplace',
    name: 'Marketplace',
    blurb: 'Furniture, electronics, more',
  },

  {
    slug: 'services',
    name: 'Services',
    blurb: 'Lessons, repairs, freelance',
  },

  {
    slug: 'vehicles',
    name: 'Vehicles',
    blurb: 'Cars, bikes, scooters',
  },

  {
    slug: 'community',
    name: 'Community',
    blurb: 'Meetups and mutual aid',
  },

];






export default async function HomePage() {


  const session = await getServerSession(authOptions);


  const userId =
    (session?.user as { id?: string } | undefined)?.id;



  const [
    listings,
    featuredListings,
    popularListings,

  ] = await Promise.all([

    getListings(userId),

    getFeaturedListings(),

    getPopularListings(),

  ]);





  return (

    <div>



      <section className="border-b border-border bg-gradient-to-b from-branch-50/60 to-background">


        <div className="container flex flex-col items-center gap-8 py-16 text-center sm:py-24">


          <div className="branch-line pl-9">

            <span className="text-xs font-medium uppercase tracking-widest text-branch-600">

              Built for the diaspora

            </span>

          </div>



          <h1 className="max-w-2xl font-display text-4xl font-semibold leading-tight tracking-tight text-branch-900 sm:text-5xl">

            One board, not a hundred group chats.

          </h1>



          <p className="max-w-xl text-balance text-muted-foreground sm:text-lg">

            Branched brings housing, jobs, goods, and services into one trusted marketplace.

          </p>



          <SearchBar />



          <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 pt-2 text-sm text-muted-foreground">


            <span className="flex items-center gap-1.5">

              <SearchIcon className="h-4 w-4 text-branch-500"/>

              Smart search

            </span>



            <span className="flex items-center gap-1.5">

              <ShieldCheck className="h-4 w-4 text-branch-500"/>

              Verified users

            </span>



            <span className="flex items-center gap-1.5">

              <MessagesSquare className="h-4 w-4 text-branch-500"/>

              Private messaging

            </span>


          </div>


        </div>


      </section>





      <section className="container py-12">


        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">


          {CATEGORY_SHORTCUTS.map((category)=>(


            <Link

              key={category.slug}

              href={`/browse?category=${category.slug}`}

              className="rounded-2xl border border-border bg-card p-4 transition hover:bg-branch-50"

            >

              <span className="font-display font-semibold text-branch-900">

                {category.name}

              </span>


              <p className="text-xs text-muted-foreground">

                {category.blurb}

              </p>


            </Link>


          ))}


        </div>


      </section>





      {featuredListings.length > 0 && (

        <section className="container pb-12">


          <div className="mb-5 flex items-center gap-2">

            <Star className="h-5 w-5 text-branch-500"/>

            <h2 className="font-display text-2xl font-semibold text-branch-900">

              Featured Listings

            </h2>

          </div>



          <ListingGrid listings={featuredListings as any}/>


        </section>

      )}






      {popularListings.length > 0 && (

        <section className="container pb-12">


          <div className="mb-5 flex items-center gap-2">


            <Flame className="h-5 w-5 text-branch-500"/>


            <h2 className="font-display text-2xl font-semibold text-branch-900">

              Trending This Week

            </h2>


          </div>



          <ListingGrid listings={popularListings as any}/>


        </section>

      )}







      <section className="container pb-24">


        <div className="mb-6 flex items-end justify-between">


          <div>


            <div className="flex items-center gap-2">

              <Clock className="h-5 w-5 text-branch-500"/>


              <h2 className="font-display text-2xl font-semibold text-branch-900">

                Latest Listings

              </h2>

            </div>



            <p className="text-sm text-muted-foreground">

              Recently posted by the community.

            </p>


          </div>




          <Button variant="outline" asChild>


            <Link href="/browse">

              Browse all

            </Link>


          </Button>


        </div>




        <ListingGrid listings={listings as any}/>



      </section>




    </div>

  );

}