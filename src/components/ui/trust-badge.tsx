import { cn } from '@/lib/utils';
import type { TrustResult } from '@/lib/trust';


type TrustBadgeProps = {

  trust?: TrustResult;

  className?: string;

};




export function TrustBadge({

  trust,

  className,

}: TrustBadgeProps) {


  if (!trust) {
    return null;
  }



  const Icon = trust.icon;



  const styles = {


    NEW_MEMBER:
      'border-muted bg-muted text-muted-foreground',


    VERIFIED:
      'border-branch-200 bg-branch-50 text-branch-700',


    TRUSTED:
      'border-yellow-200 bg-yellow-50 text-yellow-700',


    POWER:
      'border-orange-200 bg-orange-50 text-orange-700',


  };



  return (

    <div

      className={cn(

        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium',

        styles[trust.level],

        className

      )}

      title={trust.description}

    >

      <Icon className="h-3.5 w-3.5" />

      {trust.label}

    </div>

  );

}