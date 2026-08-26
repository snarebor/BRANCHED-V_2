import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { reportRateLimit } from '@/lib/rate-limit';

const listingIdSchema = z.string().cuid('Invalid listing ID.');
const userIdSchema = z.string().cuid('Invalid user ID.');

const reportSchema = z
  .object({
    reason: z.enum([
      'SCAM',
      'SPAM',
      'INAPPROPRIATE',
      'DUPLICATE',
      'PROHIBITED_ITEM',
      'HARASSMENT',
      'OTHER',
    ]),
    details: z.string().trim().max(1000).optional(),
    listingId: listingIdSchema.optional(),
    reportedUserId: userIdSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Boolean(data.listingId) !== Boolean(data.reportedUserId),
    {
      message: 'A report must target exactly one listing or user.',
    }
  );

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const user = session?.user as { id?: string } | undefined;

  if (!user?.id) {
    return NextResponse.json(
      { error: 'You must be logged in to report content.' },
      { status: 401 }
    );
  }
  const rateLimit = await reportRateLimit.limit(user.id);

if (!rateLimit.success) {
  return NextResponse.json(
    {
      error: 'Too many reports. Please try again later.',
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
    where: { id: user.id },
    select: { isBanned: true },
  });

  if (!currentUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (currentUser.isBanned) {
    return NextResponse.json(
      { error: 'Your account has been banned and cannot submit reports.' },
      { status: 403 }
    );
  }

  let body: unknown;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Invalid input.' },
      { status: 400 }
    );
  }

  const { reason, details, listingId, reportedUserId } = parsed.data;

  const existingReport = await prisma.report.findFirst({
    where: {
      reporterId: user.id,
      listingId: listingId ?? null,
      reportedUserId: reportedUserId ?? null,
      status: 'PENDING',
    },
  });

  if (existingReport) {
    return NextResponse.json(
      { error: 'You have already reported this content.' },
      { status: 409 }
    );
  }

  if (listingId) {
    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found.' }, { status: 404 });
    }

    if (listing.userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot report your own listing.' },
        { status: 400 }
      );
    }

    if (listing.status === 'REMOVED') {
      return NextResponse.json(
        { error: 'This listing has already been removed.' },
        { status: 400 }
      );
    }
  }

  if (reportedUserId) {
    const reportedUser = await prisma.user.findUnique({
      where: { id: reportedUserId },
      select: {
        id: true,
        isBanned: true,
      },
    });

    if (!reportedUser) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    if (reportedUser.id === user.id) {
      return NextResponse.json(
        { error: 'You cannot report your own account.' },
        { status: 400 }
      );
    }

    if (reportedUser.isBanned) {
      return NextResponse.json(
        { error: 'This account has already been suspended.' },
        { status: 400 }
      );
    }
  }

  const report = await prisma.$transaction(async (tx) => {
  const createdReport = await tx.report.create({
  data: {
    reason,
    ...(details !== undefined && { details }),
    ...(listingId !== undefined && { listingId }),
    ...(reportedUserId !== undefined && { reportedUserId }),
    reporterId: user.id!,
  },
});

  if (listingId) {
    const count = await tx.report.count({
      where: { listingId },
    });

    if (count >= 3) {
      await tx.listing.update({
        where: { id: listingId },
        data: { isFlagged: true },
      });
    }
  }

  if (reportedUserId) {
    const count = await tx.report.count({
      where: { reportedUserId },
    });

    if (count >= 3) {
      await tx.user.update({
        where: { id: reportedUserId },
        data: { isFlagged: true },
      });
    }
  }

  return createdReport;
});
  return NextResponse.json({ report }, { status: 201 });
}