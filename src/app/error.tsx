'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="font-display text-3xl font-semibold text-branch-900">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm text-muted-foreground">
          We couldn't load this page right now. Please try again.
        </p>

        <Button
          className="mt-6"
          onClick={() => reset()}
        >
          Try again
        </Button>
      </div>
    </div>
  );
}