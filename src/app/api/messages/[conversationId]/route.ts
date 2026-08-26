import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { messageRateLimit } from '@/lib/rate-limit';

const MESSAGE_PAGE_SIZE = 50;
const conversationIdSchema = z.string().cuid('Invalid conversation ID.');

const afterSchema = z
  .string()
  .datetime({ offset: true })
  .optional();

const replySchema = z
  .object({
    body: z.string().trim().min(1, 'Message cannot be empty.').max(2000),
  })
  .strict();

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id ?? null;
}

async function assertParticipant(conversationId: string, userId: string) {
  const participant = await prisma.conversationParticipant.findUnique({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
  });

  return !!participant;
}

async function getActiveUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });
}

export async function GET(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const parsedConversationId = conversationIdSchema.safeParse(
    params.conversationId
  );

  if (!parsedConversationId.success) {
    return NextResponse.json(
      { error: 'Invalid conversation ID.' },
      { status: 400 }
    );
  }

  const currentUser = await getActiveUser(userId);

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      { error: 'Your account has been banned and cannot access messages.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const parsedAfter = afterSchema.safeParse(
    searchParams.get('after') ?? undefined
  );

  if (!parsedAfter.success) {
    return NextResponse.json(
      { error: 'Invalid "after" timestamp.' },
      { status: 400 }
    );
  }

  const conversationId = parsedConversationId.data;
  const isParticipant = await assertParticipant(conversationId, userId);

  if (!isParticipant) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: userId },
      readAt: null,
    },
    data: { readAt: new Date() },
  });

  const messages = await prisma.message.findMany({
  where: {
    conversationId,
    ...(parsedAfter.data
      ? { createdAt: { gt: new Date(parsedAfter.data) } }
      : {}),
  },
  orderBy: { createdAt: 'asc' },
  take: MESSAGE_PAGE_SIZE,
  include: {
    sender: {
      select: { id: true, name: true, image: true },
    },
  },
});

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
      listing: {
        select: { id: true, title: true, images: true },
      },
    },
  });

  return NextResponse.json({ messages, conversation });
}

export async function POST(
  req: Request,
  { params }: { params: { conversationId: string } }
) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
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

  const parsedConversationId = conversationIdSchema.safeParse(
    params.conversationId
  );

  if (!parsedConversationId.success) {
    return NextResponse.json(
      { error: 'Invalid conversation ID.' },
      { status: 400 }
    );
  }

  const currentUser = await getActiveUser(userId);

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      { error: 'Your account has been banned and cannot send messages.' },
      { status: 403 }
    );
  }

  const conversationId = parsedConversationId.data;
  const isParticipant = await assertParticipant(conversationId, userId);

  if (!isParticipant) {
    return NextResponse.json({ error: 'Not found.' }, { status: 404 });
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = replySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: userId,
      body: parsed.data.body,
    },
    include: {
      sender: {
        select: { id: true, name: true, image: true },
      },
    },
  });

  const recipient = await prisma.conversationParticipant.findFirst({
    where: {
      conversationId,
      userId: { not: userId },
    },
    select: { userId: true },
  });

  if (recipient) {
    await prisma.notification.create({
      data: {
        userId: recipient.userId,
        type: 'NEW_MESSAGE',
        title: 'New message',
        message: `${message.sender.name ?? 'Someone'} sent you a message.`,
        conversationId,
      },
    });
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });

  return NextResponse.json({ message }, { status: 201 });
}