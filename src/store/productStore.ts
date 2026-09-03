import { create } from "zustand";
import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product, ProductInput } from "../config";
import { normalizeAgeRange } from "../lib/ageRange";

type ProductState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  /** Starts the realtime subscription and returns its unsubscribe function. */
  hydrate: () => () => void;
  addProduct: (input: ProductInput) => Promise<void>;
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  loading: false,
  error: null,

  hydrate: () => {
    set({ loading: true, error: null });
    const q = query(collection(db, "products"));

    return onSnapshot(
      q,
      (snapshot) => {
        const products: Product[] = snapshot.docs.map((d) => {
          const data = d.data() as Omit<Product, "id">;
          return {
            ...data,
            id: d.id,
            // Legacy documents stored free-text ages ("4-8", "4Y-8Y"). Normalise on
            // read so filtering and grouping see one canonical label.
            ageRange: normalizeAgeRange(data.ageRange),
            sizes: Array.isArray(data.sizes) ? data.sizes : [],
          };
        });

        set({ products, loading: false });
      },
      (error) => {
        set({ error: error.message, loading: false });
      },
    );
  },

  addProduct: async (input) => {
    await addDoc(collection(db, "products"), {
      ...input,
      ageRange: normalizeAgeRange(input.ageRange),
    });
  },

  updateProduct: async (id, input) => {
    const payload =
      input.ageRange !== undefined
        ? { ...input, ageRange: normalizeAgeRange(input.ageRange) }
        : input;
    await updateDoc(doc(db, "products", id), payload);
  },

  deleteProduct: async (id) => {
    await deleteDoc(doc(db, "products", id));
  },
}));
