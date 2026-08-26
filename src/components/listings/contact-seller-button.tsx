'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function ContactSellerButton({ listingId, sellerId }: { listingId: string; sellerId: string }) {
  const { status } = useSession();
  const router = useRouter();
  const [message, setMessage] = useState('Hi! Is this still available?');
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }
    setSending(true);
    setError(null);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientId: sellerId, listingId, body: message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Could not send message.');
      setOpen(false);
      router.push(`/messages/${data.conversationId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send message.');
    } finally {
      setSending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="w-full sm:w-auto">
          <MessageCircle className="h-4 w-4" />
          Contact seller
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Message the seller</DialogTitle>
          <DialogDescription>Your message starts a private conversation. The seller will be able to reply directly.</DialogDescription>
        </DialogHeader>
        <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} maxLength={2000} />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button onClick={send} disabled={sending || !message.trim()} className="w-full">
          {sending ? 'Sending...' : 'Send message'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
