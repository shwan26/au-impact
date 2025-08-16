import { announcements } from '@/lib/mock';
import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(announcements().filter(a => a.status === 'LIVE'));
}
