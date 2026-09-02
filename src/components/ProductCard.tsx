import { type MouseEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useCartStore } from "../store/cartStore";

export function ProductCard({ product }: { product: Product }) {
  const card = useRef<HTMLElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [hover, setHover] = useState(false);
  const [selectedSize, setSelectedSize] = useState(
    product.sizes[Math.floor(product.sizes.length / 2)] ?? product.sizes[0]
  );
  const addItem = useCartStore((s) => s.addItem);

  function onMove(e: MouseEvent) {
    const el = card.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    setTilt({ x: (py - 0.5) * -14, y: (px - 0.5) * 18 });
  }

  return (
    <motion.article
      ref={card}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setTilt({ x: 0, y: 0 });
      }}
      onMouseMove={onMove}
      className="group relative"
      style={{ perspective: 1200 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="glass overflow-hidden rounded-3xl border border-white/10 shadow-xl shadow-black/5 transition-shadow duration-300"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transformStyle: "preserve-3d",
          boxShadow: hover ? "0 24px 60px -20px var(--glow)" : undefined,
        }}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.3 }}
      >
        <Link to={`/shop/${product.id}`} className="relative block aspect-[4/5] overflow-hidden">
          <motion.img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover ${!product.stockStatus ? 'grayscale opacity-60' : ''}`}
            initial={{ scale: 1 }}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.5 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <div className="absolute left-4 top-4 flex gap-2">
            <span className="rounded-full bg-black/45 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-white backdrop-blur">
              {product.gender}
            </span>
            <span className="rounded-full bg-amber-300/90 px-3 py-1 text-[11px] font-medium text-ink">
              {product.ageRange}
            </span>
            {!product.stockStatus && (
              <span className="rounded-full bg-red-500/90 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
                Out of Stock
              </span>
            )}
          </div>
        </Link>
        <div className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display text-2xl leading-tight">{product.name}</h3>
            <p className="font-semibold text-gold">{formatINR(product.price)}</p>
          </div>
          <p className="line-clamp-2 text-sm text-[var(--muted)]">{product.description}</p>
          {!product.stockStatus ? (
            <div className="rounded-full bg-gray-400/20 py-2.5 text-center text-sm font-semibold text-gray-400">
              OUT OF STOCK
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <Link
                  to={`/shop/${product.id}`}
                  className="flex-1 rounded-full border border-[var(--line)] py-2.5 text-center text-sm font-medium hover:border-gold"
                >
                  View
                </Link>
                <a
                  href={whatsappOrderUrl({ productName: product.name, size: selectedSize, price: product.price })}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 rounded-full bg-[#25D366] py-2.5 text-center text-sm font-semibold text-white whatsapp-glow"
                >
                  Buy via WhatsApp
                </a>
              </div>
              <div className="flex flex-col gap-2">
                {product.meeshoUrl && (
                  <a
                    href={product.meeshoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-full bg-[#F43397] py-2 text-center text-xs font-semibold text-white"
                  >
                    Order on Meesho
                  </a>
                )}
                {product.flipkartUrl && (
                  <a
                    href={product.flipkartUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full rounded-full bg-[#2874F0] py-2 text-center text-xs font-semibold text-white"
                  >
                    Order on Flipkart
                  </a>
                )}
                <div className="flex items-center gap-2">
                  <select
                    value={selectedSize}
                    onChange={(e) => setSelectedSize(e.target.value)}
                    className="flex-1 rounded-full border border-[var(--line)] bg-transparent px-3 py-2 text-xs"
                  >
                    {product.sizes.map((size) => (
                      <option key={size} value={size}>
                        {size}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => addItem(product, selectedSize)}
                    className="flex-1 rounded-full bg-gold py-2 text-xs font-semibold uppercase tracking-widest text-ink"
                  >
                    Add to Bag
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.article>
  );
}
