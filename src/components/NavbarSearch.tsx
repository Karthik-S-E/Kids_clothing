import { useState, useRef, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X } from "lucide-react";
import { useProductStore } from "../store/productStore";
import { formatINR } from "../lib/formatINR";

export function NavbarSearch() {
  const navigate = useNavigate();
  const products = useProductStore((s) => s.products);

  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const filteredProducts = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.designNo?.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q) ||
          p.ageRange?.toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [query, products]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectProduct = (productId: string) => {
    setIsOpen(false);
    setQuery("");
    navigate(`/shop/${productId}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      setIsOpen(false);
      navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative flex items-center">
      {isOpen ? (
        <div className="flex items-center bg-[#281E15]/95 border border-[#D9B382]/40 rounded-full px-3.5 py-1.5 text-xs shadow-lg transition-all w-52 sm:w-72">
          <Search className="w-3.5 h-3.5 text-[#D9B382] shrink-0 mr-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onKeyDown={handleKeyDown}
            autoFocus
            placeholder="Search dresses, kurtas, brand..."
            className="bg-transparent text-white placeholder-stone-400 text-xs focus:outline-none w-full"
          />
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
            }}
            className="text-stone-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="p-2 text-[#281E15] hover:text-[#C27A6A] transition-colors cursor-pointer flex items-center gap-1.5 rounded-full hover:bg-[#E8E2D9]/50 px-3"
          aria-label="Open search"
        >
          <Search className="w-4 h-4 text-[#281E15]" />
          <span className="hidden sm:inline text-[11px] font-semibold tracking-wider uppercase">Search</span>
        </button>
      )}

      {/* Live Search Suggestions Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 sm:right-auto sm:w-80 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-[#E8E2D9] bg-[#FAF7F2] text-[#281E15] shadow-2xl">
          {filteredProducts.length === 0 ? (
            <div className="p-4 text-center text-xs text-stone-500">
              No matching festive pieces found for "{query}".
            </div>
          ) : (
            <div className="divide-y divide-stone-200/60">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleSelectProduct(p.id)}
                  className="flex items-center gap-3 p-3 text-xs hover:bg-[#F8F4EF] transition cursor-pointer"
                >
                  <img
                    src={p.image}
                    alt={p.name}
                    className="h-10 w-10 rounded-lg object-cover border border-stone-200 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-900 truncate">{p.name}</p>
                    <p className="text-stone-500 text-[11px]">
                      {p.ageRange} {p.designNo ? `· #${p.designNo}` : ""}
                    </p>
                  </div>
                  <span className="font-mono font-bold text-[#ff3e6c] shrink-0">
                    {formatINR(p.price)}
                  </span>
                </div>
              ))}
              <div
                onClick={() => {
                  setIsOpen(false);
                  navigate(`/shop?search=${encodeURIComponent(query.trim())}`);
                }}
                className="p-2.5 text-center bg-[#281E15] text-[11px] font-bold uppercase tracking-wider text-white hover:bg-black transition cursor-pointer"
              >
                View all results for "{query}"
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NavbarSearch;