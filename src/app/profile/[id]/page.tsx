import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { ShieldCheck, MapPin, Calendar, Settings } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ListingGrid } from '@/components/listings/listing-grid';
import { ReportButton } from '@/components/report-button';
import { SellerStats } from '@/components/seller/seller-stats';
import { TrustBadge } from '@/components/ui/trust-badge';
import { calculateTrustLevel } from '@/lib/trust';
import { initials, formatRelativeTime } from '@/lib/utils';
import { StartConversationButton } from '@/components/messaging/start-conversation-button';


export default async function ProfilePage({
  params,
}: {
  params: { id: string };
}) {


  const [session, user] = await Promise.all([


    getServerSession(authOptions),



    prisma.user.findUnique({

      where: {
        id: params.id,
      },


      select: {

        id: true,
        name: true,
        image: true,
        bio: true,
        location: true,
        isVerified: true,
        createdAt: true,


        listings: {

          where: {
            status: 'ACTIVE',
          },


          orderBy: {
            createdAt: 'desc',
          },


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


            favorites: {

              select: {
                id: true,
              },

            },


          },


        },


      },


    }),


  ]);



  if (!user) {
    notFound();
  }



  const currentUserId =
    (session?.user as { id?: string } | undefined)?.id;



  const isSelf =
    currentUserId === user.id;



  const totalViews = user.listings.reduce(

    (total, listing) =>
      total + listing.views,

    0

  );



  const totalFavorites = user.listings.reduce(

    (total, listing) =>
      total + listing.favorites.length,

    0

  );
  const trustLevel = calculateTrustLevel({

  isVerified: user.isVerified,

  listingsCount: user.listings.length,

  totalViews,

  favoritesCount: totalFavorites,

  createdAt: user.createdAt,

});



  const listings = user.listings.map((listing) => ({

    ...listing,

    price: listing.price
      ? Number(listing.price)
      : null,


  }));




  return (

    <div className="container max-w-4xl py-10">


      <div className="flex flex-col gap-6 rounded-2xl border border-border bg-card p-6">


        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">


          <div className="flex items-center gap-4">


            <Avatar className="h-16 w-16">

              <AvatarImage
                src={user.image ?? undefined}
                alt={user.name ?? 'User'}
              />

              <AvatarFallback className="text-lg">
                {initials(user.name)}
              </AvatarFallback>

            </Avatar>



            <div>


              <div className="flex flex-wrap items-center gap-2">

  <h1 className="flex items-center gap-1.5 font-display text-xl font-semibold text-branch-900">

    {user.name}

    {user.isVerified && (

      <ShieldCheck className="h-5 w-5 text-branch-500" />

    )}

  </h1>


  <TrustBadge trust={trustLevel} />

</div>



              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">


                {user.location && (

                  <span className="flex items-center gap-1">

                    <MapPin className="h-3.5 w-3.5" />

                    {user.location}

                  </span>

                )}



                <span className="flex items-center gap-1">

                  <Calendar className="h-3.5 w-3.5" />

                  Joined {formatRelativeTime(user.createdAt)}

                </span>


              </div>



              {user.bio && (

                <p className="mt-2 max-w-md text-sm text-foreground">

                  {user.bio}

                </p>

              )}


            </div>


          </div>



          {isSelf ? (
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-xl"
                asChild
              >
                <Link href="/profile/edit">
                  <Settings className="h-4 w-4" />
                  Edit profile
                </Link>
              </Button>

              <Button variant="outline" asChild>
                <Link href="/my-listings">
                  My listings
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <StartConversationButton recipientId={user.id} />

              <ReportButton
                reportedUserId={user.id}
                label="Report user"
              />
            </div>
          )}

        </div>



        <SellerStats

          listingsCount={user.listings.length}

          totalViews={totalViews}

          favoritesCount={totalFavorites}

          createdAt={user.createdAt}

        />


      </div>





      
      <div className="mt-10">
        <h2 className="mb-4 font-display text-xl font-semibold text-branch-900">
          {isSelf ? 'Your listings' : `${user.name}'s listings`}
        </h2>

        {user.listings.length > 0 ? (
          <ListingGrid listings={listings as any} />
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-card px-6 py-12 text-center">
            <h3 className="font-semibold text-branch-900">
              {isSelf ? 'You have no active listings' : 'No active listings'}
            </h3>

            <p className="mt-2 text-sm text-muted-foreground">
              {isSelf
                ? 'Post a listing to start selling on BRANCHED.'
                : 'This user does not have any active listings right now.'}
            </p>

            {isSelf && (
              <Button asChild className="mt-5">
                <Link href="/listings/new">Post a listing</Link>
              </Button>
            )}
          </div>
        )}
      </div>

    </div>

  );

}