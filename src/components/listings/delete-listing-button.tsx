'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { showToast } from '@/lib/toast';

export function DeleteListingButton({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function onDelete() {
    setDeleting(true);
    const res = await fetch(`/api/listings/${listingId}`, { method: 'DELETE' });
    if (res.ok) {
      showToast({
  title: 'Listing deleted',
  description: 'Your listing has been removed.',
});
      router.push('/browse');
      router.refresh();
   } else {
  showToast({
    title: 'Could not delete listing',
    description: 'Please try again.',
  });

  setDeleting(false);
}
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">
          <Trash2 className="h-4 w-4" /> Delete listing
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this listing?</DialogTitle>
          <DialogDescription>This can't be undone. The listing will be permanently removed.</DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="flex-1">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" className="flex-1" onClick={onDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
