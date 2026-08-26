import Link from 'next/link';
import { Search, Home } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-branch-50">
        <Search className="h-7 w-7 text-branch-600" />
      </div>

      <h1 className="mt-6 font-display text-4xl font-semibold text-branch-900">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-sm text-muted-foreground">
        The page you're looking for doesn't exist or may have been removed.
      </p>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" />
            Go home
          </Link>
        </Button>

        <Button variant="outline" asChild>
          <Link href="/browse">
            Browse listings
          </Link>
        </Button>
      </div>
    </div>
  );
}