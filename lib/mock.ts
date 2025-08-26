// lib/mock.ts
import { Announcement, Event, Fundraising, Product } from '@/types/db';

/* ----------------------------- Events (mock) ----------------------------- */

export function events(): Event[] {
  return [
    {
      id: '1',
      title: 'Beach Cleanup',
      date: new Date().toISOString(),
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      summary: 'Join us!',
      description: 'Bring water and hats.',
      status: 'LIVE',
      priceType: 'free',
      openStaffSlots: 2,
      openParticipantSlots: 25,
      imageUrl:
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1600&auto=format&fit=crop',
      // optional counts for detail page (use if you want non-zero)
      registeredStaff: 20,
      registeredParticipants: 50,
    },
    {
      id: '2',
      title: 'Tree Planting',
      date: new Date(Date.now() + 86_400_000).toISOString(),
      startDate: new Date(Date.now() + 86_400_000).toISOString(),
      endDate: new Date(Date.now() + 86_400_000).toISOString(),
      summary: 'Greener campus',
      description: 'Meet at gate 3.',
      status: 'LIVE',
      priceType: 'paid',
      openStaffSlots: 0,
      openParticipantSlots: 30,
      imageUrl:
        'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1600&auto=format&fit=crop',
      registeredStaff: 0,
      registeredParticipants: 0,
    },
  ];
}

export function getEventById(id: string) {
  return events().find((e) => e.id === id);
}

/* -------------------------- Fundraising (mock) --------------------------- */

export function fundraising(): Fundraising[] {
  return [
{
  id: 'flood-2025',
  title: 'Northern Thailand Flood Relief',
  goal: 10_000,
  currentDonation: 1_000,
  summary: 'Emergency relief for Northern provinces affected by flooding.',
  description:
    '🌊 Northern Thailand Flood Relief Fund\n' +
    'Devastating floods have displaced families and damaged homes. Your contribution can help provide emergency supplies, food, clean water, and shelter.\n' +
    '🕊️ Donate now to bring hope and support to those in need.\n' +
    "📌 Every baht counts. Let's stand together.",
  status: 'LIVE',
  imageUrl: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/fundraising%2C-flood-relief-camp-flyer-design-template-bb9f9e5f066ea36add3f193791be9810_screen.jpg?ts=1698454654',
  organizerName: 'Thanakrit Siriwat',
  contactLine: 'thanakrit89',
  startDate: '2024-06-01T00:00:00Z',
  endDate:   '2024-06-30T00:00:00Z',
  location: 'CL building , 13th floor',
  donationLink: 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/fundraising%2C-flood-relief-camp-flyer-design-template-bb9f9e5f066ea36add3f193791be9810_screen.jpg?ts=1698454654', 
},
    {
  id: 'au-debate-2025',
  title: 'AU Debate Society — Asian BP Championship Travel',
  goal: 120_000,
  currentDonation: 27_500,
  summary: 'Help AUDS send two teams to the Asian BP Championship.',
  description:
    '🗣️ AU Debate Society Travel Fund\n' +
    'We’re sending two teams and an adjudicator to the Asian BP Championship. Your support covers flights, registration, accommodation, and training materials.\n' +
    '🏆 Help our debaters represent Assumption University on the regional stage.\n' +
    "📌 Every baht helps our students compete and grow.",
  status: 'LIVE',
  imageUrl: 'https://marketplace.canva.com/EAGkeWFglgo/1/0/1131w/canva-cream-illustrated-debate-competition-poster-_QJGWXw9gDc.jpg',
  organizerName: 'AU Debate Society (AUDS)',
  contactLine: 'audebate',
  startDate: '2025-07-01T00:00:00Z',
  endDate:   '2025-08-15T00:00:00Z',
  location: 'CL building, 1st floor booth',
  donationLink: 'https://marketplace.canva.com/EAGkeWFglgo/1/0/1131w/canva-cream-illustrated-debate-competition-poster-_QJGWXw9gDc.jpg'
},
{
  id: 'au-robotics-2025',
  title: 'AU Robotics Club — RoboCup Thailand Build & Travel',
  goal: 90_000,
  currentDonation: 15_000,
  summary: 'Parts and travel support for our RoboCup team.',
  description:
    '🤖 AU Robotics Build & Travel Fund\n' +
    'We’re building and testing our robots for RoboCup Thailand. Funds go toward sensors, motors, microcontrollers, batteries, 3D-printed parts, and team travel.\n' +
    '🔧 Power our engineering journey from lab to competition.\n' +
    "📌 Every baht keeps the bots rolling.",
  status: 'LIVE',
  imageUrl: 'https://d1ldvf68ux039x.cloudfront.net/thumbs/photos/2012/6438861/1000w_q95.jpg',
  organizerName: 'AU Robotics Club',
  contactLine: 'aurobotics',
  startDate: '2025-07-10T00:00:00Z',
  endDate:   '2025-09-01T00:00:00Z',
  location: 'E building, Robotics Lab',
  donationLink: 'https://d1ldvf68ux039x.cloudfront.net/thumbs/photos/2012/6438861/1000w_q95.jpg'
}


  ];
}

export function getFundraisingById(id: string) {
  return fundraising().find((e) => e.id === id);
}

/* ---------------------------- Products (mock) ---------------------------- */

export function products(): Product[] {
  return [
    { id: '1', title: 'Club Tee', price: 299, description: '100% cotton', status: 'LIVE' },
    { id: '2', title: 'Sticker Pack', price: 59, description: 'Vinyl stickers', status: 'LIVE' },
  ];
}

export function getProductById(id: string) {
  return products().find((e) => e.id === id);
}

/* ------------------------- Announcements (mock) -------------------------- */

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
      description: 'E-cigarettes are illegal in Thailand—keep our campus safe.',
      photoUrl: '/images/announcements/image.png',
      datePosted: '2025-03-30T02:00:00Z',
      status: 'LIVE',
    },
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
