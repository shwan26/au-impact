// app/api/orders/route.ts
import { NextResponse } from 'next/server';

type OrderItem = {
  itemId: string;
  size?: string;
  color?: string;
  qty: number;
  price: number;
};

type Order = {
  id: string;
  items: OrderItem[];
  total: number;
  createdAt: string;
};

// In-memory store for demo/mock purposes
const __orders: Order[] = [];

export async function GET() {
  return NextResponse.json(__orders);
}

export async function POST(req: Request) {
  const body = await req.json();

  // Minimal validation (adjust as needed)
  if (!Array.isArray(body?.items) || typeof body?.total !== 'number') {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  const order: Order = {
    id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    items: body.items,
    total: body.total,
    createdAt: new Date().toISOString(),
  };

  __orders.push(order);
  return NextResponse.json(order, { status: 201 });
}
