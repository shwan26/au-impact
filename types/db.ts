// types/db.ts
export type ID = string;

export type Status = 'PENDING' | 'LIVE' | 'COMPLETE';

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

export type Fundraising = {
  [x: string]: any;
  id: ID;
  title: string;
  goal: number;
  summary: string;
  description: string;
  status: Status;
  currentDonation?: number;
  imageUrl?: string;
};

export type Product = {
  id: ID;
  title: string;
  price: number;
  description: string;
  status: Status;
};

export type Announcement = {
  id: string;          // AnnouncementID
  topic: string;       // Topic
  description: string; // Description
  photoUrl?: string;   // PhotoURL
  datePosted: string;  // ISO string
  status: Status;
};

export type Role = 'STUDENT' | 'SAU' | 'AUSO';
export type User = { email: string; role: Role };
