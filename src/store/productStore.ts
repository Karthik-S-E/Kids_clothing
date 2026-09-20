import { create } from "zustand";
import { collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query } from "firebase/firestore";
import { db } from "../lib/firebase";
import type { Product, ProductInput } from "../config";

// Demo products for fallback when Firebase is empty
const DEMO_PRODUCTS: Product[] = [
  {
    id: "demo-1",
    name: "Royal Blue Floral Lehenga Set",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1200&auto=format&fit=crop"],
    price: 1899,
    discountPercent: 25,
    gender: "Girl",
    ageRange: "2-5 Years",
    description: "Royal blue lehenga set with a floral top, layered skirt, and matching dupatta. Ideal for weddings and festivals.",
    sizes: ["2Y", "3Y", "4Y", "5Y"],
    stockStatus: true,
    stockQuantity: 4,
  },
  {
    id: "demo-2",
    name: "Golden Zari Silk Kurta Set",
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=1200&auto=format&fit=crop"],
    price: 1499,
    discountPercent: 15,
    gender: "Boy",
    ageRange: "1-4 Years",
    description: "Soft silk kurta set with golden zari borders and lightweight cotton lining for all-day comfort.",
    sizes: ["1Y", "2Y", "3Y", "4Y"],
    stockStatus: true,
    stockQuantity: 6,
  },
  {
    id: "demo-3",
    name: "Pastel Pink Party Gown",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1200&auto=format&fit=crop"],
    price: 2199,
    discountPercent: 30,
    gender: "Girl",
    ageRange: "4-8 Years",
    description: "Sparkly party gown for girls with a sequin top, soft tulle skirt, and feathered shoulders for a royal look.",
    sizes: ["4Y", "5Y", "6Y", "7Y", "8Y"],
    stockStatus: true,
    stockQuantity: 2,
  },
  {
    id: "demo-4",
    name: "Festive Embroidered Sherwani",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop"],
    price: 1799,
    discountPercent: 20,
    gender: "Boy",
    ageRange: "2-5 Years",
    description: "Classic embroidered sherwani paired with soft churidar pants. Tailored for celebratory occasions.",
    sizes: ["2Y", "3Y", "4Y", "5Y"],
    stockStatus: true,
    stockQuantity: 5,
  },
  {
    id: "demo-5",
    name: "Cream Silk Anarkali Suit",
    image: "https://images.unsplash.com/photo-1617331140180-e8262094733a?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1617331140180-e8262094733a?q=80&w=1200&auto=format&fit=crop"],
    price: 1599,
    discountPercent: 10,
    gender: "Girl",
    ageRange: "3-6 Years",
    description: "Elegant cream Anarkali suit with golden embroidery and comfortable silk fabric.",
    sizes: ["3Y", "4Y", "5Y", "6Y"],
    stockStatus: true,
    stockQuantity: 3,
  },
  {
    id: "demo-6",
    name: "Navy Blue Jodhpuri Suit",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?q=80&w=1200&auto=format&fit=crop"],
    price: 1699,
    discountPercent: 18,
    gender: "Boy",
    ageRange: "4-7 Years",
    description: "Stylish navy blue Jodhpuri suit with contrast piping and premium fabric.",
    sizes: ["4Y", "5Y", "6Y", "7Y"],
    stockStatus: true,
    stockQuantity: 4,
  },
  {
    id: "demo-7",
    name: "Pink Floral Frock",
    image: "https://images.unsplash.com/photo-1519669556878-63bd08be7770?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1519669556878-63bd08be7770?q=80&w=1200&auto=format&fit=crop"],
    price: 1299,
    discountPercent: 22,
    gender: "Girl",
    ageRange: "2-4 Years",
    description: "Beautiful pink floral frock with comfortable cotton lining and cute ruffles.",
    sizes: ["2Y", "3Y", "4Y"],
    stockStatus: true,
    stockQuantity: 5,
  },
  {
    id: "demo-8",
    name: "Beige Ethnic Kurta",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1200&auto=format&fit=crop"],
    price: 1399,
    discountPercent: 12,
    gender: "Boy",
    ageRange: "3-5 Years",
    description: "Classic beige ethnic kurta with subtle embroidery and comfortable fit.",
    sizes: ["3Y", "4Y", "5Y"],
    stockStatus: true,
    stockQuantity: 6,
  },
];

type ProductState = {
  products: Product[];
  loading: boolean;
  error: string | null;
  hydrate: () => void;
  addProduct: (input: ProductInput) => Promise<void>;
  updateProduct: (id: string, input: Partial<ProductInput>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
};

let unsubscribe: (() => void) | null = null;

export const useProductStore = create<ProductState>((set) => ({
  products: DEMO_PRODUCTS, // Start with demo products
  loading: false,
  error: null,
  
  hydrate: () => {
    if (unsubscribe) return;

    set({ loading: true, error: null });
    const q = query(collection(db, "products"));
    
    unsubscribe = onSnapshot(
      q, 
      (snapshot) => {
        const products: Product[] = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        })) as Product[];
        
        // If Firebase has products, use them; otherwise keep demo products
        if (products.length > 0) {
          set({ products, loading: false });
        } else {
          set({ products: DEMO_PRODUCTS, loading: false });
        }
      },
      (error) => {
        console.error("Firebase error, using demo products:", error);
        set({ products: DEMO_PRODUCTS, loading: false, error: error.message });
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