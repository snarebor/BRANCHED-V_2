'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { showToast } from '@/lib/toast';

export function FavoriteButton({
  listingId,
  initialFavorited,
  floating = false,
}: {
  listingId: string;
  initialFavorited: boolean;
  floating?: boolean;
}) {
  const { status } = useSession();
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [isPending, startTransition] = useTransition();

  async function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }

    const next = !favorited;
    setFavorited(next);

   startTransition(async () => {
  try {
    const response = next
      ? await fetch('/api/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ listingId }),
        })
      : await fetch(
          `/api/favorites?listingId=${listingId}`,
          {
            method: 'DELETE',
          }
        );

    if (!response.ok) {
      const data = await response.json().catch(() => null);

      throw new Error(
        data?.error ?? 'Could not update favorite.'
      );
    }

    showToast({
      title: next
        ? 'Added to favorites'
        : 'Removed from favorites',
      description: next
        ? 'You can find this listing in your favorites.'
        : 'The listing has been removed from your favorites.',
    });

    router.refresh();
  } catch (err) {
    setFavorited(!next);

    const message =
      err instanceof Error
        ? err.message
        : 'Could not update favorite.';

    showToast({
      title: 'Could not update favorite',
      description: message,
    });
  }
});
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      aria-pressed={favorited}
      aria-label={favorited ? 'Remove from favorites' : 'Save to favorites'}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-full transition-colors',
        floating ? 'bg-card/90 shadow-sm hover:bg-card' : 'bg-muted hover:bg-branch-50',
      )}
    >
      <Heart
        className={cn('h-4 w-4 transition-colors', favorited ? 'fill-red-500 text-red-500' : 'text-foreground')}
      />
    </button>
  );
}
