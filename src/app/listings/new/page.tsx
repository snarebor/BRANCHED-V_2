import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ListingForm } from '@/components/listings/listing-form';

export default async function NewListingPage() {
  const session = await getServerSession(authOptions);

  const userId =
    (session?.user as { id?: string } | undefined)?.id;

  if (!userId) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      isBanned: true,
    },
  });

  if (!user) {
    redirect('/login');
  }

  if (user.isBanned) {
    return (
      <div className="container max-w-2xl py-10">
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="font-display text-2xl font-semibold text-branch-900">
            Account restricted
          </h1>

          <p className="mt-2 text-sm text-muted-foreground">
            Your account has been banned and you cannot post new listings.
          </p>
        </div>
      </div>
    );
  }

  const categories = await prisma.category.findMany({
    orderBy: { nameRu: 'asc' },
    select: {
      id: true,
      slug: true,
      nameRu: true,
      nameEn: true,
      icon: true,
    },
  });

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-display text-2xl font-semibold text-branch-900">
        Post a listing
      </h1>

      <p className="mt-1 text-sm text-muted-foreground">
        Be specific and honest — clear listings get faster, safer responses.
      </p>

      <div className="mt-8">
        <ListingForm categories={categories} />
      </div>
    </div>
  );
}