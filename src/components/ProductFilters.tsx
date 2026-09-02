import { useMemo, useState } from "react";
import { ageRanges, genders, type AgeRange, type Gender, type Product } from "../config";

export type Filters = {
  gender: Gender | "All";
  age: AgeRange | "All";
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

  return (
    <aside className="glass h-fit space-y-6 rounded-3xl p-5 md:sticky md:top-28">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Gender</p>
        <div className="flex flex-wrap gap-2">
          {(["All", ...genders] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => onChange({ ...filters, gender: g })}
              className={`rounded-full px-4 py-2 text-sm ${
                filters.gender === g ? "bg-gold text-ink" : "border border-[var(--line)]"
              }`}
            >
              {g}
              {g !== "All" ? ` · ${counts[g]}` : ""}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.22em] text-[var(--muted)]">Age / Size</p>
        <div className="flex flex-wrap gap-2">
          {(["All", ...ageRanges] as const).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => onChange({ ...filters, age: a })}
              className={`rounded-full px-4 py-2 text-sm ${
                filters.age === a ? "bg-[var(--accent)] text-white" : "border border-[var(--line)]"
              }`}
            >
              {a}
            </button>
          ))}
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
        if (filters.age !== "All" && p.ageRange !== filters.age) return false;
        return true;
      }),
    [products, filters],
  );
  return { filters, setFilters, filtered };
}
