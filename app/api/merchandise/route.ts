import { NextResponse } from 'next/server';
import { merches } from '@/lib/mock';

export async function GET() {
  return NextResponse.json({ items: merches });
}