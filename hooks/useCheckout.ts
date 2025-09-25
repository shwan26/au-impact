// hooks/useCheckout.ts
'use client';

import { create } from 'zustand';
import type { CartItem } from '@/types/db';

// A stable key for cart lines
export const lineKey = (i: CartItem) => `${i.itemId}-${i.size}-${i.color}`;

type State = {
  /** Preferred: multi-select checkout */
  items: CartItem[];
  setItems: (items: CartItem[]) => void;
  updateQty: (item: CartItem, qty: number) => void;
  remove: (item: CartItem) => void;
  clear: () => void;

  /** Back-compat: single Buy-Now */
  item: CartItem | null;
  setItem: (i: CartItem) => void;
};

export const useCheckout = create<State>((set, get) => ({
  // Multi-select state
  items: [],
  setItems: (items) => set({ items, item: items[0] ?? null }),

  updateQty: (item, qty) =>
    set((s) => ({
      items: s.items.map((it) =>
        lineKey(it) === lineKey(item) ? { ...it, qty: Math.max(1, qty) } : it
      ),
      item:
        s.item && lineKey(s.item) === lineKey(item)
          ? { ...s.item, qty: Math.max(1, qty) }
          : s.item,
    })),

  remove: (item) =>
    set((s) => {
      const next = s.items.filter((it) => lineKey(it) !== lineKey(item));
      const nextSingle =
        s.item && lineKey(s.item) === lineKey(item) ? null : s.item;
      return { items: next, item: nextSingle };
    }),

  clear: () => set({ items: [], item: null }),

  // Single buy-now (back-compat)
  item: null,
  setItem: (i) => set({ item: i, items: [i] }),
}));
