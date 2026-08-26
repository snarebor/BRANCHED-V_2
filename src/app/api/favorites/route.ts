import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { NotificationType } from '@prisma/client';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const favoriteSchema = z
  .object({
    listingId: z.string().cuid('Invalid listing ID.'),
  })
  .strict();

async function requireUserId() {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;
  return user?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      listing: {
        include: {
          category: {
            select: { slug: true, nameRu: true, nameEn: true },
          },
          user: {
            select: { id: true, name: true, image: true },
          },
        },
      },
    },
  });

  return NextResponse.json({ favorites });
}

export async function POST(req: Request) {
  const userId = await requireUserId();

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { isBanned: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      { error: 'Your account has been banned and cannot save listings.' },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = favoriteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const { listingId } = parsed.data;

  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      userId: true,
            status: true,
      isFlagged: true,
      expiresAt: true,
    },
  });

    if (
    !listing ||
    listing.status !== 'ACTIVE' ||
    listing.isFlagged ||
    (listing.expiresAt && listing.expiresAt < new Date())
  ) {
    return NextResponse.json(
      { error: 'Listing not found.' },
      { status: 404 }
    );
  }

  const existingFavorite = await prisma.favorite.findUnique({
    where: {
      userId_listingId: {
        userId,
        listingId,
      },
    },
  });

  if (existingFavorite) {
    return NextResponse.json({ favorite: existingFavorite });
  }

  const favorite = await prisma.favorite.create({
    data: {
      userId,
      listingId,
    },
  });

  if (listing.userId !== userId) {
    await prisma.notification.create({
      data: {
        userId: listing.userId,
        type: NotificationType.NEW_FAVORITE,
        title: 'New favorite',
        message: `Someone saved your listing "${listing.title}".`,
        listingId: listing.id,
      },
    });
  }

  return NextResponse.json({ favorite }, { status: 201 });
}