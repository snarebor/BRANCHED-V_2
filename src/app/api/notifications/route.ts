import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const notificationUpdateSchema = z.union([
  z
    .object({
      id: z.string().cuid('Invalid notification ID.'),
    })
    .strict(),
  z.object({}).strict(),
]);

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  return user?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
    );
  }

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
    select: {
      id: true,
      type: true,
      title: true,
      message: true,
      isRead: true,
      listingId: true,
      conversationId: true,
      createdAt: true,
    },
  });

  const unreadCount = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
    },
  });

  return NextResponse.json({
    notifications,
    unreadCount,
  });
}

export async function PATCH(req: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized.' },
      { status: 401 }
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

  const parsed = notificationUpdateSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          'Provide either a valid notification ID or an empty object.',
      },
      { status: 400 }
    );
  }

  if ('id' in parsed.data) {
    const notification = await prisma.notification.updateMany({
      where: {
        id: parsed.data.id,
        userId,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({
      success: true,
      updated: notification.count,
    });
  }

  await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });

  return NextResponse.json({ success: true });
}