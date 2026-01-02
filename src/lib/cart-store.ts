'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type CartItem = {
  productId: string;
  variantId: string;
  name: string;
  slug: string;
  priceCents: number;
  imageUrl?: string;
  size?: string;
  qty: number;
};

type CartStore = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQty: (variantId: string, qty: number) => void;
  clear: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const existing = get().items.find((i) => i.variantId === item.variantId);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.variantId === item.variantId ? { ...i, qty: Math.min(99, i.qty + item.qty) } : i
            )
          });
        } else {
          set({ items: [...get().items, item] });
        }
      },
      removeItem: (variantId) => set({ items: get().items.filter((i) => i.variantId !== variantId) }),
      updateQty: (variantId, qty) =>
        set({
          items: get().items.map((i) => (i.variantId === variantId ? { ...i, qty: Math.max(1, qty) } : i))
        }),
      clear: () => set({ items: [] })
    }),
    {
      name: 'lkh-cart',
      storage: createJSONStorage(() => localStorage)
    }
  )
);
