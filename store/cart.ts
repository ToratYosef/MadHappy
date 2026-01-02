import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  size: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string, size: string) => void;
  updateQty: (id: string, size: string, qty: number) => void;
  clearCart: () => void;
};

const mergeItem = (items: CartItem[], incoming: CartItem): CartItem[] => {
  const existingIndex = items.findIndex(
    (item) => item.id === incoming.id && item.size === incoming.size
  );
  if (existingIndex >= 0) {
    const updated = [...items];
    updated[existingIndex] = {
      ...items[existingIndex],
      qty: items[existingIndex].qty + incoming.qty
    };
    return updated;
  }
  return [...items, incoming];
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: mergeItem(state.items, item)
        })),
      removeItem: (id, size) =>
        set((state) => ({
          items: state.items.filter(
            (existing) => !(existing.id === id && existing.size === size)
          )
        })),
      updateQty: (id, size, qty) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id && item.size === size ? { ...item, qty } : item
          )
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: "lkh-cart",
      storage: createJSONStorage(() => localStorage)
    }
  )
);

export const mapProductToCartItem = (
  product: Product,
  size: string,
  qty: number
): CartItem => ({
  id: product.id,
  slug: product.slug,
  name: product.name,
  price: product.price,
  image: product.images[0],
  size,
  qty
});

export const cartSubtotal = (items: CartItem[]): number =>
  items.reduce((total, item) => total + item.price * item.qty, 0);
