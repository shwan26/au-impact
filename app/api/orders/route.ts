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

function isOrderItem(obj: any): obj is OrderItem {
  return (
    typeof obj?.itemId === 'string' &&
    typeof obj?.qty === 'number' &&
    typeof obj?.price === 'number'
  );
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (id) {
    const order = __orders.find((o) => o.id === id);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(order);
  }

  return NextResponse.json(__orders);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  if (
    typeof (body as any)?.total !== 'number' ||
    !Array.isArray((body as any)?.items) ||
    !(body as any).items.every(isOrderItem)
  ) {
    return NextResponse.json({ error: 'Invalid order payload' }, { status: 400 });
  }

  const order: Order = {
    id: globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2),
    items: (body as any).items,
    total: (body as any).total,
    createdAt: new Date().toISOString(),
  };

  __orders.push(order);
  return NextResponse.json(order, { status: 201 });
}
