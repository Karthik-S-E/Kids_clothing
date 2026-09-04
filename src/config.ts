export const brand = {
  name: "Kandamma Kids",
  tagline: "Little gods. Big vibes.",
  city: "India",
  whatsappNumber: "919901200520",
} as const;

/** Update these to your live brand accounts and WhatsApp business number (country code, no +). */
export const social = {
  whatsappNumber: import.meta.env.VITE_WHATSAPP_NUMBER ?? "919901200520",
  instagram: import.meta.env.VITE_INSTAGRAM_URL ?? "https://www.instagram.com/kandammakids",
  facebook: import.meta.env.VITE_FACEBOOK_URL ?? "https://www.facebook.com/kandammakids",
} as const;

export const genders = ["Boy", "Girl"] as const;
export const ageRanges = ["1-4 Years", "2-5 Years", "4-8 Years", "5-8 Years"];

export type Gender = (typeof genders)[number];
export type AgeRange = string;

/**
 * Normalise free-text age ranges so "4-8", "4Y-8Y" and "4-8 Years"
 * all map to the same canonical bucket. Used on read so existing
 * Firestore docs need no migration.
 */
export function normaliseAgeRange(raw: string): string {
  const cleaned = raw.replace(/\s+/g, " ").trim();
  const match = cleaned.match(/(\d+)\s*[-–]\s*(\d+)/);
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