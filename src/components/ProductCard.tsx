import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Eye } from "lucide-react";
import type { Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useCartStore } from "../store/cartStore";

export function ProductCard({ product }: { product: Product }) {
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[Math.floor(product.sizes.length / 2)] ?? product.sizes[0] ?? "Free"
  );
  const addItem = useCartStore((s) => s.addItem);
  const inStock = product.stockStatus ?? true;
  const quantity = product.stockQuantity;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col rounded-[2rem] border border-[var(--line)] bg-[var(--bg-elev)] shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:border-white/25"
    >
      {/* Image container */}
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-t-[2rem] bg-black/5 dark:bg-black/20">
        <Link to={`/shop/${product.id}`} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              !inStock ? "grayscale opacity-50" : ""
            }`}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        {/* Badges */}
        <div className="absolute left-3.5 top-3.5 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white backdrop-blur-md">
            {product.gender}
          </span>
          <span className="rounded-full bg-gold/90 px-2.5 py-1 text-[10px] font-bold text-ink backdrop-blur-md">
            {product.ageRange}
          </span>
        </div>

        {/* Stock / Sold Out Badge */}
        <div className="absolute right-3.5 top-3.5">
          {!inStock ? (
            <span className="rounded-full bg-red-500/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow backdrop-blur-md">
              Out of Stock
            </span>
          ) : (
            quantity !== undefined && quantity > 0 && (
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold shadow backdrop-blur-md ${
                  quantity <= 3
                    ? "bg-amber-500/95 text-black animate-pulse"
                    : "bg-black/65 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                {quantity <= 3 ? `Only ${quantity} Left` : `${quantity} in stock`}
              </span>
            )
          )}
        </div>
      </div>

      {/* Details body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <Link to={`/shop/${product.id}`} className="hover:text-gold transition-colors">
              <h3 className="font-display text-2xl font-semibold leading-snug tracking-tight">
                {product.name}
              </h3>
            </Link>
            <span className="shrink-0 text-lg font-bold text-gold">
              {formatINR(product.price)}
            </span>
          </div>

          <p className="mt-2 line-clamp-2 text-xs text-[var(--muted)] leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Action area */}
        <div className="mt-5 space-y-3">
          {!inStock ? (
            <div className="w-full rounded-full border border-zinc-500/20 bg-zinc-500/10 py-2.5 text-center text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              Currently Unavailable
            </div>
          ) : (
            <>
              {/* Size Selection & Add To Bag */}
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="w-full appearance-none rounded-full border border-[var(--line)] bg-[var(--bg)] px-3.5 py-2.5 text-xs font-medium outline-none transition-colors hover:border-gold focus:border-gold cursor-pointer"
                  >
                    {product.sizes.map((sz) => (
                      <option key={sz} value={sz} className="bg-zinc-900 text-white">
                        Size: {sz}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-[var(--muted)]">
                    ▼
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => addItem(product, selectedSize)}
                  className="flex flex-[1.4] items-center justify-center gap-1.5 rounded-full bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-ink shadow-sm transition-all duration-200 hover:bg-yellow-400 hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(212,175,55,0.65)] active:scale-95 cursor-pointer"
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  <span>Add to Bag</span>
                </button>
              </div>

              {/* View & WhatsApp buttons */}
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={`/shop/${product.id}`}
                  className="flex items-center justify-center gap-1.5 rounded-full border border-[var(--line)] bg-transparent py-2 text-center text-xs font-semibold transition-all duration-200 hover:border-gold hover:text-gold active:scale-95"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>View</span>
                </Link>

                <a
                  href={whatsappOrderUrl({ productName: product.name, size: selectedSize, price: product.price })}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-1.5 rounded-full bg-[#25D366] py-2 text-center text-xs font-bold text-white shadow-sm transition-all duration-200 hover:bg-[#20bd5a] hover:scale-[1.02] hover:shadow-[0_0_15px_rgba(37,211,102,0.45)] active:scale-95"
                >
                  WhatsApp
                </a>
              </div>

              {/* Marketplace Links */}
              {(product.meeshoUrl || product.flipkartUrl) && (
                <div className="flex gap-2 pt-1">
                  {product.meeshoUrl && (
                    <a
                      href={product.meeshoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-full bg-[#f43397] py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 active:scale-95"
                    >
                      Meesho
                    </a>
                  )}
                  {product.flipkartUrl && (
                    <a
                      href={product.flipkartUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 rounded-full bg-[#2874f0] py-1.5 text-center text-[10px] font-bold uppercase tracking-wider text-white transition-opacity hover:opacity-90 active:scale-95"
                    >
                      Flipkart
                    </a>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </motion.article>
  );
}