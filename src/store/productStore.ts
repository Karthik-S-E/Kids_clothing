import { create } from "zustand";
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product, ProductInput } from "../config";

type ProductState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  hydrate: () => void;
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
    
    onSnapshot(q, 
      (snapshot) => {
        const products: Product[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        
        set({ products, loading: false });
      },
      (error) => {
        set({ error: error.message, loading: false });
      }
    );
  },
  
  addProduct: async (input) => {
    await addDoc(collection(db, "products"), input);
  },
  
  updateProduct: async (id, input) => {
    const docRef = doc(db, "products", id);
    await updateDoc(docRef, input);
  },
  
  deleteProduct: async (id) => {
    const docRef = doc(db, "products", id);
    await deleteDoc(docRef);
  }
}));