import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MessageCircle, ArrowRight } from "lucide-react";
import { normaliseAgeRange, type Product } from "../config";
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
    productId: product.id,
  });

  const displayDescription = getCardDescription(product.name, product.description);
  const displayAge = normaliseAgeRange(product.ageRange);

  // Dynamic MRP and discount calculation from admin input
  const discountPercent = Number(product.discountPercent) || 0;
  const hasDiscount = discountPercent > 0 && discountPercent < 100;
  const mrp = hasDiscount
    ? Math.round(product.price / (1 - discountPercent / 100))
    : product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col h-full rounded-xl border border-stone-200/80 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-stone-300 overflow-hidden"
    >
      <Link
        to={`/shop/${product.id}`}
        className="relative aspect-[3/4] w-full shrink-0 overflow-hidden bg-stone-100 block"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className={`h-full w-full object-cover object-top transition-transform duration-500 group-hover:scale-105 ${
            !inStock ? "grayscale opacity-50" : ""
          }`}
        />
        {!inStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-[2px]">
            Out of Stock
          </span>
        )}
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
            <Link
              to={`/shop/${product.id}`}
              className="hover:text-amber-800 transition-colors block"
            >
              <h2 className="text-xs sm:text-sm font-bold leading-tight text-[#282c3f] line-clamp-2">
                {product.name}
              </h2>
            </Link>
          </div>

          {/* Pricing Block with Dynamic Admin Discount */}
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

          <div className="mt-3 flex flex-wrap gap-1 min-h-[1.5rem]">
            {(product.sizes || []).slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 text-[10px] font-medium text-stone-600"
              >
                {s}
              </span>
            ))}
            {(product.sizes || []).length > 4 && (
              <span className="text-[10px] text-stone-400 self-center">
                +{(product.sizes || []).length - 4} more
              </span>
            )}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <Link
            to={`/shop/${product.id}`}
            className="text-[11px] font-bold uppercase tracking-wider text-stone-600 hover:text-stone-950 transition-colors inline-flex items-center gap-1 shrink-0"
          >
            Details <ArrowRight className="h-3 w-3" />
          </Link>

          <a
            href={orderUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#25D366] px-3 py-1.5 text-[11px] font-bold tracking-wide text-white shadow-xs hover:bg-[#20ba59] active:scale-95 transition-all"
          >
            <MessageCircle className="h-3.5 w-3.5 fill-current" /> Order via WhatsApp
          </a>
        </div>
      </div>
    </motion.article>
  );
}