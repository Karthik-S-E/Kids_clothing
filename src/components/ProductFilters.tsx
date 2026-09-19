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
    const map = new Map<string, string>();
    products.forEach((p) => {
      if (p.ageRange && p.ageRange.trim()) {
        const norm = normaliseAgeRange(p.ageRange);
        if (!map.has(norm)) map.set(norm, norm);
      }
    });

    return Array.from(map.values()).sort((a, b) => {
      const aNum = parseInt(a, 10) || 0;
      const bNum = parseInt(b, 10) || 0;
      return aNum - bNum;
    });
  }, [products]);

  const ageCounts = useMemo(() => {
    const map: Record<string, number> = {};
    availableAgeRanges.forEach((age) => {
      map[age] = products.filter(
        (p) => normaliseAgeRange(p.ageRange) === age
      ).length;
    });
    return map;
  }, [products, availableAgeRanges]);

  return (
    <div className="w-full text-[#282c3f] divide-y divide-stone-200">
      {/* 1. GENDER (Myntra-style Pink Radio List) */}
      <div className="py-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#282c3f] mb-3">
          Gender
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 text-xs font-normal text-[#282c3f] cursor-pointer hover:text-black">
            <input
              type="radio"
              name="filter-gender"
              checked={filters.gender === "All"}
              onChange={() => onChange({ ...filters, gender: "All" })}
              className="h-4 w-4 accent-[#ff3f6c] cursor-pointer"
            />
            <span>All</span>
          </label>

          {(genders as readonly Gender[]).map((g) => (
            <label
              key={g}
              className="flex items-center justify-between text-xs font-normal text-[#282c3f] cursor-pointer hover:text-black"
            >
              <div className="flex items-center gap-3">
                <input
                  type="radio"
                  name="filter-gender"
                  checked={filters.gender === g}
                  onChange={() => onChange({ ...filters, gender: g })}
                  className="h-4 w-4 accent-[#ff3f6c] cursor-pointer"
                />
                <span>{g === "Boy" ? "Boys" : "Girls"}</span>
              </div>
              <span className="text-[11px] text-[#94969f]">
                ({counts[g] || 0})
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* 2. AGE / SIZE (Myntra-style Checkbox List with Counts) */}
      <div className="py-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#282c3f] mb-3">
          Age / Size
        </h3>
        <div className="space-y-2.5">
          <label className="flex items-center gap-3 text-xs font-normal text-[#282c3f] cursor-pointer hover:text-black">
            <input
              type="radio"
              name="filter-age"
              checked={filters.age === "All"}
              onChange={() => onChange({ ...filters, age: "All" })}
              className="h-4 w-4 accent-[#ff3f6c] cursor-pointer"
            />
            <span>All Sizes</span>
          </label>

          {availableAgeRanges.map((a) => {
            const isChecked = filters.age === a;
            return (
              <label
                key={a}
                className="flex items-center justify-between text-xs font-normal text-[#282c3f] cursor-pointer hover:text-black"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() =>
                      onChange({
                        ...filters,
                        age: isChecked ? "All" : a,
                      })
                    }
                    className="h-4 w-4 rounded border-stone-300 accent-[#ff3f6c] cursor-pointer"
                  />
                  <span>{a}</span>
                </div>
                <span className="text-[11px] text-[#94969f]">
                  ({ageCounts[a] || 0})
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </div>
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