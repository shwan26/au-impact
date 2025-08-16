import { Announcement, Event, Fundraising, Product } from '@/types/db';

export function events(): Event[] {
  return [
    {
      id: '1',
      title: 'Beach Cleanup',
      date: new Date().toISOString(),
      summary: 'Join us!',
      description: 'Bring water and hats.',
      status: 'LIVE',
    },
    {
      id: '2',
      title: 'Tree Planting',
      date: new Date(Date.now() + 86400000).toISOString(),
      summary: 'Greener campus',
      description: 'Meet at gate 3.',
      status: 'LIVE',
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
      status: 'LIVE',
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
      status: 'LIVE',
    },
    {
      id: '2',
      title: 'Sticker Pack',
      price: 59,
      description: 'Vinyl stickers',
      status: 'LIVE',
    },
  ];
}
export function getProductById(id: string) {
  return products().find((e) => e.id === id);
}

export function announcements(): Announcement[] {
  return [
    {
      id: 'A-001',
      topic: 'AU Traffic Law Enforcement',
      description: 'Drivers must have a license, helmets for riders, seat belts…',
      photoUrl: '/images/announcements/image.png',
      datePosted: '2025-04-09T09:00:00Z',
      status: 'LIVE',
    },
    {
      id: 'A-002',
      topic: 'Songkran Festival Invitation',
      description: 'Join the Songkran activities and cultural shows.',
      photoUrl: '/images/announcements/image.png',
      datePosted: '2025-04-09T03:00:00Z',
      status: 'COMPLETE',
    },
    {
      id: 'A-003',
      topic: 'No Vaping Policy Reminder',
      description: 'E‑cigarettes are illegal in Thailand—keep our campus safe.',
      photoUrl: '/images/announcements/image.png',
      datePosted: '2025-03-30T02:00:00Z',
      status: 'LIVE',
    },
    // add more seed items
    { id: 'A-004', topic: 'Earthquake Safety Tips', description: 'Drop, Cover, Hold on…', datePosted: '2025-03-25T02:00:00Z', status: 'LIVE', photoUrl: '/images/announcements/image.png' },
    { id: 'A-005', topic: 'Library Exam Hours', description: 'Open 7:00–24:00 during finals.', datePosted: '2025-05-01T02:00:00Z', status: 'LIVE', photoUrl: '/images/announcements/image.png' },
    { id: 'A-006', topic: 'Blood Donation Day', description: 'Register by Friday.', datePosted: '2025-04-20T02:00:00Z', status: 'COMPLETE', photoUrl: '/images/announcements/image.png' },
    { id: 'A-007', topic: 'Parking Lot Maintenance', description: 'Zone C closed this weekend.', datePosted: '2025-04-22T02:00:00Z', status: 'LIVE', photoUrl: '/images/announcements/image.png' },
    { id: 'A-008', topic: 'Career Fair', description: '200+ companies on campus.', datePosted: '2025-05-15T02:00:00Z', status: 'LIVE', photoUrl: '/images/announcements/image.png' },
    { id: 'A-009', topic: 'Wellness Workshop', description: 'Mindfulness for exam stress.', datePosted: '2025-04-28T02:00:00Z', status: 'LIVE', photoUrl: '/images/announcements/image.png' },
  ];
}

export function getAnnouncementById(id: string) {
  return announcements().find((e) => e.id === id);
}
