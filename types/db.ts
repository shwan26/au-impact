export type ID = string;

export type Event = { 
    id: ID; 
    title: string; 
    date: string; 
    summary: string; 
    description: string; 
    status: Status };

export type Fundraising = { 
    id: ID; 
    title: string; 
    goal: number; 
    summary: string; 
    description: string; 
    status: Status };

export type Product = { 
    id: ID; 
    title: string; 
    price: number; 
    description: string; 
    status: Status };

export type Status = 'PENDING' | 'LIVE' | 'COMPLETE';

export type Announcement = {
  id: string;            // AnnouncementID
  topic: string;         // Topic
  description: string;   // Description
  photoUrl?: string;     // PhotoURL
  datePosted: string;    // ISO string
  status: Status;
};

export type Role = 'STUDENT' | 'SAU' | 'AUSO';
export type User = { email: string; role: Role };