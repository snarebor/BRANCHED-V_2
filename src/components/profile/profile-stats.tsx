type Props = {
  listings: number;
  views: number;
  memberSince: Date;
};

export function ProfileStats({
  listings,
  views,
  memberSince,
}: Props) {
  return (
    <div className="grid grid-cols-3 gap-3 pt-4">

      <div className="rounded-xl border p-3 text-center">
        <p className="text-xl font-semibold">
          {listings}
        </p>

        <p className="text-xs text-muted-foreground">
          Listings
        </p>
      </div>

      <div className="rounded-xl border p-3 text-center">
        <p className="text-xl font-semibold">
          {views}
        </p>

        <p className="text-xs text-muted-foreground">
          Views
        </p>
      </div>

      <div className="rounded-xl border p-3 text-center">
        <p className="text-xs font-medium">
          {memberSince.toLocaleDateString()}
        </p>

        <p className="text-xs text-muted-foreground">
          Joined
        </p>
      </div>

    </div>
  );
}