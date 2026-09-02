import { motion } from "framer-motion";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters, useProductFilters } from "../components/ProductFilters";
import { useProductStore } from "../store/productStore";

export function ShopPage() {
  const products = useProductStore((s) => s.products);
  const { filters, setFilters, filtered } = useProductFilters(products);

  return (
    <motion.section 
      className="mx-auto max-w-6xl px-6 py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
    >
      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <p className="text-[11px] uppercase tracking-[0.32em] text-gold">Catalogue</p>
        <h1 className="font-display text-5xl">Shop the closet</h1>
        <p className="mt-2 text-[var(--muted)]">Filter by gender and age. Every price is in Indian Rupees (₹).</p>
      </motion.div>
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <ProductFilters products={products} filters={filters} onChange={setFilters} />
        <div>
          {filtered.length === 0 ? (
            <p className="glass rounded-3xl p-10 text-center text-[var(--muted)]">No pieces in this filter yet.</p>
          ) : (
            <motion.div 
              className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
