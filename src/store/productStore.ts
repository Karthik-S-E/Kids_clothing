import { create } from "zustand";
import type { Product, ProductInput } from "../config";
import { seedProducts } from "../data/seedProducts";
import { createProductRepository } from "../lib/productRepository";

const repo = createProductRepository(seedProducts);

type ProductState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  hydrate: () => Promise<void>;
  addProduct: (input: ProductInput) => Promise<Product>;
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

export const useProductStore = create<ProductState>((set, get) => ({
  products: seedProducts,
  loading: false,
  error: null,
  hydrate: async () => {
    set({ loading: true, error: null });
    try {
      const products = await repo.list();
      set({ products, loading: false });
    } catch (e) {
      set({
        error: e instanceof Error ? e.message : "Could not load products",
        loading: false,
      });
    }
  },
  addProduct: async (input) => {
    const product = await repo.create(input);
    set({ products: [product, ...get().products] });
    return product;
  },
  updateProduct: async (id, input) => {
    const updated = await repo.update(id, input);
    set({
      products: get().products.map((p) => (p.id === id ? updated : p)),
    });
  },
  deleteProduct: async (id) => {
    await repo.remove(id);
    set({ products: get().products.filter((p) => p.id !== id) });
  },
}));
