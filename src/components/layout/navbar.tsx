'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Plus, User as UserIcon, LogOut, Settings, ListIcon } from 'lucide-react';
import { Logo } from '@/components/layout/logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { initials } from '@/lib/utils';
import { NotificationBell } from '@/components/notifications/notification-bell';

export function Navbar() {
  const { data: session, status } = useSession();
  const user = session?.user as {
  id?: string;
  name?: string | null;
  image?: string | null;
  role?: string;
} | undefined;
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="container flex h-16 items-center justify-between gap-4">
        <Link href="/">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/browse">Browse</Link>
          </Button>
          {user && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/favorites">Favorites</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/messages">Messages</Link>
              </Button>
              <NotificationBell />
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {user && (
            <Button asChild className="hidden sm:inline-flex">
              <Link href="/listings/new">
                <Plus className="h-4 w-4" />
                Post a listing
              </Link>
            </Button>
          )}

          {status === 'loading' ? (
            <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full ring-offset-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-branch-500">
                  <Avatar>
                    <AvatarImage src={user.image ?? undefined} alt={user.name ?? 'Profile'} />
                    <AvatarFallback>{initials(user.name)}</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">

  <DropdownMenuItem asChild>
    <Link href="/dashboard">
      <UserIcon className="h-4 w-4" /> Dashboard
    </Link>
  </DropdownMenuItem>
  {user.role === 'ADMIN' && (
  <DropdownMenuItem asChild>
    <Link href="/admin/reports">
      Admin / Moderation
    </Link>
  </DropdownMenuItem>
)}


  <DropdownMenuItem asChild>
    <Link href={`/profile/${user.id}`}>
      <UserIcon className="h-4 w-4" /> My profile
    </Link>
  </DropdownMenuItem>
  <DropdownMenuItem asChild>
  <Link href="/my-listings">
    <ListIcon className="h-4 w-4" /> My listings
  </Link>
</DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/listings/new" className="sm:hidden">
                    <Plus className="h-4 w-4" /> Post a listing
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile/edit">
                    <Settings className="h-4 w-4" /> Edit profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/' })}>
                  <LogOut className="h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
