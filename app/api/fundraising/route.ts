import { NextResponse } from 'next/server';
import { fundraising } from '@/lib/mock';

export async function GET() {
  return NextResponse.json({ items: fundraising() });
}