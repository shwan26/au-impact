import { Announcement, Event, Fundraising, Product } from '@/types/db';

export function events(): Event[] {
  return [
    {
      id: '1',
      title: 'Beach Cleanup',
      date: new Date().toISOString(),
      summary: 'Join us!',
      description: 'Bring water and hats.',
      status: 'PUBLISHED',
    },
    {
      id: '2',
      title: 'Tree Planting',
      date: new Date(Date.now() + 86400000).toISOString(),
      summary: 'Greener campus',
      description: 'Meet at gate 3.',
      status: 'PUBLISHED',
    },
  ];
}
export function getEventById(id: string) {
  return events().find((e) => e.id === id);
}

export function fundraising(): Fundraising[] {
  return [
    {
      id: '1',
      title: 'Library Upgrade',
      goal: 10000,
      summary: 'Better study spaces',
      description: 'New chairs & desks',
      status: 'PUBLISHED',
    },
  ];
}
export function getFundraisingById(id: string) {
  return fundraising().find((e) => e.id === id);
}

export function products(): Product[] {
  return [
    {
      id: '1',
      title: 'Club Tee',
      price: 299,
      description: '100% cotton',
      status: 'PUBLISHED',
    },
    {
      id: '2',
      title: 'Sticker Pack',
      price: 59,
      description: 'Vinyl stickers',
      status: 'PUBLISHED',
    },
  ];
}
export function getProductById(id: string) {
  return products().find((e) => e.id === id);
}

export function announcements(): Announcement[] {
  return [
    {
      id: '1',
      title: 'Welcome Week',
      body: 'Waiting the fair!',
      createdAt: new Date().toISOString(),
      status: 'PUBLISHED',
    },
  ];
}
export function getAnnouncementById(id: string) {
  return announcements().find((e) => e.id === id);
}
