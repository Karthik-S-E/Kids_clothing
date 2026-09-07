import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters, useProductFilters } from "../components/ProductFilters";
import { ScrollReveal, StaggerReveal } from "../components/ScrollReveal";
import { useProductStore } from "../store/productStore";

export function ShopPage() {
  const products = useProductStore((s) => s.products);
  const { filters, setFilters, filtered } = useProductFilters(products);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() || "";

  const searchFiltered = useMemo(() => {
    if (!query) return filtered;
    return filtered.filter((p) => {
      const fields = [
        p.name,
        p.description,
        p.gender,
        p.ageRange,
        p.color,
        p.style,
        p.occasion,
        p.designNo,
        ...(p.sizes || []),
      ];
      return fields.some((f) => f?.toLowerCase().includes(query));
    });
  }, [filtered, query]);

  return (
    <section className="mx-auto max-w-6xl px-6 py-10">
      <ScrollReveal delay={0} duration={0.6}>
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent-primary)]">Catalogue</p>
          <h1 className="font-display text-5xl">
            {query ? `Search: "${query}"` : "Shop the closet"}
          </h1>
          <p className="mt-2 text-[var(--text-secondary)]">
            {query
              ? `Showing results matching "${query}". Filter by gender and age below.`
              : "Filter by gender and age. Every price is in Indian Rupees (₹)."}
          </p>
        </div>
      </ScrollReveal>
      
      <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
        <ScrollReveal delay={0.1} duration={0.6}>
          <ProductFilters products={products} filters={filters} onChange={setFilters} />
        </ScrollReveal>
        
        <div>
          {searchFiltered.length === 0 ? (
            <ScrollReveal delay={0.2} duration={0.6}>
              <p className="glass rounded-xl p-10 text-center text-[var(--text-secondary)]">
                {query ? `No pieces found matching "${query}".` : "No pieces in this filter yet."}
              </p>
            </ScrollReveal>
          ) : (
            <StaggerReveal staggerDelay={0.1} className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {searchFiltered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </StaggerReveal>
          )}
        </div>
      </div>
    </section>
  );
}
