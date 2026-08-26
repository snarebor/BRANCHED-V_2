import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const listingIdSchema = z.string().cuid('Invalid listing ID.');

const statusSchema = z
  .object({
    status: z.enum(['ACTIVE', 'SOLD', 'ARCHIVED']),
  })
  .strict();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const parsedId = listingIdSchema.safeParse(params.id);

  if (!parsedId.success) {
    return NextResponse.json({ error: 'Invalid listing ID.' }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      { error: 'Your account has been banned and cannot update listings.' },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsedBody = statusSchema.safeParse(body);

  if (!parsedBody.success) {
    return NextResponse.json(
      { error: parsedBody.error.issues[0]?.message ?? 'Invalid status update.' },
      { status: 400 }
    );
  }

  const listing = await prisma.listing.findUnique({
    where: { id: parsedId.data },
  });

  if (!listing) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }

  if (listing.userId !== userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  if (listing.status === 'REMOVED') {
  return NextResponse.json(
    { error: 'Removed listings can only be restored by a moderator.' },
    { status: 403 }
  );
}

  const updated = await prisma.listing.update({
  where: { id: parsedId.data },
  data: { status: parsedBody.data.status },
  select: {
    id: true,
    title: true,
    status: true,
    updatedAt: true,
    expiresAt: true,
  },
});

  const statusMessages = {
    SOLD: {
      title: 'Listing marked as sold',
      message: `Your listing "${listing.title}" has been marked as sold.`,
    },
    ARCHIVED: {
      title: 'Listing archived',
      message: `Your listing "${listing.title}" has been archived.`,
    },
    ACTIVE: {
      title: 'Listing reactivated',
      message: `Your listing "${listing.title}" has been reactivated.`,
    },
  };

  const notification = statusMessages[parsedBody.data.status];

  await prisma.notification.create({
    data: {
      userId: listing.userId,
      type: 'LISTING_STATUS',
      title: notification.title,
      message: notification.message,
      listingId: listing.id,
    },
  });

  return NextResponse.json(updated);
}