import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../config";

export type CartItem = {
  product: Product;
  size: string;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product, size: string) => void;
  removeItem: (productId: string, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, size) => {
        const existingItem = get().items.find(
          (item) => item.product.id === product.id && item.size === size
        );
        if (existingItem) {
          set({
            items: get().items.map((item) =>
              item.product.id === product.id && item.size === size
                ? { ...item, quantity: item.quantity + 1 }
                : item
            ),
          });
        } else {
          set({ items: [...get().items, { product, size, quantity: 1 }] });
        }
      },
      removeItem: (productId, size) => {
        set({
          items: get().items.filter(
            (item) => !(item.product.id === productId && item.size === size)
          ),
        });
      },
      updateQuantity: (productId, size, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId, size);
        } else {
          set({
            items: get().items.map((item) =>
              item.product.id === productId && item.size === size
                ? { ...item, quantity }
                : item
            ),
          });
        }
      },
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => {
        return get().items.reduce(
          (total, item) => total + item.product.price * item.quantity,
          0
        );
      },
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },
    }),
    {
      name: "kandamma.cart",
    }
  )
);