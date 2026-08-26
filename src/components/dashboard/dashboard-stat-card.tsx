import { ReactNode } from 'react';

type DashboardStatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  description?: string;
};

export function DashboardStatCard({
  title,
  value,
  icon,
  description,
}: DashboardStatCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        {icon}
      </div>

      <p className="mt-3 text-3xl font-semibold text-branch-900">
        {value}
      </p>

      {description && (
        <p className="mt-1 text-xs text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
}