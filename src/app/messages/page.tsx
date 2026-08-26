import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { MessageCircle } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

import { ConversationList } from '@/components/messaging/conversation-list';


async function getConversations(userId: string) {

  const participations = await prisma.conversationParticipant.findMany({

    where: {
      userId,
    },


    include: {

     conversation: {
  include: {

    listing: {
      select: {
        id: true,
        title: true,
        images: true,
      },
    },


    participants: {
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
},

_count: {
  select: {
    messages: {
      where: {
        senderId: {
          not: userId,
        },
        readAt: null,
      },
    },
  },
},

  },
},
    },

  });



  return participations

    .map((p) => p.conversation)

    .sort(
      (a, b) =>
        b.updatedAt.getTime() -
        a.updatedAt.getTime()
    )


    .map((c) => ({

  id: c.id,

  listingId: c.listing?.id ?? null,

  listingTitle: c.listing?.title ?? null,

  unreadCount: c._count.messages,


  lastMessage: c.messages[0]
    ? {
        body: c.messages[0].body,
        createdAt:
          c.messages[0].createdAt.toISOString(),
      }
    : null,


  otherParticipants:
    c.participants
      .filter(
        (p) => p.userId !== userId
      )
      .map(
        (p) => p.user
      ),

}));

}



export default async function MessagesPage() {


  const session =
    await getServerSession(authOptions);


  const userId =
    (session?.user as { id?: string } | undefined)?.id;



  const conversations =
    userId
      ? await getConversations(userId)
      : [];



  return (

    <div className="container max-w-4xl py-8">


      <h1 className="mb-6 font-display text-2xl font-semibold text-branch-900">
        Messages
      </h1>




      {conversations.length === 0 ? (

        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">


          <MessageCircle className="h-10 w-10 text-branch-500" />


          <h2 className="mt-4 text-xl font-semibold text-branch-900">
            No conversations yet
          </h2>


          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            When someone contacts you about a listing, your conversations will appear here.
          </p>



          <Link

            href="/browse"

            className="mt-6 rounded-xl bg-branch-600 px-5 py-3 text-sm font-medium text-white hover:bg-branch-700"

          >
            Browse listings
          </Link>


        </div>


      ) : (


        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3">


          <div className="border-border md:col-span-1 md:border-r">

            <ConversationList conversations={conversations} />

          </div>



          <div className="hidden flex-col items-center justify-center gap-3 p-10 text-center text-muted-foreground md:col-span-2 md:flex">

            <MessageCircle className="h-10 w-10" />

            <p>
              Select a conversation to view messages.
            </p>


          </div>


        </div>


      )}


    </div>

  );

}