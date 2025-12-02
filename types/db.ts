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
  itemId: string;
  slug: string;
  title: string;
  description?: string;
  price: number;
  status: string;
  availableSizes: string[];
  availableColors: Array<{ label: string; photoUrl?: string | null }>;
  pickupPoint?: string;
  pickupDate?: string;
  pickupTime?: string;
  contactName?: string;
  contactLineId?: string;
  images: {
    poster: { alt: string; url: string };
    frontView?: { alt: string; url: string };
    backView?: { alt: string; url: string };
    sizeChart?: { alt: string; url: string };
    misc: Array<{ alt: string; url: string }>;
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
