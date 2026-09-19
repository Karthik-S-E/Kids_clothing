import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { normaliseAgeRange, type Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { useWishlistStore } from "../store/wishlistStore";

function getCardDescription(name: string, defaultDesc: string): string {
  const normalized = name.toLowerCase();
  if (normalized.includes("sequin bodice")) return "Sparkly party gown for girls with a sequin top, soft tulle skirt, and feathered shoulders for a royal look.";
  if (normalized.includes("floral lehenga")) return "Royal blue lehenga set with a floral top, layered skirt, and matching dupatta. Ideal for weddings and festivals.";
  if (normalized.includes("floral printed") || normalized.includes("palazzo")) return "Floral kurta and palazzo set for girls with a soft dupatta. Light, comfy, and perfect for festivals.";
  return defaultDesc;
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockStatus ?? true;
  const [selectedSize, setSelectedSize] = useState<string>(product.sizes?.[0] ?? "Standard");
  const [isHovered, setIsHovered] = useState(false);

  const { items: wishlistItems, toggleWishlist, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(product.id);

  const displayDescription = getCardDescription(product.name, product.description);
  const displayAge = normaliseAgeRange(product.ageRange);

  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && discountPercent < 100;
  const mrp = hasDiscount ? Math.round(product.price / (1 - discountPercent / 100)) : product.price;

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full rounded-xl border border-stone-200/80 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-stone-300 overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link to={`/shop/${product.id}`} className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-100 block">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${!inStock ? "grayscale opacity-50" : ""}`}
        />
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px]">
            Out of Stock
          </span>
        )}

        {/* Myntra-Style Floating Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlistClick}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-md transition hover:scale-110 cursor-pointer z-10"
          aria-label="Wishlist toggle"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? "fill-[#ff3e6c] text-[#ff3e6c]" : "text-stone-600 hover:text-stone-900"
            }`}
          />
        </button>

        {/* Hover Popup / Slide-Up Overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="absolute inset-x-0 bottom-0 bg-white/95 backdrop-blur-md p-3 border-t border-stone-200 shadow-lg z-20"
              onClick={(e) => e.preventDefault()}
            >
              <div className="text-[11px] font-bold text-stone-700 uppercase tracking-wide mb-1.5 flex items-center justify-between">
                <span>Select Size</span>
                <span className="text-[10px] text-stone-400 font-normal">Sizes:</span>
              </div>

              {/* Sizes Pill Selector Popup */}
              {product.sizes && product.sizes.length > 0 ? (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setSelectedSize(s);
                      }}
                      className={`rounded px-2 py-1 text-[11px] font-bold transition cursor-pointer shrink-0 ${
                        selectedSize === s
                          ? "bg-[#282c3f] text-white shadow-xs"
                          : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              ) : (
                <span className="text-[11px] text-stone-500 font-medium">Standard Fit</span>
              )}

              <button
                type="button"
                onClick={handleWishlistClick}
                className={`mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-[4px] py-2 text-[11px] font-bold uppercase tracking-wider transition cursor-pointer ${
                  isWishlisted
                    ? "bg-red-50 text-[#ff3e6c] border border-red-200"
                    : "bg-[#282c3f] text-white hover:bg-stone-800"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${isWishlisted ? "fill-current" : ""}`} />
                {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </Link>

      <div className="flex flex-1 flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="inline-block rounded bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#282c3f]">
              {product.gender}
            </span>
            {displayAge && (
              <span className="inline-block rounded border border-amber-200/70 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-900">
                {displayAge}
              </span>
            )}
          </div>

          <div className="min-h-[2.5rem]">
            <Link to={`/shop/${product.id}`} className="hover:text-amber-800 transition-colors block">
              <h2 className="text-xs sm:text-sm font-bold leading-tight text-[#282c3f] line-clamp-2">
                {product.name}
              </h2>
            </Link>
          </div>

          <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-extrabold text-[#282c3f]">
              {formatINR(product.price)}
            </span>
            {hasDiscount && (
              <>
                <span className="text-[11px] sm:text-xs text-stone-500 line-through font-medium">
                  MRP {formatINR(mrp)}
                </span>
                <span className="text-[11px] sm:text-xs font-bold text-amber-700">
                  ({discountPercent}% OFF)
                </span>
              </>
            )}
          </div>

          <p className="mt-1.5 line-clamp-2 text-[11px] text-[#696b79] leading-relaxed min-h-[2rem]">
            {displayDescription}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <Link
            to={`/shop/${product.id}`}
            className="text-[11px] font-bold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>

          <span className="text-[11px] font-medium text-stone-400">
            Size: <strong className="text-stone-700">{selectedSize}</strong>
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default ProductCard;