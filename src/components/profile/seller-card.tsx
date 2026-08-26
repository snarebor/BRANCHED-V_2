import Link from "next/link";
import {
  ShieldCheck,
  MapPin,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { Button } from "@/components/ui/button";

import { ProfileStats } from "./profile-stats";

import { initials } from "@/lib/utils";


type Props = {
  seller: {
    id: string;
    name: string | null;
    image: string | null;
    location: string | null;
    isVerified: boolean;
    createdAt: Date;
  };

  listingCount: number;

  totalViews: number;
};



export function SellerCard({
  seller,
  listingCount,
  totalViews,
}: Props) {


  return (

    <div className="rounded-2xl border border-border bg-card p-5">


      <div className="flex items-center gap-3">


        <Avatar className="h-14 w-14">

          <AvatarImage
            src={seller.image ?? undefined}
          />

          <AvatarFallback>
            {initials(seller.name)}
          </AvatarFallback>

        </Avatar>



        <div>


          <p className="flex items-center gap-1 font-semibold">

            {seller.name ?? "User"}


            {seller.isVerified && (

              <ShieldCheck
                className="h-4 w-4 text-branch-500"
              />

            )}

          </p>



          {seller.location && (

            <p className="flex items-center gap-1 text-sm text-muted-foreground">

              <MapPin className="h-3 w-3"/>

              {seller.location}

            </p>

          )}


        </div>


      </div>




      <ProfileStats

        listings={listingCount}

        views={totalViews}

        memberSince={seller.createdAt}

      />





      <Button
        asChild
        className="mt-5 w-full"
      >

        <Link href={`/profile/${seller.id}`}>

          View profile

        </Link>


      </Button>


    </div>

  );

}