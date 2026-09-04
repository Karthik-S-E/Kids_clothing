import { useMemo, useState } from "react";
import { genders, normaliseAgeRange, type Gender, type Product } from "../config";

export type Filters = {
  gender: Gender | "All";
  age: string;
};

export function ProductFilters({
  products,
  filters,
  onChange,
}: {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
}) {
  const counts = useMemo(() => {
    return {
      Boy: products.filter((p) => p.gender === "Boy").length,
      Girl: products.filter((p) => p.gender === "Girl").length,
    };
  }, [products]);

  const availableAgeRanges = useMemo(() => {
    const map = new Map<string, string>(); // normalised → original label
    products.forEach((p) => {
      if (p.ageRange && p.ageRange.trim()) {
        const norm = normaliseAgeRange(p.ageRange);
        if (!map.has(norm)) map.set(norm, norm);
      }
    });
    // Sort numerically by the low end of the range
    return Array.from(map.values()).sort((a, b) => {
      const aNum = parseInt(a, 10) || 0;
      const bNum = parseInt(b, 10) || 0;
      return aNum - bNum;
    });
  }, [products]);

  const hasActiveFilters = filters.gender !== "All" || filters.age !== "All";

  return (
    <aside className="glass h-fit rounded-2xl p-4 md:sticky md:top-24 border border-[var(--line)] space-y-4">
      <div className="flex items-center justify-between border-b border-[var(--line)]/60 pb-2.5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--muted)]">
          Filter Pieces
        </span>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={() => onChange({ gender: "All", age: "All" })}
            className="text-[10px] text-gold hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Gender chips */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-medium">
          Gender
        </span>
        <div className="flex flex-wrap gap-1.5">
          {(["All", ...genders] as const).map((g) => {
            const active = filters.gender === g;
            return (
              <button
                key={g}
                type="button"
                onClick={() => onChange({ ...filters, gender: g })}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  active
                    ? "bg-gold font-bold text-ink shadow-sm"
                    : "border border-[var(--line)] text-[var(--text)] hover:border-gold/60"
                }`}
              >
                {g}
                {g !== "All" ? ` (${counts[g]})` : ""}
              </button>
            );
          })}
        </div>
      </div>

      {/* Age / Size Range chips */}
      <div>
        <span className="text-[10px] uppercase tracking-wider text-[var(--muted)] block mb-1.5 font-medium">
          Age / Size
        </span>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onChange({ ...filters, age: "All" })}
            className={`rounded-full px-3 py-1 text-xs transition-all ${
              filters.age === "All"
                ? "bg-[var(--accent)] font-bold text-white shadow-sm"
                : "border border-[var(--line)] text-[var(--text)] hover:border-gold/60"
            }`}
          >
            All
          </button>

          {availableAgeRanges.map((a) => {
            const active = filters.age === a;
            return (
              <button
                key={a}
                type="button"
                onClick={() => onChange({ ...filters, age: a })}
                className={`rounded-full px-3 py-1 text-xs transition-all ${
                  active
                    ? "bg-[var(--accent)] font-bold text-white shadow-sm"
                    : "border border-[var(--line)] text-[var(--text)] hover:border-gold/60"
                }`}
              >
                {a}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}

export function useProductFilters(products: Product[]) {
  const [filters, setFilters] = useState<Filters>({ gender: "All", age: "All" });
  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (filters.gender !== "All" && p.gender !== filters.gender) return false;
        if (filters.age !== "All" && normaliseAgeRange(p.ageRange) !== filters.age) return false;
        return true;
      }),
    [products, filters],
  );

  return { filters, setFilters, filtered };
}