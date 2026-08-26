import Link from 'next/link';
import { Eye } from 'lucide-react';

import { formatPrice } from '@/lib/utils';


type Props = {
  listing: {
    id: string;
    title: string;
    price: number | null;
    location: string;
    views: number;
    status: string;
  };
};



export function DashboardListingCard({
  listing,
}: Props) {


  return (

    <Link

      href={`/listings/${listing.id}`}

      className="block rounded-2xl border border-border bg-card p-4 transition hover:border-branch-300"

    >


      <div className="flex justify-between gap-4">


        <div>

          <h3 className="font-medium text-branch-900">
            {listing.title}
          </h3>


          <p className="mt-1 text-sm text-muted-foreground">
            {listing.location}
          </p>


          <p className="mt-2 font-semibold">
            {formatPrice(listing.price)}
          </p>

        </div>



        <span className="rounded-full bg-branch-50 px-3 py-1 text-xs text-branch-700">

          {listing.status}

        </span>


      </div>



      <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">

        <Eye className="h-4 w-4"/>

        {listing.views} views

      </div>


    </Link>

  );

}