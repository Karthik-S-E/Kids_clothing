export const brand = {
  name: "Kandamma",
  tagline: "Luxury Ethnic & Festive Children's Atelier",
  city: "India",
  whatsappNumber: "919912345678",
} as const;

export const social = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "919901200520",
  instagram: import.meta.env.VITE_INSTAGRAM_URL ?? "https://www.instagram.com/kandammakids",
  facebook: import.meta.env.VITE_FACEBOOK_URL ?? "https://www.facebook.com/kandammakids",
} as const;

export const genders = ["Boy", "Girl"] as const;

export const ageRanges = [
  "0-1 Years",
  "1-2 Years",
  "2-3 Years",
  "2-5 Years",
  "3-4 Years",
  "4-5 Years",
  "4-8 Years",
  "5-8 Years",
  "6-9 Years",
  "8-12 Years",
] as const;

export type Gender = (typeof genders)[number];
export type AgeRange = string;

export function normaliseAgeRange(raw?: string): string {
  if (!raw) return "";
  const cleaned = raw.replace(/\s+/g, " ").trim();
  // Catches 4-8, 4y-8y, 4Y - 8Y, 4-8 Years, etc.
  const match = cleaned.match(/(\d+)\s*(?:[yY]|years?|yrs?)?\s*[-–]\s*(\d+)\s*(?:[yY]|years?|yrs?)?/i);
  if (!match) return cleaned;
  const low = Number(match[1]);
  const high = Number(match[2]);
  return `${low}-${high} Years`;
}

export type Product = {
  id: string;
  name: string;
  image: string;
  price: number;
  gender: Gender;
  ageRange: AgeRange;
  description: string;
  sizes: string[];
  stockStatus?: boolean;
  stockQuantity?: number;
  designNo?: string;
  color?: string;
  style?: string;
  occasion?: string;
  colorImages?: Record<string, string>;
  meeshoUrl?: string;
  flipkartUrl?: string;
};

export type ProductInput = Omit<Product, "id">;

export function isProductInStock(product: Product): boolean {
  return product.stockStatus ?? true;
}

export const initialProducts: Product[] = [
  {
    id: "1",
    name: "Royal Blue Floral Lehenga Set",
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=1200&auto=format&fit=crop",
    price: 1899,
    gender: "Girl",
    ageRange: "2-5 Years",
    description: "Royal blue lehenga set with a floral top, layered skirt, and matching dupatta. Ideal for weddings and festivals.",
    sizes: ["2Y", "3Y", "4Y", "5Y"],
    stockStatus: true,
    stockQuantity: 4,
    meeshoUrl: "https://meesho.com",
    flipkartUrl: "https://flipkart.com",
  },
  {
    id: "2",
    name: "Golden Zari Silk Kurta Set",
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=1200&auto=format&fit=crop",
    price: 1499,
    gender: "Boy",
    ageRange: "1-4 Years",
    description: "Soft silk kurta set with golden zari borders and lightweight cotton lining for all-day comfort.",
    sizes: ["1Y", "2Y", "3Y", "4Y"],
    stockStatus: true,
    stockQuantity: 6,
    meeshoUrl: "https://meesho.com",
    flipkartUrl: "https://flipkart.com",
  },
  {
    id: "3",
    name: "Pastel Pink Party Gown",
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=1200&auto=format&fit=crop",
    price: 2199,
    gender: "Girl",
    ageRange: "4-8 Years",
    description: "Sparkly party gown for girls with a sequin top, soft tulle skirt, and feathered shoulders for a royal look.",
    sizes: ["4Y", "5Y", "6Y", "7Y", "8Y"],
    stockStatus: true,
    stockQuantity: 2,
    meeshoUrl: "https://meesho.com",
    flipkartUrl: "https://flipkart.com",
  },
  {
    id: "4",
    name: "Festive Embroidered Sherwani",
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=1200&auto=format&fit=crop",
    price: 1799,
    gender: "Boy",
    ageRange: "2-5 Years",
    description: "Classic embroidered sherwani paired with soft churidar pants. Tailored for celebratory occasions.",
    sizes: ["2Y", "3Y", "4Y", "5Y"],
    stockStatus: true,
    stockQuantity: 5,
    meeshoUrl: "https://meesho.com",
    flipkartUrl: "https://flipkart.com",
  },
];