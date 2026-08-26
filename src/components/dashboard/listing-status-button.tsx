'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useState } from 'react';


export function ListingStatusButton({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {

  const router = useRouter();

  const [loading, setLoading] = useState(false);


  async function updateStatus(newStatus: string) {

    setLoading(true);

    await fetch(`/api/listings/${listingId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status: newStatus,
      }),
    });


    setLoading(false);

    router.refresh();
  }


  if (status === 'ACTIVE') {

    return (
      <div className="flex gap-2">

        <Button
          size="sm"
          onClick={() => updateStatus('SOLD')}
          disabled={loading}
        >
          Mark sold
        </Button>


        <Button
          size="sm"
          variant="outline"
          onClick={() => updateStatus('ARCHIVED')}
          disabled={loading}
        >
          Archive
        </Button>

      </div>
    );
  }


  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => updateStatus('ACTIVE')}
      disabled={loading}
    >
      Reactivate
    </Button>
  );
}