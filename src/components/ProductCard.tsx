import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import type { Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockStatus ?? true;

  const orderUrl = whatsappOrderUrl({
    productName: product.name,
    size: product.sizes[0] ?? "Standard",
    price: product.price,
  });

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:border-[var(--accent-primary)]/40 overflow-hidden"
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden bg-black/5 dark:bg-black/20">
        <Link to={`/shop/${product.id}`} className="block h-full w-full">
          <img
            src={product.image}
            alt={product.name}
            className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${
              !inStock ? "grayscale opacity-50" : ""
            }`}
          />
        </Link>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
            {product.gender}
          </span>
          <span className="rounded-full bg-[var(--accent-primary)] px-3 py-1 text-[10px] font-bold text-[var(--text-primary)] backdrop-blur-md">
            {product.ageRange}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-between p-6">
        <div>
          <div className="flex items-start justify-between gap-3">
            <Link to={`/shop/${product.id}`} className="hover:text-[var(--accent-primary)] transition-colors">
              <h3 className="font-display text-xl font-normal leading-snug tracking-tight text-[var(--text-primary)]">
                {product.name}
              </h3>
            </Link>
            <span className="shrink-0 text-lg font-bold text-[var(--accent-primary)]">
              {formatINR(product.price)}
            </span>
          </div>

          <p className="mt-2.5 line-clamp-2 text-xs text-[var(--text-secondary)] font-light leading-relaxed">
            {product.description}
          </p>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {product.sizes.map((s) => (
              <span key={s} className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-[10px] uppercase font-mono text-[var(--text-secondary)]">
                {s}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between gap-3">
          <Link
            to={`/shop/${product.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors inline-flex items-center gap-1"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>

          <a
            href={orderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md hover:bg-[#20ba59] transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Order via WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}
