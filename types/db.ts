export type ID = string;

/* ---------- Shared Status for Events/Fundraising/Announcements ---------- */
export type Status = 'PENDING' | 'LIVE' | 'COMPLETE';

/* ---------- Events ---------- */
export type Event = {
  id: ID;
  title: string;
  date: string;        // keep: single-day ISO (existing code)
  summary: string;
  description: string;
  status: Status;

  // ---- Optional fields to support your Events UI ----
  priceType?: 'free' | 'paid';
  openStaffSlots?: number;
  openParticipantSlots?: number;
  imageUrl?: string;

  // Optional range dates (for multi-day events). If absent, fall back to `date`
  startDate?: string;  // ISO
  endDate?: string;    // ISO
  registeredStaff?: number;
  registeredParticipants?: number;
};

/* ---------- Fundraising ---------- */
export type Fundraising = {
  id: ID;
  title: string;
  goal: number;
  summary: string;
  description: string;
  status: Status;
  currentDonation?: number;
  imageUrl?: string;
};


/* ---------- Merchandise ---------- */
export type MerchImage = {
  alt: string;
  url: string;
};

export type MerchColor = {
  code: string;      // e.g. 'white', 'navy'
  name: string;      // 'White', 'Navy'
  thumbnail: string; // small image url
};

export type MerchSize = 'XS'|'S'|'M'|'L'|'XL'|'2XL'|'3XL';

export type Merch = {
  itemId: string;       // ItemID
  slug: string;         // for routing
  title: string;
  description?: string;
  price: number;        // Price
  status: 'PENDING' | 'APPROVED' | 'SOLD_OUT';  // ✅ added for merch
  availableSizes: MerchSize[];
  availableColors: MerchColor[];
  pickupPoint?: string; // PickUpPoint
  pickupDate?: string;  // e.g. '28 Jan - 14 Feb'
  pickupTime?: string;  // e.g. '10:30 - 15:00'
  contactName?: string;
  contactLineId?: string;
  images: {
    poster: MerchImage;
    frontView?: MerchImage;
    backView?: MerchImage;
    sizeChart?: MerchImage;
    misc?: MerchImage[];
  };
};


/* ---------- Cart / Orders ---------- */
export type CartItem = {
  itemId: string;
  slug: string;
  title: string;
  price: number;
  size?: MerchSize;
  color?: string; // color code
  qty: number;
  image: string;
};

export type OrderItem = CartItem & {
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  orderId: string;
  orderDate: string;
  studentId: string;
  fullName: string;
  status: 'pending'|'confirmed'|'cancelled';
  promptPayQR?: string;
  slipUpload?: string; // url/blob ref
  totalAmount: number;
  items: OrderItem[];
};

/* ---------- Announcements ---------- */
export type Announcement = {
  id: string;          // AnnouncementID
  topic: string;       // Topic
  description: string; // Description
  photoUrl?: string;   // PhotoURL
  datePosted: string;  // ISO string
  status: Status;
};

/* ---------- Auth ---------- */
export type Role = 'STUDENT' | 'SAU' | 'AUSO';
export type User = { email: string; role: Role };
