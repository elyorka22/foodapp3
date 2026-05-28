import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type CartItem = { productId: string; name: string; price: number; quantity: number; restaurantId: string };

type CartState = {
  restaurantId: string | null;
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
  total: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      restaurantId: null,
      items: [],
      addItem: (item, qty = 1) => {
        const state = get();
        if (state.restaurantId && state.restaurantId !== item.restaurantId) {
          set({ restaurantId: item.restaurantId, items: [{ ...item, quantity: qty }] });
          return;
        }
        const existing = state.items.find((i) => i.productId === item.productId);
        if (existing) {
          set({
            items: state.items.map((i) =>
              i.productId === item.productId ? { ...i, quantity: i.quantity + qty } : i,
            ),
          });
        } else {
          set({ restaurantId: item.restaurantId, items: [...state.items, { ...item, quantity: qty }] });
        }
      },
      removeItem: (productId) => {
        const items = get().items.filter((i) => i.productId !== productId);
        set({ items, restaurantId: items.length ? get().restaurantId : null });
      },
      clear: () => set({ items: [], restaurantId: null }),
      total: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
    }),
    { name: 'food-cart' },
  ),
);
