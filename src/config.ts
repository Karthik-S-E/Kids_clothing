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

export type Gender = (typeof genders)[number];
export type AgeRange = string;

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