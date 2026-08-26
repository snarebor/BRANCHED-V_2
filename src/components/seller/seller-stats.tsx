import {
  CalendarDays,
  Eye,
  Heart,
  Package,
} from 'lucide-react';


type SellerStatsProps = {
  listingsCount: number;
  totalViews: number;
  favoritesCount: number;
  createdAt: Date;
};


export function SellerStats({
  listingsCount,
  totalViews,
  favoritesCount,
  createdAt,
}: SellerStatsProps) {


  const joinedYear = new Date(createdAt).getFullYear();


  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

      <div className="rounded-xl border border-border bg-card p-3">

        <div className="flex items-center gap-2 text-muted-foreground">

          <Package className="h-4 w-4" />

          <span className="text-xs">
            Listings
          </span>

        </div>


        <p className="mt-1 font-display text-lg font-semibold">
          {listingsCount}
        </p>

      </div>



      <div className="rounded-xl border border-border bg-card p-3">

        <div className="flex items-center gap-2 text-muted-foreground">

          <Eye className="h-4 w-4" />

          <span className="text-xs">
            Views
          </span>

        </div>


        <p className="mt-1 font-display text-lg font-semibold">
          {totalViews}
        </p>

      </div>



      <div className="rounded-xl border border-border bg-card p-3">

        <div className="flex items-center gap-2 text-muted-foreground">

          <Heart className="h-4 w-4" />

          <span className="text-xs">
            Saves
          </span>

        </div>


        <p className="mt-1 font-display text-lg font-semibold">
          {favoritesCount}
        </p>

      </div>




      <div className="rounded-xl border border-border bg-card p-3">

        <div className="flex items-center gap-2 text-muted-foreground">

          <CalendarDays className="h-4 w-4" />

          <span className="text-xs">
            Member
          </span>

        </div>


        <p className="mt-1 font-display text-lg font-semibold">
          {joinedYear}
        </p>

      </div>


    </div>
  );
}