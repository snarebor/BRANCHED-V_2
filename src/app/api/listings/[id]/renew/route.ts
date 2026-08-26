import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const listingIdSchema = z.string().cuid('Invalid listing ID.');

export async function PATCH(
  _req: Request,
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
      { error: 'Your account has been banned and cannot renew listings.' },
      { status: 403 }
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
      { error: 'Removed listings cannot be renewed.' },
      { status: 400 }
    );
  }

  const updated = await prisma.listing.update({
  where: { id: parsedId.data },
  data: {
    status: 'ACTIVE',
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  },
  select: {
    id: true,
    status: true,
    expiresAt: true,
    updatedAt: true,
  },
});
  return NextResponse.json({
    success: true,
    listing: updated,
  });
}