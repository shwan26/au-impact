// lib/cart.ts
import type { CartItem } from '@/types/db';

const KEY = 'au-impact:cart:v1';

function read(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}
function write(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function getCart() { return read(); }

export function addToCart(item: CartItem) {
  const items = read();
  const idx = items.findIndex(
    (i) => i.itemId === item.itemId && i.size === item.size && i.color === item.color
  );
  if (idx >= 0) items[idx].qty += item.qty;
  else items.push(item);
  write(items);
  return items;
}

export function setQty(item: CartItem, qty: number) {
  const items = read().map(i =>
    i.itemId === item.itemId && i.size === item.size && i.color === item.color
      ? { ...i, qty: Math.max(1, qty) }
      : i
  );
  write(items);
  return items;
}

export function removeFromCart(item: CartItem) {
  const items = read().filter(i =>
    !(i.itemId === item.itemId && i.size === item.size && i.color === item.color)
  );
  write(items);
  return items;
}

export function clearCart() {
  write([]);
  return [];
}

export function subtotal(items = read()) {
  return items.reduce((sum, i) => sum + i.price * i.qty, 0);
}
