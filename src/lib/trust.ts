import type { LucideIcon } from 'lucide-react';
import {
  Sprout,
  BadgeCheck,
  Star,
  Flame,
} from 'lucide-react';


export type TrustLevel =
  | 'NEW_MEMBER'
  | 'VERIFIED'
  | 'TRUSTED'
  | 'POWER';



export type TrustResult = {

  level: TrustLevel;

  label: string;

  description: string;

  icon: LucideIcon;

};




type TrustInput = {

  isVerified: boolean;

  listingsCount: number;

  totalViews: number;

  favoritesCount: number;

  createdAt: Date;

};




export function calculateTrustLevel({

  isVerified,

  listingsCount,

  totalViews,

  favoritesCount,

  createdAt,

}: TrustInput): TrustResult {



  const accountAgeDays =

    Math.floor(

      (Date.now() - new Date(createdAt).getTime())

      /

      (1000 * 60 * 60 * 24)

    );





  if (

    isVerified &&

    listingsCount >= 20 &&

    totalViews >= 500 &&

    favoritesCount >= 25

  ) {


    return {

      level: 'POWER',

      label: 'Power Seller',

      description: 'Highly trusted and active seller',

      icon: Flame,

    };


  }





  if (

    isVerified &&

    listingsCount >= 5 &&

    totalViews >= 50 &&

    favoritesCount >= 3

  ) {


    return {

      level: 'TRUSTED',

      label: 'Trusted Seller',

      description: 'Reliable community seller',

      icon: Star,

    };


  }






  if (isVerified) {


    return {

      level: 'VERIFIED',

      label: 'Verified Seller',

      description: 'Identity verified seller',

      icon: BadgeCheck,

    };


  }






  if (accountAgeDays < 30) {


    return {

      level: 'NEW_MEMBER',

      label: 'New Member',

      description: 'Recently joined Branched',

      icon: Sprout,

    };


  }







  return {

    level: 'NEW_MEMBER',

    label: 'New Member',

    description: 'Building marketplace reputation',

    icon: Sprout,

  };

}