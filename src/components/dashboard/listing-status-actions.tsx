'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Archive,
  CheckCircle,
  RotateCcw,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type ListingStatus =
  | 'ACTIVE'
  | 'SOLD'
  | 'ARCHIVED'
  | 'REMOVED';

type Props = {
  listingId: string;
  status: ListingStatus;
};

export function ListingStatusActions({
  listingId,
  status,
}: Props) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [pendingStatus, setPendingStatus] =
    useState<ListingStatus | null>(null);

  function requestStatusChange(
    nextStatus: ListingStatus
  ) {
    setError(null);
    setPendingStatus(nextStatus);
  }

  async function updateStatus() {
    if (!pendingStatus) return;

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
            status: pendingStatus,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ??
            'Could not update listing status.'
        );
      }

      setPendingStatus(null);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not update listing status.'
      );
    } finally {
      setLoading(false);
    }
  }

  if (status === 'REMOVED') {
    return null;
  }

  const dialogTitle =
    pendingStatus === 'SOLD'
      ? 'Mark listing as sold?'
      : pendingStatus === 'ARCHIVED'
      ? 'Archive this listing?'
      : 'Reactivate this listing?';

  const dialogDescription =
    pendingStatus === 'SOLD'
      ? 'This listing will be marked as sold and will no longer appear as an active listing.'
      : pendingStatus === 'ARCHIVED'
      ? 'This listing will be archived and removed from your active listings.'
      : 'This listing will become active again and can be viewed by buyers.';

  return (
    <>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {status === 'ACTIVE' && (
            <>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() =>
                  requestStatusChange('SOLD')
                }
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Mark sold
              </Button>

              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={loading}
                onClick={() =>
                  requestStatusChange('ARCHIVED')
                }
              >
                <Archive className="mr-2 h-4 w-4" />
                Archive
              </Button>
            </>
          )}

          {(status === 'SOLD' ||
            status === 'ARCHIVED') && (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={loading}
              onClick={() =>
                requestStatusChange('ACTIVE')
              }
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reactivate
            </Button>
          )}
        </div>

        {error && (
          <p className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>

      <Dialog
        open={pendingStatus !== null}
        onOpenChange={(open) => {
          if (!open && !loading) {
            setPendingStatus(null);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogTitle}
            </DialogTitle>

            <DialogDescription>
              {dialogDescription}
            </DialogDescription>
          </DialogHeader>

          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() =>
                setPendingStatus(null)
              }
            >
              Cancel
            </Button>

            <Button
              type="button"
              disabled={loading}
              onClick={updateStatus}
            >
              {loading
                ? 'Updating...'
                : 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}