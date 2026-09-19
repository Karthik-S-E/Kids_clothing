import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { ProductFilters, useProductFilters } from "../components/ProductFilters";
import { useProductStore } from "../store/productStore";

type SortOption =
  | "recommended"
  | "price-asc"
  | "price-desc"
  | "gender-boys"
  | "gender-girls";

export function ShopPage() {
  const products = useProductStore((s) => s.products);
  const { filters, setFilters, filtered } = useProductFilters(products);
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q")?.toLowerCase().trim() || "";
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // Search filter
  const searchedProducts = useMemo(() => {
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

  // Split into boys and girls sets for gender-based sorting
  const boysProducts = useMemo(
    () => searchedProducts.filter((p) => p.gender?.toLowerCase() === "boy"),
    [searchedProducts]
  );

  const girlsProducts = useMemo(
    () => searchedProducts.filter((p) => p.gender?.toLowerCase() === "girl"),
    [searchedProducts]
  );

  // General sorting for price / recommended
  const displayProducts = useMemo(() => {
    const list = [...searchedProducts];
    if (sortBy === "price-asc") {
      list.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => b.price - a.price);
    }
    return list;
  }, [searchedProducts, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    const f = filters as Record<string, any>;
    if (f.gender && f.gender !== "All") count++;
    if (f.age && f.age !== "All") count++;
    if (f.ageRange && f.ageRange !== "All") count++;
    return count;
  }, [filters]);

  function resetFilters() {
    setFilters((prev: any) => ({
      ...prev,
      gender: "All",
      age: "All",
      ageRange: "All",
    }));
    setSortBy("recommended");
  }

  const isGenderSorted = sortBy === "gender-boys" || sortBy === "gender-girls";

  return (
    <div className="min-h-screen bg-[#fcfbfa] text-[#282c3f]">
      {/* Top Breadcrumbs */}
      <div className="border-b border-stone-200 bg-white">
        <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-3">
          <nav className="flex items-center gap-2 text-xs font-medium text-stone-500">
            <Link to="/" className="hover:text-stone-900 transition">
              Home
            </Link>
            <span>/</span>
            <span className="text-stone-900 font-semibold">
              {query ? `Search Results for "${query}"` : "Kids Ethnic Wear"}
            </span>
          </nav>
        </div>
      </div>

      {/* Main Container */}
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 py-5">
        {/* Header Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
          <div className="flex items-baseline gap-2.5">
            <h1 className="text-base sm:text-lg font-bold uppercase tracking-wider text-stone-900">
              {query ? `Search: "${query}"` : "Traditional Wear"}
            </h1>
            <span className="text-xs font-medium text-stone-500">
              - {searchedProducts.length} items
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold uppercase border border-stone-300 rounded bg-white hover:bg-stone-50"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs font-semibold text-stone-600 hidden sm:inline"
              >
                Sort by:
              </label>
              <div className="relative">
                <select
                  id="sort-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none border border-stone-300 bg-white px-3 py-1.5 pr-8 text-xs font-semibold text-stone-800 rounded focus:outline-none focus:border-stone-800 cursor-pointer"
                >
                  <option value="recommended">Recommended</option>
                  <option value="gender-boys">Gender: Boys First</option>
                  <option value="gender-girls">Gender: Girls First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
                <ChevronDown className="absolute right-2 top-2.5 h-3.5 w-3.5 text-stone-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Desktop View */}
        <div className="flex gap-6 pt-6">
          {/* Left Vertical Filter Rail */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <div className="sticky top-20 border-r border-stone-200 pr-5">
              <div className="flex items-center justify-between pb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-900">
                  Filters
                </span>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="text-[11px] font-bold text-amber-800 uppercase hover:underline cursor-pointer"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <ProductFilters
                products={products}
                filters={filters}
                onChange={setFilters}
              />
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 min-w-0">
            {searchedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed border-stone-300 bg-white">
                <p className="text-sm font-semibold text-stone-800 mb-1">
                  No items under this category currently available.
                </p>
                <p className="text-xs text-stone-500 mb-5">
                  Try clearing your filters to see the full collection.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="rounded bg-stone-900 px-4 py-2 text-xs font-semibold text-white uppercase hover:bg-stone-800"
                >
                  Clear All Filters
                </button>
              </div>
            ) : isGenderSorted ? (
              <div className="space-y-10">
                {/* Primary Group */}
                <div>
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#282c3f]">
                      {sortBy === "gender-boys" ? "Boys Collection" : "Girls Collection"}
                    </h2>
                    <span className="text-xs text-stone-400">
                      ({sortBy === "gender-boys" ? boysProducts.length : girlsProducts.length})
                    </span>
                  </div>

                  {(sortBy === "gender-boys" ? boysProducts : girlsProducts).length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-lg border border-dashed border-stone-200 bg-stone-50/60 mb-6">
                      <p className="text-xs font-medium text-stone-700">
                        {sortBy === "gender-boys"
                          ? "No items under this category currently available. Please look for Girls Collections"
                          : "No items under this category currently available. Please look for Boys Collections"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                      {(sortBy === "gender-boys" ? boysProducts : girlsProducts).map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Secondary Group */}
                <div>
                  <div className="flex items-center gap-2 border-b border-stone-200 pb-2 mb-4">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#282c3f]">
                      {sortBy === "gender-boys" ? "Girls Collection" : "Boys Collection"}
                    </h2>
                    <span className="text-xs text-stone-400">
                      ({sortBy === "gender-boys" ? girlsProducts.length : boysProducts.length})
                    </span>
                  </div>

                  {(sortBy === "gender-boys" ? girlsProducts : boysProducts).length === 0 ? (
                    <div className="py-8 px-4 text-center rounded-lg border border-dashed border-stone-200 bg-stone-50/60">
                      <p className="text-xs font-medium text-stone-700">
                        {sortBy === "gender-boys"
                          ? "No items under this category currently available. Please look for Boys"
                          : "No items under this category currently available. Please look for Girls"}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                      {(sortBy === "gender-boys" ? girlsProducts : boysProducts).map((p) => (
                        <ProductCard key={p.id} product={p} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
                {displayProducts.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col bg-white p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="rounded p-1 text-stone-400 hover:text-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              <ProductFilters
                products={products}
                filters={filters}
                onChange={setFilters}
              />
            </div>

            <div className="border-t border-stone-200 pt-3 flex gap-2">
              <button
                type="button"
                onClick={resetFilters}
                className="flex-1 border border-stone-300 py-2 text-xs font-bold uppercase text-stone-700 rounded"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="flex-1 bg-stone-900 py-2 text-xs font-bold uppercase text-white rounded"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}