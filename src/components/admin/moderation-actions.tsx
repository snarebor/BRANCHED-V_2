'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

type Target = 'listing' | 'user';

type Action =
  | 'FLAG'
  | 'UNFLAG'
  | 'REMOVE'
  | 'RESTORE'
  | 'BAN'
  | 'UNBAN';

export function ModerationActions({
  target,
  id,
  isFlagged,
  isBanned,
  status,
}: {
  target: Target;
  id: string;
  isFlagged?: boolean;
  isBanned?: boolean;
  status?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function runAction(action: Action) {
    setLoading(true);

    try {
      const res = await fetch('/api/admin/moderation', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target,
          id,
          action,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Action failed.');
      }

      router.refresh();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  if (target === 'listing') {
    return (
      <div className="mt-4 flex flex-wrap gap-2">
        {isFlagged ? (
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => runAction('UNFLAG')}
          >
            Unflag
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled={loading}
            onClick={() => runAction('FLAG')}
          >
            Flag listing
          </Button>
        )}

        {status === 'REMOVED' ? (
          <Button
            size="sm"
            disabled={loading}
            onClick={() => runAction('RESTORE')}
          >
            Restore listing
          </Button>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            disabled={loading}
            onClick={() => runAction('REMOVE')}
          >
            Remove listing
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-4 flex flex-wrap gap-2">
      {isFlagged ? (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => runAction('UNFLAG')}
        >
          Unflag user
        </Button>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => runAction('FLAG')}
        >
          Flag user
        </Button>
      )}

      {isBanned ? (
        <Button
          variant="outline"
          size="sm"
          disabled={loading}
          onClick={() => runAction('UNBAN')}
        >
          Unban user
        </Button>
      ) : (
        <Button
          variant="destructive"
          size="sm"
          disabled={loading}
          onClick={() => runAction('BAN')}
        >
          Ban user
        </Button>
      )}
    </div>
  );
}