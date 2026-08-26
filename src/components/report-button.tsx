'use client';

import { useState } from 'react';
import { Flag } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { REPORT_REASONS } from '@/types';

export function ReportButton({
  listingId,
  reportedUserId,
  label = 'Report',
}: {
  listingId?: string;
  reportedUserId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('SCAM');
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, details, listingId, reportedUserId }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Could not submit report.');
      }
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not submit report.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setDone(false);
          setDetails('');
          setError(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        {done ? (
          <>
            <DialogHeader>
              <DialogTitle>Report received</DialogTitle>
              <DialogDescription>
                Thanks for helping keep Branched safe. Our moderation team will review this shortly.
              </DialogDescription>
            </DialogHeader>
            <DialogClose asChild>
              <Button className="w-full">Close</Button>
            </DialogClose>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{listingId ? 'Report this listing' : 'Report this user'}</DialogTitle>
              <DialogDescription>
                Let us know what's wrong. Reports are reviewed by our moderation team and kept confidential.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-2">
              <Label htmlFor="reason">Reason</Label>
              <select
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="h-11 w-full rounded-xl border border-input bg-card px-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-branch-500"
              >
                {REPORT_REASONS.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="details">Additional details (optional)</Label>
              <Textarea
                id="details"
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                placeholder="Anything that helps us understand the issue..."
                rows={3}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button onClick={submit} disabled={submitting} className="w-full">
              {submitting ? 'Submitting...' : 'Submit report'}
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
