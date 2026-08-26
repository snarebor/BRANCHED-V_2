import { ReactNode } from 'react';


type Props = {
  title: string;
  value: string | number;
  icon?: ReactNode;
};


export function DashboardCard({
  title,
  value,
  icon,
}: Props) {

  return (

    <div className="rounded-2xl border border-border bg-card p-5">

      <div className="flex items-center justify-between">

        <p className="text-sm text-muted-foreground">
          {title}
        </p>

        {icon}

      </div>


      <p className="mt-3 font-display text-3xl font-semibold text-branch-900">
        {value}
      </p>


    </div>

  );

}