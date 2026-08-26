import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { SearchBar } from '@/components/search/search-bar';
import { CategoryFilter } from '@/components/search/category-filter';
import { ListingGrid } from '@/components/listings/listing-grid';
import { ListingFilters } from '@/components/search/listing-filters';
import { cn } from '@/lib/utils';


const PAGE_SIZE = 20;


const SORTS = [
  { value: 'newest', label: 'Newest' },
  { value: 'featured', label: 'Featured' },
  { value: 'views', label: 'Most viewed' },
  { value: 'favorites', label: 'Most saved' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
];



async function getListings(params: {
  q?: string;
  category?: string;
  location?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  featured?: string;
  page?: number;
  userId?: string;
}) {

  const {
    q,
    category,
    location,
    sort = 'newest',
    minPrice,
    maxPrice,
    featured,
    page = 1,
    userId,
  } = params;


 const where: Prisma.ListingWhereInput = {
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
};



  if (category) {
    where.category = {
      slug: category,
    };
  }



  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }
  if (minPrice || maxPrice) {

  where.price = {};

  if (minPrice) {
    where.price.gte = Number(minPrice);
  }

  if (maxPrice) {
    where.price.lte = Number(maxPrice);
  }

}


if (featured === 'true') {

  where.featured = true;

}



  try {


    if (q) {


      const tsQuery = q
        .split(/\s+/)
        .filter(Boolean)
        .map((term) =>
          term.replace(/[^\w]/g, '') + ':*'
        )
        .join(' & ');



      if (tsQuery) {


        const rows = await prisma.$queryRaw<{ id: string }[]>`

          SELECT "id"
          FROM "Listing"

          WHERE "status" = 'ACTIVE'

          AND "searchVector" @@ to_tsquery(
            'simple',
            ${tsQuery}
          )

          ORDER BY ts_rank(
            "searchVector",
            to_tsquery('simple', ${tsQuery})
          ) DESC

          LIMIT 200

        `;



        const ids = rows.map((r) => r.id);



        where.id = {
          in: ids.length ? ids : ['__none__'],
        };

      }

    }



    let orderBy:
  Prisma.ListingOrderByWithRelationInput[];


if (sort === 'price_asc') {

  orderBy = [
    {
      price: 'asc',
    },
  ];

}

else if (sort === 'price_desc') {

  orderBy = [
    {
      price: 'desc',
    },
  ];

}

else if (sort === 'featured') {

  orderBy = [
    {
      featured: 'desc',
    },
    {
      createdAt: 'desc',
    },
  ];

}

else if (sort === 'views') {

  orderBy = [
    {
      views: 'desc',
    },
  ];

}

else if (sort === 'favorites') {

  orderBy = [
    {
      favorites: {
        _count: 'desc',
      },
    },
  ];

}

else {

  orderBy = [
    {
      createdAt: 'desc',
    },
  ];

}





    const [listings, total] = await Promise.all([


      prisma.listing.findMany({

        where,

        orderBy,

        skip: (page - 1) * PAGE_SIZE,

        take: PAGE_SIZE,


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


      }),



      prisma.listing.count({

        where,

      }),



    ]);




    return {


      listings: listings.map((listing: any) => ({

        ...listing,

        _favorited: userId

          ? listing.favorites.length > 0

          : false,

      })),



      total,

      totalPages: Math.ceil(
        total / PAGE_SIZE
      ),


    };



  } catch (err) {


    console.error(
      'Browse query failed, using fallback filter:',
      err
    );



    if (q) {


      where.OR = [

        {

          title: {

            contains: q,

            mode: 'insensitive',

          },

        },


        {

          description: {

            contains: q,

            mode: 'insensitive',

          },

        },

      ];

    }




    const listings = await prisma.listing.findMany({

      where,


      orderBy: {

        createdAt: 'desc',

      },


      take: PAGE_SIZE,



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




    return {

      listings,

      total: listings.length,

      totalPages: 1,

    };


  }


}




export default async function BrowsePage({

  searchParams,

}: {

  searchParams: {

  q?: string;

  category?: string;

  location?: string;

  sort?: string;

  minPrice?: string;

  maxPrice?: string;

  featured?: string;

  page?: string;

} & Record<string, string | undefined>;

}) {


  const session = await getServerSession(authOptions);



  const userId =
    (session?.user as { id?: string } | undefined)?.id;



  const page = Math.max(

    1,

    parseInt(
      searchParams.page ?? '1',
      10
    ) || 1

  );




  const [
    categories,
    result,

  ] = await Promise.all([



    prisma.category.findMany({

      orderBy: {

        nameRu: 'asc',

      },

    }),



    getListings({

      ...searchParams,

      page,

      userId,

    }),



  ]);
  const hasActiveFilters = Boolean(
  searchParams.q ||
    searchParams.category ||
    searchParams.location ||
    searchParams.minPrice ||
    searchParams.maxPrice ||
    searchParams.featured === 'true'
);





  return (

    <div className="container py-8">



      <div className="mb-8 flex flex-col gap-5">



        <div>


          <h1 className="font-display text-3xl font-semibold text-branch-900">


            {searchParams.q

              ? `Search results for "${searchParams.q}"`

              : "Browse listings"

            }


          </h1>



          <p className="mt-2 text-sm text-muted-foreground">

            Discover trusted housing, jobs, services and goods from the community.

          </p>


        </div>




        <SearchBar compact />
        <ListingFilters />




        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">



          <CategoryFilter categories={categories} />




          <div className="flex shrink-0 items-center gap-2 text-sm">


            <span className="text-muted-foreground">

              Sort:

            </span>




            {SORTS.map((s)=>{


              const params =
  new URLSearchParams(
    Object.entries(searchParams).filter(
      ([, value]) => value !== undefined
    ) as [string, string][]
  );



              params.set('sort', s.value);
params.delete('page');



              const active =
                (searchParams.sort ?? 'newest') === s.value;




              return (

                <Link

                  key={s.value}

                  href={`/browse?${params.toString()}`}


                  className={cn(

                    'rounded-full px-3 py-1.5 font-medium',

                    active

                    ? 'bg-branch-500 text-white'

                    : 'hover:bg-muted'

                  )}

                >

                  {s.label}


                </Link>

              );


            })}


          </div>


        </div>


      </div>





      <div className="mb-5 flex flex-wrap items-center gap-3">



        <p className="text-sm text-muted-foreground">


          {result.total}

          {' '}

          listing{result.total !== 1 ? 's' : ''}

          {' '}found


        </p>




        {searchParams.category && (

          <span className="rounded-full bg-branch-50 px-3 py-1 text-xs text-branch-700">

            Category: {searchParams.category}

          </span>

        )}





        {searchParams.location && (

          <span className="rounded-full bg-branch-50 px-3 py-1 text-xs text-branch-700">

            Location: {searchParams.location}

          </span>

        )}





        {searchParams.q && (

          <span className="rounded-full bg-branch-50 px-3 py-1 text-xs text-branch-700">

            Search: {searchParams.q}

          </span>

        )}
        {hasActiveFilters && (
  <Link
    href="/browse"
    className="rounded-full border border-border px-4 py-2 text-sm font-medium transition hover:bg-muted"
  >
    Clear filters
  </Link>
)}



      </div>





      {result.listings.length > 0 ? (
  <ListingGrid listings={result.listings as any} />
) : (
  <div className="rounded-2xl border border-dashed bg-muted/30 px-6 py-16 text-center">
    <h2 className="font-display text-xl font-semibold text-branch-900">
      No listings found
    </h2>

    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
      {hasActiveFilters
        ? 'Try changing your search or filters to discover more listings.'
        : 'There are no active listings yet. Check back soon or create the first one.'}
    </p>

    <div className="mt-6 flex flex-wrap justify-center gap-3">
      {hasActiveFilters && (
        <Link
          href="/browse"
          className="rounded-full bg-branch-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-branch-600"
        >
          Clear all filters
        </Link>
      )}

      <Link
        href="/listings/new"
        className="rounded-full border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
      >
        Create a listing
      </Link>
    </div>
  </div>
)}







      {result.totalPages > 1 && (
  <div className="mt-8 flex flex-wrap items-center justify-center gap-2">

    {page > 1 && (() => {
      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value);
        }
      });

      params.set('page', String(page - 1));

      return (
        <Link
          href={`/browse?${params.toString()}`}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Previous
        </Link>
      );
    })()}

    {Array.from(
      {
        length: result.totalPages,
      },
      (_, i) => i + 1
    ).map((p) => {
      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value);
        }
      });

      params.set('page', String(p));

      return (
        <Link
          key={p}
          href={`/browse?${params.toString()}`}
          className={cn(
            'flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium',
            p === page
              ? 'bg-branch-500 text-white'
              : 'hover:bg-muted'
          )}
        >
          {p}
        </Link>
      );
    })}

    {page < result.totalPages && (() => {
      const params = new URLSearchParams();

      Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined) {
          params.set(key, value);
        }
      });

      params.set('page', String(page + 1));

      return (
        <Link
          href={`/browse?${params.toString()}`}
          className="rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Next
        </Link>
      );
    })()}

  </div>
)}

    </div>
  );
}