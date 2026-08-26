import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import {
  Heart,
  MessageCircle,
  Plus,
  UserRound,
  Eye,
  Package,
} from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';


import { SellerListingCard } from '@/components/dashboard/seller-listing-card';
import { DashboardStatCard } from '@/components/dashboard/dashboard-stat-card';
export default async function DashboardPage() {

  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;


  if (!userId) {
    redirect('/login');
  }


const [
  user,
  favoriteCount,
  messageCount,
  soldCount,
  activeCount,
  recentConversations,
] = await Promise.all([
  prisma.user.findUnique({
    where: {
      id: userId,
    },

    select: {
      name: true,

      listings: {
  orderBy: {
    createdAt: 'desc',
  },

  select: {
    id: true,
    title: true,
    description: true,
    price: true,
    currency: true,
    location: true,
    images: true,
    status: true,
    views: true,
    createdAt: true,
    updatedAt: true,

    category: {
      select: {
        slug: true,
        nameRu: true,
        nameEn: true,
      },
    },

    favorites: {
      select: {
        id: true,
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
  }),


  prisma.favorite.count({
    where: {
      listing: {
        userId,
      },
    },
  }),


  prisma.conversation.count({
  where: {
    participants: {
      some: {
        userId,
      },
    },
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
      status: 'ACTIVE',
    },
  }),
  prisma.conversation.findMany({
    where: {
      participants: {
        some: {
          userId,
        },
      },
    },

    orderBy: {
      updatedAt: 'desc',
    },

    take: 5,

    include: {
      listing: {
        select: {
          id: true,
          title: true,
        },
      },

      participants: {
        where: {
          userId: {
            not: userId,
          },
        },

        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      },

      messages: {
        orderBy: {
          createdAt: 'desc',
        },

        take: 1,

        select: {
          body: true,
          createdAt: true,
          senderId: true,
        },
      },
    },
  }),
]);



  if (!user) {
    redirect('/');
  }



  const listings = user.listings.map((listing) => ({

    ...listing,

    price: listing.price
      ? Number(listing.price)
      : null,

  }));
  const totalFavorites = user.listings.reduce(
  (total, listing) =>
    total + listing.favorites.length,
  0
);




  const totalViews = user.listings.reduce(
    (total, listing) =>
      total + listing.views,
    0
  );
  const averageViews =
  user.listings.length > 0
    ? Math.round(totalViews / user.listings.length)
    : 0;
  



  return (

    <div className="container py-10">


      <div className="mb-8">

        <h1 className="font-display text-3xl font-semibold text-branch-900">
          Welcome, {user.name}
        </h1>


        <p className="mt-2 text-muted-foreground">
          Manage your Branched activity.
        </p>

      </div>





      <div className="mb-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">

  <DashboardStatCard
    title="Active"
    value={activeCount}
    icon={<Package className="h-5 w-5 text-branch-500" />}
  />

  <DashboardStatCard
    title="Views"
    value={totalViews}
    icon={<Eye className="h-5 w-5 text-branch-500" />}
  />

  <DashboardStatCard
    title="Favorites"
    value={totalFavorites}
    icon={<Heart className="h-5 w-5 text-branch-500" />}
  />

  <DashboardStatCard
    title="Messages"
    value={messageCount}
    icon={<MessageCircle className="h-5 w-5 text-branch-500" />}
  />

  <DashboardStatCard
    title="Sold"
    value={soldCount}
    icon={<Package className="h-5 w-5 text-branch-500" />}
  />

  <DashboardStatCard
    title="Avg views"
    value={averageViews}
    icon={<Eye className="h-5 w-5 text-branch-500" />}
  />

</div>
<section className="mb-10">

  <div className="mb-4 flex items-center justify-between">

    <div>
      <h2 className="font-display text-2xl font-semibold text-branch-900">
        Recent inquiries
      </h2>

      <p className="mt-1 text-sm text-muted-foreground">
        Recent conversations about your listings.
      </p>
    </div>

    <Link
      href="/messages"
      className="text-sm font-medium text-branch-600 hover:text-branch-700"
    >
      View all
    </Link>

  </div>


  {recentConversations.length === 0 ? (

    <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">

      <MessageCircle className="mx-auto h-8 w-8 text-branch-500" />

      <p className="mt-3 font-medium">
        No messages yet
      </p>

      <p className="mt-1 text-sm text-muted-foreground">
        Buyer inquiries about your listings will appear here.
      </p>

    </div>

  ) : (

    <div className="space-y-3">

      {recentConversations.map((conversation) => {

        const participant =
          conversation.participants[0]?.user;

        const lastMessage =
          conversation.messages[0];

        return (

          <Link
            key={conversation.id}
            href={`/messages/${conversation.id}`}
            className="block rounded-2xl border border-border bg-card p-4 transition hover:bg-muted"
          >

            <div className="flex items-start justify-between gap-4">

              <div className="min-w-0">

                <p className="font-medium">
                  {participant?.name ?? 'Unknown user'}
                </p>

                {conversation.listing && (
                  <p className="mt-1 truncate text-sm text-branch-600">
                    {conversation.listing.title}
                  </p>
                )}

                {lastMessage && (
                  <p className="mt-2 line-clamp-1 text-sm text-muted-foreground">
                    {lastMessage.body}
                  </p>
                )}

              </div>

              <MessageCircle className="h-5 w-5 shrink-0 text-branch-500" />

            </div>

          </Link>

        );
      })}

    </div>

  )}

</section>






      <div className="mb-10 grid gap-4 sm:grid-cols-4">


        <Link
          href="/listings/new"
          className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
        >

          <Plus className="h-5 w-5 text-branch-500" />

          <h2 className="mt-3 font-semibold">
            Create listing
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Post something new.
          </p>

        </Link>





        <Link
          href="/favorites"
          className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
        >

          <Heart className="h-5 w-5 text-branch-500" />

          <h2 className="mt-3 font-semibold">
            Favorites
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Saved listings.
          </p>

        </Link>





        <Link
          href="/messages"
          className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
        >

          <MessageCircle className="h-5 w-5 text-branch-500" />

          <h2 className="mt-3 font-semibold">
            Messages
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            {messageCount} conversations.
          </p>

        </Link>





        <Link
          href="/profile/edit"
          className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
        >

          <UserRound className="h-5 w-5 text-branch-500" />

          <h2 className="mt-3 font-semibold">
            Edit profile
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Update your account.
          </p>

        </Link>



      </div>
     





      
      <section>

  <h2 className="mb-4 font-display text-2xl font-semibold text-branch-900">
    Your listings
  </h2>


  {listings.length === 0 ? (

    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">

      <Package className="h-10 w-10 text-branch-500" />


      <h3 className="mt-4 text-xl font-semibold text-branch-900">
        You have not posted anything yet
      </h3>


      <p className="mt-2 max-w-md text-sm text-muted-foreground">
        Create your first listing and start connecting with people on Branched.
      </p>


      <Link
 href="/dashboard/listings"
 className="rounded-2xl border border-border bg-card p-5 transition hover:bg-muted"
>

<Package className="h-5 w-5 text-branch-500"/>

<h2 className="mt-3 font-semibold">
Manage listings
</h2>

<p className="mt-1 text-sm text-muted-foreground">
Edit, delete and track your posts.
</p>

</Link>

    </div>


  ) : (

  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

{
 listings.map((listing)=>(
   <SellerListingCard
      key={listing.id}
      listing={listing}
   />
 ))
}

</div>

  )}


</section>



    </div>

  );

}