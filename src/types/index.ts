export type ListingCardData = {
  id: string;

  title: string;

  description: string;

  price: number | null;

  currency: string;

  location: string;

  images: string[];

  createdAt: Date;

  updatedAt: Date;

  views: number;

  featured: boolean;

  category: {
    id: string;
    slug: string;
    nameRu: string;
    nameEn: string;
  };

  user: {
    id: string;
    name: string | null;
    image: string | null;
    isVerified: boolean;
  };

  _favorited?: boolean;
};
export type ListingDetailData = ListingCardData & {
  description: string;
  status: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
    location: string | null;
    isVerified: boolean;
    createdAt: string | Date;
  };
};

export type CategoryData = {
  id: string;
  slug: string;
  nameRu: string;
  nameEn: string;
  icon?: string | null;
};

export const REPORT_REASONS = [
  { value: 'SCAM', label: 'Scam or fraud' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'INAPPROPRIATE', label: 'Inappropriate content' },
  { value: 'DUPLICATE', label: 'Duplicate listing' },
  { value: 'PROHIBITED_ITEM', label: 'Prohibited item' },
  { value: 'HARASSMENT', label: 'Harassment' },
  { value: 'OTHER', label: 'Other' },
] as const;
