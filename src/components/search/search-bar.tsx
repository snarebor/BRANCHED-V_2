'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SearchBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [location, setLocation] = useState(searchParams.get('location') ?? '');

 function onSubmit(e: React.FormEvent) {
  e.preventDefault();

  const params = new URLSearchParams(searchParams.toString());

  if (q) {
    params.set('q', q);
  } else {
    params.delete('q');
  }

  if (location) {
    params.set('location', location);
  } else {
    params.delete('location');
  }

  params.delete('page');

  router.push(`/browse?${params.toString()}`);
}

  return (
    <form
      onSubmit={onSubmit}
      className={`flex w-full flex-col gap-2 rounded-2xl border border-border bg-card p-2 shadow-sm sm:flex-row sm:items-center sm:rounded-full ${
        compact ? 'max-w-xl' : 'max-w-2xl'
      }`}
    >
      <div className="flex flex-1 items-center gap-2 px-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search listings — a room, a laptop, a job..."
          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <div className="hidden h-6 w-px bg-border sm:block" />
      <div className="flex flex-1 items-center gap-2 px-3 sm:max-w-[200px]">
        <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="City"
          className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
        />
      </div>
      <Button type="submit" className="sm:rounded-full" size={compact ? 'default' : 'lg'}>
        Search
      </Button>
    </form>
  );
}
