import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const REPORT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 50;

const reportQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(10000).default(1),
  pageSize: z.coerce
    .number()
    .int()
    .min(1)
    .max(MAX_PAGE_SIZE)
    .default(REPORT_PAGE_SIZE),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return user;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);

  const parsedQuery = reportQuerySchema.safeParse({
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

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        reason: true,
        details: true,
        status: true,
        createdAt: true,
        reporterId: true,
        reportedUserId: true,
        listingId: true,

        reporter: {
          select: {
            id: true,
            name: true,
          },
        },

        reportedUser: {
          select: {
            id: true,
            name: true,
            isFlagged: true,
            isBanned: true,
          },
        },

        listing: {
          select: {
            id: true,
            title: true,
            status: true,
            isFlagged: true,
            userId: true,
          },
        },
      },
    }),

    prisma.report.count(),
  ]);

  return NextResponse.json({
    reports,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}