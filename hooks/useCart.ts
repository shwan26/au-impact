// hooks/useCart.ts
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { CartItem } from '@/types/db';
import * as cart from '@/lib/cart';

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => { setItems(cart.getCart()); }, []);

  const add = useCallback((i: CartItem) => setItems(cart.addToCart(i)), []);
  const setQuantity = useCallback((i: CartItem, q: number) => setItems(cart.setQty(i, q)), []);
  const remove = useCallback((i: CartItem) => setItems(cart.removeFromCart(i)), []);
  const clear = useCallback(() => setItems(cart.clearCart()), []);

  const total = cart.subtotal(items);

  return { items, add, setQuantity, remove, clear, total };
}
