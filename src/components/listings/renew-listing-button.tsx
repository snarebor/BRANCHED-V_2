'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { showToast } from '@/lib/toast';
export function RenewListingButton({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function renewListing() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/listings/${listingId}/renew`,
        {
          method: 'PATCH',
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ?? 'Could not renew listing.'
        );
      }
      showToast({
  title: 'Listing renewed',
  description: 'Your listing is active for another 30 days.',
});

      router.refresh();
    } catch (err) {
  const message =
    err instanceof Error
      ? err.message
      : 'Could not renew listing.';

  setError(message);

  showToast({
    title: 'Could not renew listing',
    description: message,
  });
} finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        type="button"
        variant="outline"
        onClick={renewListing}
        disabled={loading}
      >
        {loading ? 'Renewing...' : 'Renew listing'}
      </Button>

      {error && (
        <p className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}