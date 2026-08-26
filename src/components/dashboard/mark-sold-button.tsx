'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { CheckCircle } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function MarkSoldButton({
  listingId,
}: {
  listingId: string;
}) {
  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  async function markSold() {
    setLoading(true);

    try {
      await fetch(
        `/api/listings/${listingId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            status: 'SOLD',
          }),
        },
      );

      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      onClick={markSold}
      disabled={loading}
      className="text-green-600"
    >
      <CheckCircle className="mr-2 h-4 w-4" />

      {loading
        ? 'Updating...'
        : 'Mark sold'}
    </Button>
  );
}