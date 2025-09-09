import { NextResponse } from 'next/server';
import { merches as merchandiseMock } from '@/lib/mock';

export async function GET() {
  // Expose your mock "merches" via the /api/merchandise endpoint
  return NextResponse.json({ items: merchandiseMock });
}
