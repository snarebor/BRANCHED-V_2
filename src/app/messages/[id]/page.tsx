import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { ArrowLeft } from 'lucide-react';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { initials } from '@/lib/utils';

import { ConversationList } from '@/components/messaging/conversation-list';
import { ChatWindow } from '@/components/messaging/chat-window';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';

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
                  readAt: null,
                  senderId: {
                    not: userId,
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return participations
    .map((participation) => participation.conversation)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .map((conversation) => ({
      id: conversation.id,
      listingId: conversation.listingId,
      listingTitle: conversation.listing?.title ?? null,
      unreadCount: conversation._count.messages,
      lastMessage: conversation.messages[0]
        ? {
            body: conversation.messages[0].body,
            createdAt: conversation.messages[0].createdAt.toISOString(),
          }
        : null,
      otherParticipants: conversation.participants
        .filter((participant) => participant.userId !== userId)
        .map((participant) => participant.user),
    }));
}

export default async function ConversationPage({
  params,
}: {
  params: {
    id: string;
  };
}) {
  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/login');
  }

  const [participant, conversation] = await Promise.all([
    prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId: params.id,
          userId,
        },
      },
    }),
    prisma.conversation.findUnique({
      where: {
        id: params.id,
      },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
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
      },
    }),
  ]);

  if (!conversation || !participant) {
    notFound();
  }

  const otherParticipant = conversation.participants.find(
    (participant) => participant.userId !== userId
  )?.user;

  await prisma.message.updateMany({
    where: {
      conversationId: params.id,
      senderId: {
        not: userId,
      },
      readAt: null,
    },
    data: {
      readAt: new Date(),
    },
  });

  const conversations = await getConversations(userId);

  return (
    <div className="container max-w-4xl py-8">
      <h1 className="mb-6 font-display text-2xl font-semibold text-branch-900">
        Messages
      </h1>

      <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-border bg-card md:grid-cols-3">
        <div className="hidden border-border md:col-span-1 md:block md:border-r">
          <ConversationList conversations={conversations} />
        </div>

        <div className="flex min-w-0 flex-col md:col-span-2">
          <div className="border-b border-border px-4 py-3 md:hidden">
            <Link
              href="/messages"
              className="inline-flex items-center gap-2 text-sm font-medium text-branch-600 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to messages
            </Link>
          </div>

          <div className="border-b border-border px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <Avatar>
                <AvatarImage
                  src={otherParticipant?.image ?? undefined}
                  alt={otherParticipant?.name ?? 'User'}
                />
                <AvatarFallback>
                  {initials(otherParticipant?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">
                  {otherParticipant?.name ?? 'Deleted user'}
                </p>

                <p className="truncate text-xs text-muted-foreground">
                  {conversation.listing
                    ? `About ${conversation.listing.title}`
                    : 'Direct conversation'}
                </p>
              </div>
            </div>
          </div>

          {conversation.listing && (
            <div className="border-b border-border p-4">
              <Link
                href={`/listings/${conversation.listing.id}`}
                className="block rounded-xl bg-muted p-3 transition hover:bg-muted/70"
              >
                <p className="text-sm font-semibold">
                  {conversation.listing.title}
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  View listing details
                </p>
              </Link>
            </div>
          )}

          <ChatWindow
            conversationId={params.id}
            currentUserId={userId}
          />
        </div>
      </div>
    </div>
  );
}