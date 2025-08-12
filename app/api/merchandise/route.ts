import { NextResponse } from 'next/server';
import { products } from '@/lib/mock';

export async function GET() {
  return NextResponse.json({ items: products() });
}