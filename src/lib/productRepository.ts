import type { Product, ProductInput } from "../config";

export interface ProductRepository {
  list(): Promise<Product[]>;
  create(input: ProductInput): Promise<Product>;
  update(id: string, input: Partial<ProductInput>): Promise<Product>;
  remove(id: string): Promise<void>;
}

const STORAGE_KEY = "kandamma.products.v1";

function readStore(): Product[] | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const products = JSON.parse(raw) as Product[];
    // Migration: Ensure all products have stockStatus field
    return products.map((p) => ({
      ...p,
      stockStatus: p.stockStatus ?? true,
      meeshoUrl: p.meeshoUrl ?? undefined,
      flipkartUrl: p.flipkartUrl ?? undefined,
    }));
  } catch {
    return null;
  }
}

function writeStore(products: Product[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

/** Local-first repository. Swap to HttpProductRepository when a REST API is ready. */
export class LocalProductRepository implements ProductRepository {
  constructor(private seed: Product[]) {}

  async list(): Promise<Product[]> {
    const stored = readStore();
    if (!stored) {
      writeStore(this.seed);
      return [...this.seed];
    }
    return stored;
  }

  async create(input: ProductInput): Promise<Product> {
    const products = (await this.list()) ?? [];
    const product: Product = { ...input, id: crypto.randomUUID() };
    writeStore([product, ...products]);
    return product;
  }

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const products = await this.list();
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Product not found");
    const next = { ...products[idx], ...input };
    products[idx] = next;
    writeStore(products);
    return next;
  }

  async remove(id: string): Promise<void> {
    const products = await this.list();
    writeStore(products.filter((p) => p.id !== id));
  }
}

/**
 * REST adapter for Node.js / Spring Boot / Firebase / Supabase.
 * Set VITE_API_URL (e.g. https://api.kandammakids.in) to activate.
 */
export class HttpProductRepository implements ProductRepository {
  constructor(private baseUrl: string) {}

  private url(path = "") {
    return `${this.baseUrl.replace(/\/$/, "")}/products${path}`;
  }

  async list(): Promise<Product[]> {
    const res = await fetch(this.url());
    if (!res.ok) throw new Error("Failed to load products");
    return res.json();
  }

  async create(input: ProductInput): Promise<Product> {
    const res = await fetch(this.url(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to create product");
    return res.json();
  }

  async update(id: string, input: Partial<ProductInput>): Promise<Product> {
    const res = await fetch(this.url(`/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) throw new Error("Failed to update product");
    return res.json();
  }

  async remove(id: string): Promise<void> {
    const res = await fetch(this.url(`/${id}`), { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete product");
  }
}

export function createProductRepository(seed: Product[]): ProductRepository {
  const api = import.meta.env.VITE_API_URL;
  if (api) return new HttpProductRepository(api);
  return new LocalProductRepository(seed);
}
