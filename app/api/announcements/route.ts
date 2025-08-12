import { NextResponse } from 'next/server';
import { announcements } from '@/lib/mock';

export async function GET() {
  return NextResponse.json({ items: announcements() });
}
