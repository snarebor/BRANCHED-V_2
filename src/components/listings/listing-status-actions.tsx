'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';

type ListingStatus =
  | 'ACTIVE'
  | 'SOLD'
  | 'ARCHIVED'
  | 'REMOVED';

export function ListingStatusActions({
  listingId,
  status,
}: {
  listingId: string;
  status: ListingStatus;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(nextStatus: ListingStatus) {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/listings/${listingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: nextStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Could not update listing.'
        );
      }

      const messages: Record<ListingStatus, {
  title: string;
  description: string;
}> = {
  ACTIVE: {
    title: 'Listing reactivated',
    description: 'Your listing is visible in the marketplace again.',
  },
  SOLD: {
    title: 'Listing marked as sold',
    description: 'Your listing is no longer actively available.',
  },
  ARCHIVED: {
    title: 'Listing archived',
    description: 'Your listing has been archived.',
  },
  REMOVED: {
    title: 'Listing removed',
    description: 'Your listing has been removed.',
  },
};

showToast(messages[nextStatus]);

router.refresh();
    } catch (err) {
  const message =
    err instanceof Error
      ? err.message
      : 'Could not update listing.';

  setError(message);

  showToast({
    title: 'Could not update listing',
    description: message,
  });
} finally {
      setLoading(false);
    }
  }

  if (status === 'REMOVED') {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      {status === 'ACTIVE' && (
        <>
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={() => updateStatus('SOLD')}
          >
            {loading ? 'Updating...' : 'Mark as sold'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            onClick={() => updateStatus('ARCHIVED')}
          >
            Archive listing
          </Button>
        </>
      )}

      {(status === 'SOLD' || status === 'ARCHIVED') && (
        <Button
          type="button"
          variant="outline"
          disabled={loading}
          onClick={() => updateStatus('ACTIVE')}
        >
          {loading ? 'Updating...' : 'Reactivate listing'}
        </Button>
      )}

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}