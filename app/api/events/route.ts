import { NextResponse } from 'next/server';
import { events } from '@/lib/mock';

export async function GET() {
  return NextResponse.json({ items: events() });
}