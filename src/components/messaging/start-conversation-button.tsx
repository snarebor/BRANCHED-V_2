'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, X } from 'lucide-react';

import { Button } from '@/components/ui/button';

export function StartConversationButton({
  recipientId,
}: {
  recipientId: string;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  async function sendMessage() {
    const message = body.trim();

    if (!message) {
      return;
    }

    setSending(true);
    setError('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId,
          body: message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error ?? 'Could not send message.');
        return;
      }

      router.push(`/messages/${data.conversationId}`);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSending(false);
    }
  }

  if (!open) {
    return (
      <Button
        type="button"
        onClick={() => setOpen(true)}
      >
        <MessageCircle className="h-4 w-4" />
        Message
      </Button>
    );
  }

  return (
    <div className="w-full max-w-sm rounded-xl border border-border bg-background p-3 sm:w-80">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm font-semibold">
          Send a message
        </p>

        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError('');
          }}
          className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Close message form"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <textarea
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder="Write your message..."
        maxLength={2000}
        rows={4}
        className="w-full resize-none rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-branch-500"
        disabled={sending}
      />

      {error && (
        <p className="mt-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-2 flex justify-end">
        <Button
          type="button"
          onClick={sendMessage}
          disabled={sending || !body.trim()}
          size="sm"
        >
          {sending ? 'Sending...' : 'Send message'}
        </Button>
      </div>
    </div>
  );
}