import Link from 'next/link';
import { Logo } from '@/components/layout/logo';

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-card">
      <div className="container flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-xs text-sm text-muted-foreground">
            A structured, searchable marketplace built for people rebuilding their lives abroad.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-muted-foreground">
          <Link href="/browse" className="hover:text-foreground">Browse listings</Link>
          <Link href="/listings/new" className="hover:text-foreground">Post a listing</Link>
          <Link href="/register" className="hover:text-foreground">Create account</Link>
        </div>
      </div>
      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Branched. Built for a safer classifieds experience.
      </div>
    </footer>
  );
}
