// types/db.ts
export type MerchStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'LIVE'
  | 'SOLD_OUT'
  | 'COMPLETE'
  | string;

export interface Merch {
  itemId: number;
  title: string;
  description?: string | null;
  price: number;
  status: MerchStatus;

  contactName?: string | null;
  contactLineId?: string | null;

  posterUrl?: string | null;
  frontViewUrl?: string | null;
  backViewUrl?: string | null;
  sizeChartUrl?: string | null;
  miscUrls?: string[] | null;
}

export type CartItem = {
  itemId: number | string;
  title: string;
  price: number;
  qty: number;
  size?: string | null;
  color?: string | null;
  image?: string | null;
};

