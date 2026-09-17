import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import type { Product } from "../config";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";

function getCardDescription(name: string, defaultDesc: string): string {
  const normalized = name.toLowerCase();

  if (normalized.includes("sequin bodice")) {
    return "Sparkly party gown for girls with a sequin top, soft tulle skirt, and feathered shoulders for a royal look.";
  }

  if (normalized.includes("floral lehenga")) {
    return "Royal blue lehenga set with a floral top, layered skirt, and matching dupatta. Ideal for weddings and festivals.";
  }

  if (normalized.includes("floral printed") || normalized.includes("palazzo")) {
    return "Floral kurta and palazzo set for girls with a soft dupatta. Light, comfy, and perfect for festivals.";
  }

  return defaultDesc;
}

export function ProductCard({ product }: { product: Product }) {
  const inStock = product.stockStatus ?? true;

  const orderUrl = whatsappOrderUrl({
    productName: product.name,
    size: product.sizes?.[0] ?? "Standard",
    price: product.price,
  });

  const displayDescription = getCardDescription(product.name, product.description);

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="group relative flex flex-col h-full rounded-2xl border border-[var(--border)] bg-[var(--surface)] shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-2xl hover:border-[var(--accent-primary)]/40 overflow-hidden"
    >
      {/* 1. Fixed Aspect Ratio Image Banner */}
      <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-black/5 dark:bg-black/20">
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
          <span className="rounded-full bg-black/60 px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] text-white backdrop-blur-md">
            {product.gender}
          </span>
          {product.ageRange && (
            <span className="rounded-full bg-[var(--accent-primary)] px-3 py-1 text-xs font-bold text-[var(--text-primary)] backdrop-blur-md">
              {product.ageRange}
            </span>
          )}
        </div>
      </div>

      {/* 2. Structured Card Body */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          {/* Title and Price */}
          <div className="flex items-start justify-between gap-2 min-h-[3rem]">
            <Link to={`/shop/${product.id}`} className="hover:text-[var(--accent-primary)] transition-colors flex-1">
              <h2 className="font-display text-lg font-semibold leading-snug tracking-tight text-[var(--text-primary)] line-clamp-2">
                {product.name}
              </h2>
            </Link>
            <span className="shrink-0 text-base font-bold text-[var(--accent-primary)]">
              {formatINR(product.price)}
            </span>
          </div>

          {/* Description - Simplified for readability audit */}
          <p className="mt-2 line-clamp-2 text-xs text-[var(--text-secondary)] font-light leading-relaxed min-h-[2.5rem]">
            {displayDescription}
          </p>

          {/* Sizes Badges */}
          <div className="mt-3 flex flex-wrap gap-1.5 min-h-[1.5rem]">
            {(product.sizes || []).slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-md border border-[var(--border)] bg-[var(--background)] px-2 py-0.5 text-xs uppercase font-mono text-[var(--text-secondary)]"
              >
                {s}
              </span>
            ))}
            {(product.sizes || []).length > 4 && (
              <span className="text-xs text-[var(--text-secondary)] self-center">
                +{(product.sizes || []).length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* 3. Pinned Bottom Actions */}
        <div className="mt-5 pt-3 border-t border-[var(--border)] flex items-center justify-between gap-2">
          <Link
            to={`/shop/${product.id}`}
            className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--accent-primary)] transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>

          <a
            href={orderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white shadow-md hover:bg-[#20ba59] transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5" /> Order via WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}