import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useProductStore } from "../store/productStore";

export function ProductPage() {
  const { id } = useParams();
  const product = useProductStore((s) => s.products.find((p) => p.id === id));

  // Parse comma-separated colors
  const availableColors = product?.color
    ? product.color
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(availableColors[0] ?? "");

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-4xl">Piece not found</p>
        <Link to="/shop" className="mt-4 inline-block text-gold">
          Back to shop
        </Link>
      </div>
    );
  }

  const inStock = product.stockStatus ?? true;
  const quantity = product.stockQuantity;

  // Swap to the color's dedicated image if uploaded, otherwise fallback to main image
  const activeImage =
    (selectedColor && product.colorImages?.[selectedColor]) || product.image;

  // Include color & Design No in the WhatsApp order message
  const itemTitle = [
    product.name,
    selectedColor ? `(${selectedColor})` : "",
    product.designNo ? `[#${product.designNo}]` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2">
      {/* Product Image (Swaps with color selection) */}
      <div className="flex justify-center items-center w-full">
        <img
          key={activeImage}
          src={activeImage}
          alt={product.name}
          className={`w-full max-h-[620px] rounded-3xl object-contain shadow-2xl transition-all duration-300 ${
            !inStock ? "grayscale opacity-60" : ""
          }`}
        />
      </div>

      {/* Product Details */}
      <div className="flex flex-col justify-center">
        {/* Top Gender & Design No Tag */}
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] uppercase tracking-[0.3em] text-gold font-bold">
            {product.gender} · {product.ageRange}
          </p>
          {product.designNo && (
            <span className="rounded-full bg-gold/15 border border-gold/30 px-3 py-0.5 text-[11px] font-mono font-bold uppercase tracking-wider text-gold">
              Design No: #{product.designNo}
            </span>
          )}
        </div>

        <h1 className="mt-2 font-display text-4xl sm:text-5xl">{product.name}</h1>
        <p className="mt-3 text-3xl font-semibold text-gold">{formatINR(product.price)}</p>

        {/* Stock Status Indicator */}
        <div className="mt-4 flex items-center gap-2">
          {inStock ? (
            quantity !== undefined && quantity > 0 ? (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold ${
                  quantity <= 3
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold"
                    : "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    quantity <= 3 ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                  }`}
                />
                {quantity <= 3
                  ? `Only ${quantity} piece${quantity > 1 ? "s" : ""} left in stock!`
                  : `${quantity} in stock`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                In Stock
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/15 border border-red-500/30 px-3.5 py-1 text-xs font-semibold text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Out of Stock
            </span>
          )}
        </div>

        <p className="mt-4 text-[var(--muted)] leading-relaxed text-sm">{product.description}</p>

        {/* Product Specifications Box */}
        <div className="mt-6 rounded-2xl border border-[var(--line)] bg-white/5 p-4 space-y-2.5 text-xs">
          <div className="flex justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--muted)]">Design No:</span>
            <span className="font-semibold text-gold font-mono uppercase">{product.designNo || "—"}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--muted)]">Style:</span>
            <span className="font-semibold">{product.style || "—"}</span>
          </div>
          <div className="flex justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--muted)]">Age Group:</span>
            <span className="font-semibold">{product.ageRange || "—"}</span>
          </div>
          <div className="flex justify-between pt-0.5">
            <span className="text-[var(--muted)] shrink-0 pr-4">Occasion:</span>
            <span className="font-medium text-right text-[var(--muted)]">{product.occasion || "—"}</span>
          </div>
        </div>

        {/* Color Selection */}
        {availableColors.length > 0 && (
          <div className="mt-6">
            <p className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">
              Select Color {selectedColor && <span className="text-gold font-bold">({selectedColor})</span>}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {availableColors.map((clr) => (
                <button
                  key={clr}
                  type="button"
                  onClick={() => setSelectedColor(clr)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                    selectedColor === clr
                      ? "bg-gold text-ink font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                      : "border border-[var(--line)] hover:border-gold text-[var(--muted)] hover:text-white"
                  }`}
                >
                  {clr}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Size Selection */}
        <div className="mt-6">
          <p className="text-xs uppercase tracking-widest text-[var(--muted)] font-semibold">
            Available Sizes
          </p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                  size === s
                    ? "bg-gold text-ink font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]"
                    : "border border-[var(--line)] hover:border-gold"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Order Buttons */}
        <div className="mt-8 flex flex-wrap gap-3">
          {inStock ? (
            <a
              href={whatsappOrderUrl({ productName: itemTitle, size, price: product.price })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[#25D366] px-8 py-3.5 font-semibold text-white transition hover:bg-[#20bd5a] hover:scale-105 active:scale-95 text-sm shadow cursor-pointer"
            >
              Order via WhatsApp
            </a>
          ) : (
            <span className="rounded-full bg-red-500/20 px-6 py-3 text-sm font-bold uppercase tracking-wider text-red-400">
              Out of Stock
            </span>
          )}

          {product.meeshoUrl && (
            <a
              href={product.meeshoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[#F43397] px-6 py-3.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              Meesho Store
            </a>
          )}

          {product.flipkartUrl && (
            <a
              href={product.flipkartUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[#2874F0] px-6 py-3.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              Flipkart Store
            </a>
          )}
        </div>
      </div>
    </section>
  );
}