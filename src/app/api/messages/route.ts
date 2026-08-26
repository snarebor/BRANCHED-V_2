import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { NotificationType } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { messageRateLimit } from '@/lib/rate-limit';

const CONVERSATION_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const conversationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(CONVERSATION_PAGE_SIZE),
});

const userIdSchema = z.string().cuid('Invalid user ID.');
const listingIdSchema = z.string().cuid('Invalid listing ID.');

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  return user?.id ?? null;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const parsedQuery = conversationQuerySchema.safeParse({
    page: searchParams.get('page') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? undefined,
  });

  if (!parsedQuery.success) {
    return NextResponse.json(
      {
        error:
          parsedQuery.error.issues[0]?.message ??
          'Invalid pagination parameters.',
      },
      { status: 400 }
    );
  }

  const { page, pageSize } = parsedQuery.data;

  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });

  if (!currentUser) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    );
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      {
        error:
          'Your account has been banned and cannot access messages.',
      },
      { status: 403 }
    );
  }

  const participations =
  await prisma.conversationParticipant.findMany({
    where: { userId },

    orderBy: {
      conversation: {
        updatedAt: 'desc',
      },
    },

    skip: (page - 1) * pageSize,
    take: pageSize,

    include: {
      conversation: {
        include: {
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
        },
      },
    },
  });
  const total = await prisma.conversationParticipant.count({
    where: { userId },
  });

  const conversations = participations
    .map((participation) => participation.conversation)
    .sort(
      (a, b) =>
        b.updatedAt.getTime() - a.updatedAt.getTime()
    )
    .map((conversation) => ({
      id: conversation.id,
      listingId: conversation.listingId,
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.messages[0] ?? null,
      otherParticipants: conversation.participants
        .filter(
          (participant) => participant.userId !== userId
        )
        .map((participant) => participant.user),
    }));

  return NextResponse.json({
    conversations,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}

const startSchema = z
  .object({
    recipientId: userIdSchema,
    listingId: listingIdSchema.optional(),
    body: z
      .string()
      .trim()
      .min(1, 'Message cannot be empty.')
      .max(2000),
  })
  .strict();

export async function POST(req: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }
  const rateLimit = await messageRateLimit.limit(userId);

if (!rateLimit.success) {
  return NextResponse.json(
    {
      error: 'Too many messages. Please try again later.',
    },
    {
      status: 429,
      headers: {
        'X-RateLimit-Limit': rateLimit.limit.toString(),
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'Retry-After': Math.ceil(
          (rateLimit.reset - Date.now()) / 1000
        ).toString(),
      },
    }
  );
}

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });

  if (!currentUser) {
    return NextResponse.json(
      { error: 'User not found.' },
      { status: 404 }
    );
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      {
        error:
          'Your account has been banned and cannot send messages.',
      },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON body.' },
      { status: 400 }
    );
  }

  const parsed = startSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          'Invalid input.',
      },
      { status: 400 }
    );
  }

  const {
    recipientId,
    listingId,
    body: messageBody,
  } = parsed.data;

  if (recipientId === userId) {
    return NextResponse.json(
      { error: 'You cannot message yourself.' },
      { status: 400 }
    );
  }

  const recipient = await prisma.user.findUnique({
    where: { id: recipientId },
    select: {
      id: true,
      isBanned: true,
    },
  });

  if (!recipient) {
    return NextResponse.json(
      { error: 'Recipient not found.' },
      { status: 404 }
    );
  }

  if (recipient.isBanned) {
    return NextResponse.json(
      { error: 'This account cannot receive messages.' },
      { status: 400 }
    );
  }

  // Validate listing before creating/finding the conversation.
  if (listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        userId: true,
        status: true,
        isFlagged: true,
      },
    });

    if (
      !listing ||
      listing.status !== 'ACTIVE' ||
      listing.isFlagged
    ) {
      return NextResponse.json(
        {
          error:
            'This listing is not available for messages.',
        },
        { status: 404 }
      );
    }

    if (listing.userId !== recipientId) {
      return NextResponse.json(
        {
          error:
            'Listing conversations must be started with the listing owner.',
        },
        { status: 400 }
      );
    }
  }

  // Find an existing conversation between these two users
  // for this listing, if one already exists.
  const existing = await prisma.conversation.findFirst({
    where: {
      listingId: listingId ?? null,
      participants: {
        some: {
          userId,
        },
      },
      AND: [
        {
          participants: {
            some: {
              userId: recipientId,
            },
          },
        },
      ],
    },
    include: {
      participants: true,
    },
  });

  const conversation =
    existing ??
    (await prisma.conversation.create({
      data: {
        listingId,
        participants: {
          create: [
            { userId },
            { userId: recipientId },
          ],
        },
      },
    }));

  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: userId,
      listingId,
      body: messageBody,
    },
  });

  await prisma.conversation.update({
    where: {
      id: conversation.id,
    },
    data: {
      updatedAt: new Date(),
    },
  });

  await prisma.notification.create({
    data: {
      userId: recipientId,
      type: NotificationType.NEW_MESSAGE,
      title: 'New message',
      message:
        messageBody.length > 100
          ? `${messageBody.slice(0, 100)}...`
          : messageBody,
      conversationId: conversation.id,
      listingId: listingId ?? null,
    },
  });

  return NextResponse.json(
    {
      conversationId: conversation.id,
      message,
    },
    { status: 201 }
  );
}