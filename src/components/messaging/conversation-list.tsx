'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  cn,
  formatRelativeTime,
  initials,
} from '@/lib/utils';

type ConversationSummary = {
  id: string;
  listingId: string | null;
  listingTitle: string | null;
  unreadCount: number;
  lastMessage: {
    body: string;
    createdAt: string;
  } | null;
  otherParticipants: {
    id: string;
    name: string | null;
    image: string | null;
  }[];
};

export function ConversationList({
  conversations,
}: {
  conversations: ConversationSummary[];
}) {
  const pathname = usePathname();

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        No conversations yet. Message a seller from a listing page to get started.
      </div>
    );
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {conversations.map((conversation) => {
        const other = conversation.otherParticipants[0];
        const active = pathname === `/messages/${conversation.id}`;
        const unread = conversation.unreadCount > 0;

        return (
          <li key={conversation.id}>
            <Link
              href={`/messages/${conversation.id}`}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted',
                active && 'bg-branch-50',
                unread && !active && 'bg-branch-50/60 hover:bg-branch-50'
              )}
            >
              <Avatar>
                <AvatarImage
                  src={other?.image ?? undefined}
                  alt={other?.name ?? 'User'}
                />
                <AvatarFallback>
                  {initials(other?.name)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <p
                      className={cn(
                        'truncate text-sm',
                        unread ? 'font-semibold' : 'font-medium'
                      )}
                    >
                      {other?.name ?? 'Deleted user'}
                    </p>

                    {unread && (
                      <span
                        className="rounded-full bg-branch-500 px-2 py-0.5 text-[10px] font-semibold text-white"
                        aria-label={`${conversation.unreadCount} unread messages`}
                      >
                        {conversation.unreadCount}
                      </span>
                    )}
                  </div>

                  {conversation.lastMessage && (
                    <span
                      className={cn(
                        'shrink-0 text-xs',
                        unread
                          ? 'font-medium text-branch-700'
                          : 'text-muted-foreground'
                      )}
                    >
                      {formatRelativeTime(
                        conversation.lastMessage.createdAt
                      )}
                    </span>
                  )}
                </div>

                {conversation.listingTitle && (
                  <p className="truncate text-xs font-medium text-branch-600">
                    {conversation.listingTitle}
                  </p>
                )}

                <p
                  className={cn(
                    'truncate text-xs',
                    unread
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground'
                  )}
                >
                  {conversation.lastMessage?.body ?? 'No messages yet'}
                </p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}