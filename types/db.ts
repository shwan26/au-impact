export type ID = string;
export type Status = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export type Event = { id: ID; title: string; date: string; summary: string; description: string; status: Status };
export type Fundraising = { id: ID; title: string; goal: number; summary: string; description: string; status: Status };
export type Product = { id: ID; title: string; price: number; description: string; status: Status };
export type Announcement = { id: ID; title: string; body: string; createdAt: string; status: Status };
export type Role = 'STUDENT' | 'SAU' | 'AUSO';
export type User = { email: string; role: Role };