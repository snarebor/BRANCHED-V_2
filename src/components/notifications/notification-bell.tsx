'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';

import { cn } from '@/lib/utils';

type NotificationItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  listingId: string | null;
  conversationId: string | null;
  createdAt: string;
};

export function NotificationBell() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const NOTIFICATION_POLL_INTERVAL = 10000;

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications');

      if (!response.ok) return;

      const data = await response.json();

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // Ignore notification loading failures.
    }
  }

  useEffect(() => {
  loadNotifications();

  const interval = setInterval(() => {
    loadNotifications();
  }, 10000);

  return () => clearInterval(interval);
}, []);

  async function markRead(id: string) {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id
          ? { ...notification, isRead: true }
          : notification
      )
    );

    setUnreadCount((count) => Math.max(0, count - 1));
  }

  async function markAllRead() {
    await fetch('/api/notifications', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    });

    setNotifications((current) =>
      current.map((notification) => ({
        ...notification,
        isRead: true,
      }))
    );

    setUnreadCount(0);
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          'relative flex h-10 w-10 items-center justify-center rounded-full',
          'hover:bg-muted'
        )}
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />

        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-5 min-w-5 items-center justify-center rounded-full bg-branch-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <p className="font-semibold">
              Notifications
            </p>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="text-xs font-medium text-branch-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No notifications yet.
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'border-b border-border px-4 py-3',
                    !notification.isRead && 'bg-branch-50'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => markRead(notification.id)}
                    className="w-full text-left"
                  >
                    <p className="text-sm font-semibold">
                      {notification.title}
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {notification.message}
                    </p>
                  </button>

                  {notification.conversationId && (
  <Link
    href={`/messages/${notification.conversationId}`}
    onClick={() => markRead(notification.id)}
    className="mt-2 inline-block text-xs font-medium text-branch-600 hover:underline"
  >
    View message
  </Link>
)}

{notification.listingId && (
  <Link
    href={`/listings/${notification.listingId}`}
    onClick={() => markRead(notification.id)}
    className="mt-2 inline-block text-xs font-medium text-branch-600 hover:underline"
  >
    View listing
  </Link>
)}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}