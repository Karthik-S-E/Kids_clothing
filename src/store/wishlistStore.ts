import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "../config";

interface WishlistState {
  items: Product[];
  toggleWishlist: (product: Product) => void;
  addItem: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleWishlist: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        set({
          items: exists
            ? get().items.filter((item) => item.id !== product.id)
            : [...get().items, product],
        });
      },
      addItem: (product) => {
        const exists = get().items.some((item) => item.id === product.id);
        if (!exists) {
          set({ items: [...get().items, product] });
        }
      },
      isInWishlist: (productId) => get().items.some((item) => item.id === productId),
    }),
    {
      name: "kandamma.wishlist",
    }
  )
);