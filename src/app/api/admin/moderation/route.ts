import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { Prisma } from '@prisma/client';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const PAGE_SIZE = 50;
const moderationQuerySchema = z.object({
  reportPage: z.coerce.number().int().min(1).max(10000).default(1),
  status: z.enum(['PENDING', 'REVIEWED', 'DISMISSED', 'ACTIONED']).optional(),
  page: z.coerce.number().int().min(1).max(10000).default(1),
  targetType: z.enum(['listing', 'user', 'report']).optional(),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      role: true,
    },
  });

  if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
    return null;
  }

  return user;
}

export async function GET(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const url = new URL(req.url);

const parsedQuery = moderationQuerySchema.safeParse({
  reportPage: url.searchParams.get('reportPage') ?? undefined,
  status: url.searchParams.get('status') ?? undefined,
  page: url.searchParams.get('page') ?? undefined,
  targetType: url.searchParams.get('targetType') ?? undefined,
});

if (!parsedQuery.success) {
  return NextResponse.json(
    {
      error:
        parsedQuery.error.issues[0]?.message ??
        'Invalid moderation query parameters.',
    },
    { status: 400 }
  );
}

const { reportPage, status: reportStatus, page: logPage, targetType } =
  parsedQuery.data;

const reportWhere = reportStatus ? { status: reportStatus } : undefined;

const logWhere: Prisma.ModerationLogWhereInput | undefined = targetType
  ? { targetType }
  : undefined;

  const [reports, reportTotal, moderationLogs, moderationLogTotal] =
    await Promise.all([
      prisma.report.findMany({
        where: reportWhere,
        orderBy: { createdAt: 'desc' },
        skip: (reportPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          reporter: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              status: true,
              isFlagged: true,
            },
          },
          reportedUser: {
            select: {
              id: true,
              name: true,
              image: true,
              isBanned: true,
              isFlagged: true,
            },
          },
        },
      }),
      prisma.report.count({ where: reportWhere }),
      prisma.moderationLog.findMany({
        where: logWhere,
        orderBy: { createdAt: 'desc' },
        skip: (logPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          moderator: {
            select: {
              id: true,
              name: true,
              image: true,
              role: true,
            },
          },
        },
      }),
      prisma.moderationLog.count({ where: logWhere }),
    ]);

  return NextResponse.json({
    reports,
    reportPagination: {
      page: reportPage,
      pageSize: PAGE_SIZE,
      total: reportTotal,
      totalPages: Math.ceil(reportTotal / PAGE_SIZE),
    },
    moderationLogs,
    moderationLogPagination: {
      page: logPage,
      pageSize: PAGE_SIZE,
      total: moderationLogTotal,
      totalPages: Math.ceil(moderationLogTotal / PAGE_SIZE),
    },
  });
}
const moderationActionSchema = z.discriminatedUnion('target', [
  z
    .object({
      target: z.literal('listing'),
      id: z.string().cuid('Invalid listing ID.'),
      action: z.enum(['FLAG', 'UNFLAG', 'REMOVE', 'RESTORE']),
    })
    .strict(),

  z
    .object({
      target: z.literal('user'),
      id: z.string().cuid('Invalid user ID.'),
      action: z.enum(['FLAG', 'UNFLAG', 'BAN', 'UNBAN']),
    })
    .strict(),

  z
    .object({
      target: z.literal('report'),
      id: z.string().cuid('Invalid report ID.'),
      action: z.enum(['REVIEW', 'DISMISS', 'ACTION']),
    })
    .strict(),
]);

export async function PATCH(req: Request) {
  const admin = await requireAdmin();

  if (!admin) {
    return NextResponse.json(
      { error: 'Forbidden' },
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

  const parsed = moderationActionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error:
          parsed.error.issues[0]?.message ??
          'Invalid moderation request.',
      },
      { status: 400 }
    );
  }

  const { target, id, action } = parsed.data;

  // ─────────────────────────────────────
  // LISTING MODERATION
  // ─────────────────────────────────────

  if (target === 'listing') {
    const listing = await prisma.listing.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    userId: true,
    status: true,
    isFlagged: true,
  },
});
    if (!listing) {
      return NextResponse.json(
        { error: 'Listing not found.' },
        { status: 404 }
      );
    }

    let title = 'Listing updated';
    let message =
      'Your listing has been updated by a moderator.';

    const data: Prisma.ListingUpdateInput = {};

    if (action === 'FLAG') {
      data.isFlagged = true;
      title = 'Listing flagged';
      message = `Your listing "${listing.title}" has been flagged for moderation review.`;
    }

    if (action === 'UNFLAG') {
      data.isFlagged = false;
      title = 'Listing restored';
      message = `Your listing "${listing.title}" is no longer flagged.`;
    }

    if (action === 'REMOVE') {
      data.status = 'REMOVED';
      data.isFlagged = true;
      title = 'Listing removed';
      message = `Your listing "${listing.title}" has been removed by a moderator.`;
    }

    if (action === 'RESTORE') {
      data.status = 'ACTIVE';
      data.isFlagged = false;
      title = 'Listing restored';
      message = `Your listing "${listing.title}" has been restored and is active again.`;
    }

    const updatedListing = await prisma.$transaction(
      async (tx) => {
        const result = await tx.listing.update({
  where: { id },
  data,
  select: {
    id: true,
    title: true,
    status: true,
    isFlagged: true,
    userId: true,
  },
});

        await tx.moderationLog.create({
          data: {
            moderatorId: admin.id,
            targetType: 'listing',
            targetId: listing.id,
            action,
          },
        });

        await tx.notification.create({
          data: {
            userId: listing.userId,
            type: 'LISTING_STATUS',
            title,
            message,
            listingId: listing.id,
          },
        });

        return result;
      }
    );

    return NextResponse.json({
      success: true,
      listing: updatedListing,
    });
  }

  // ─────────────────────────────────────
  // USER MODERATION
  // ─────────────────────────────────────

  if (target === 'user') {
    const user = await prisma.user.findUnique({
  where: { id },
  select: {
    id: true,
    name: true,
    image: true,
    role: true,
    isBanned: true,
    isFlagged: true,
  },
});
    if (!user) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      );
    }

    if (user.id === admin.id) {
      return NextResponse.json(
        { error: 'You cannot moderate your own account.' },
        { status: 400 }
      );
    }

    if (user.role === 'ADMIN') {
      return NextResponse.json(
        { error: 'Admin accounts cannot be moderated here.' },
        { status: 403 }
      );
    }

    if (
      user.role === 'MODERATOR' &&
      admin.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        {
          error:
            'Moderators cannot moderate other moderators.',
        },
        { status: 403 }
      );
    }

    if (
      (action === 'BAN' || action === 'UNBAN') &&
      admin.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        {
          error:
            'Only admins can ban or unban users.',
        },
        { status: 403 }
      );
    }

    const data: Prisma.UserUpdateInput = {};

    if (action === 'FLAG') {
      data.isFlagged = true;
    }

    if (action === 'UNFLAG') {
      data.isFlagged = false;
    }

    if (action === 'BAN') {
      data.isBanned = true;
    }

    if (action === 'UNBAN') {
      data.isBanned = false;
    }

    const updatedUser = await prisma.$transaction(
  async (tx) => {
    const result = await tx.user.update({
      where: { id },
      data,
      select: {
        id: true,
        name: true,
        image: true,
        role: true,
        isBanned: true,
        isFlagged: true,
      },
    });

    await tx.moderationLog.create({
      data: {
        moderatorId: admin.id,
        targetType: 'user',
        targetId: user.id,
        action,
      },
    });

    if (action === 'BAN' || action === 'UNBAN') {
      await tx.notification.create({
        data: {
          userId: user.id,
          type: 'ACCOUNT_STATUS',
          title:
            action === 'BAN'
              ? 'Account banned'
              : 'Account restored',
          message:
            action === 'BAN'
              ? 'Your account has been banned by a moderator.'
              : 'Your account has been restored and you can use the platform again.',
        },
      });
    }

    return result;
  }
);

    return NextResponse.json({
      success: true,
      user: updatedUser,
    });
  }

  // ─────────────────────────────────────
  // REPORT MODERATION
  // ─────────────────────────────────────

  if (target === 'report') {
    const report = await prisma.report.findUnique({
      where: { id },
    });

    if (!report) {
      return NextResponse.json(
        { error: 'Report not found.' },
        { status: 404 }
      );
    }

    let status: 'REVIEWED' | 'DISMISSED' | 'ACTIONED';

    if (action === 'REVIEW') {
      status = 'REVIEWED';
    } else if (action === 'DISMISS') {
      status = 'DISMISSED';
    } else {
      status = 'ACTIONED';
    }

    const updatedReport = await prisma.$transaction(
      async (tx) => {
        const result = await tx.report.update({
          where: { id },
          data: { status },
        });

        await tx.moderationLog.create({
          data: {
            moderatorId: admin.id,
            targetType: 'report',
            targetId: report.id,
            action,
          },
        });

        if (action === 'ACTION') {
          if (report.listingId) {
            await tx.listing.update({
              where: { id: report.listingId },
              data: {
                isFlagged: true,
              },
            });
          }

          if (report.reportedUserId) {
            await tx.user.update({
              where: { id: report.reportedUserId },
              data: {
                isFlagged: true,
              },
            });
          }
        }

        return result;
      }
    );

    return NextResponse.json({
      success: true,
      report: updatedReport,
    });
  }

  return NextResponse.json(
    { error: 'Invalid target.' },
    { status: 400 }
  );
}