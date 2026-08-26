'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import { Home, Briefcase, ShoppingBag, Wrench, Car, Users, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryData } from '@/types';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  briefcase: Briefcase,
  'shopping-bag': ShoppingBag,
  wrench: Wrench,
  car: Car,
  users: Users,
};

export function CategoryFilter({ categories }: { categories: CategoryData[] }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const active = searchParams.get('category');

  function hrefFor(slug?: string) {
  const params = new URLSearchParams(searchParams.toString());

  if (slug) {
    params.set('category', slug);
  } else {
    params.delete('category');
  }

  params.delete('page');

  return `${pathname}?${params.toString()}`;
}

  return (
    <div className="no-scrollbar flex items-center gap-2 overflow-x-auto pb-1">
      <Link
        href={hrefFor(undefined)}
        className={cn(
          'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
          !active ? 'border-branch-500 bg-branch-500 text-white' : 'border-border bg-card text-foreground hover:bg-muted',
        )}
      >
        <LayoutGrid className="h-3.5 w-3.5" />
        All
      </Link>
      {categories.map((c) => {
        const Icon = c.icon ? ICONS[c.icon] : undefined;
        const isActive = active === c.slug;
        return (
          <Link
            key={c.id}
            href={hrefFor(c.slug)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors',
              isActive ? 'border-branch-500 bg-branch-500 text-white' : 'border-border bg-card text-foreground hover:bg-muted',
            )}
          >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {c.nameRu}
          </Link>
        );
      })}
    </div>
  );
}
