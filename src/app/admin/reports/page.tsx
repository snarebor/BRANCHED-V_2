import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ModerationActions } from '@/components/admin/moderation-actions';

export default async function AdminReportsPage() {
  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      role: true,
    },
  });

  if (user?.role !== 'ADMIN') {
    redirect('/browse');
  }

  const reports = await prisma.report.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    include: {
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
        },
      },
    },
  });

  return (
    <div className="container max-w-6xl py-10">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-semibold text-branch-900">
          Moderation
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Review reports and take action on problematic users or listings.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <p className="font-medium">
            No reports
          </p>

          <p className="mt-1 text-sm text-muted-foreground">
            Everything is currently clear.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-sm font-semibold">
                    {report.reason}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Reported by{' '}
                    {report.reporter.name ?? 'Unknown user'}
                  </p>
                </div>

                <span className="rounded-full bg-muted px-3 py-1 text-xs font-medium">
                  {report.createdAt.toLocaleDateString()}
                </span>
              </div>

              {report.details && (
                <p className="mt-4 rounded-xl bg-muted p-3 text-sm">
                  {report.details}
                </p>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
             {report.listing && (
  <div className="rounded-xl border border-border p-4">
    <Link
      href={`/listings/${report.listing.id}`}
      className="block transition-colors hover:bg-muted"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Listing
      </p>

      <p className="mt-1 font-medium">
        {report.listing.title}
      </p>

      <p className="mt-1 text-xs text-muted-foreground">
        Status: {report.listing.status}
      </p>

      {report.listing.isFlagged && (
        <p className="mt-2 text-xs font-medium text-destructive">
          Flagged
        </p>
      )}
    </Link>

    <ModerationActions
      target="listing"
      id={report.listing.id}
      isFlagged={report.listing.isFlagged}
      status={report.listing.status}
    />
  </div>
)}

                {report.reportedUser && (
  <div className="rounded-xl border border-border p-4">
    <Link
      href={`/profile/${report.reportedUser.id}`}
      className="block transition-colors hover:bg-muted"
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        User
      </p>

      <p className="mt-1 font-medium">
        {report.reportedUser.name ?? 'Unknown user'}
      </p>

      <div className="mt-2 flex gap-2 text-xs">
        {report.reportedUser.isFlagged && (
          <span className="font-medium text-destructive">
            Flagged
          </span>
        )}

        {report.reportedUser.isBanned && (
          <span className="font-medium text-destructive">
            Banned
          </span>
        )}
      </div>
    </Link>

    <ModerationActions
      target="user"
      id={report.reportedUser.id}
      isFlagged={report.reportedUser.isFlagged}
      isBanned={report.reportedUser.isBanned}
    />
  </div>
)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}