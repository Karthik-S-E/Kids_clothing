import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useProductStore } from "../store/productStore";

export function ProductPage() {
  const { id } = useParams();
  const product = useProductStore((s) =>
    s.products.find((p) => p.id === id),
  );

  const availableColors = product?.color
    ? product.color
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean)
    : [];

  const [size, setSize] = useState(product?.sizes[0] ?? "");
  const [selectedColor, setSelectedColor] = useState(
    availableColors[0] ?? "",
  );

  if (!product) {
    return (
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <p className="font-display text-4xl text-[var(--text-primary)]">
          Piece not found
        </p>

        <Link
          to="/shop"
          className="mt-4 inline-block text-[var(--accent-primary)]"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const inStock = product.stockStatus ?? true;
  const quantity = product.stockQuantity;

  const activeImage =
    (selectedColor && product.colorImages?.[selectedColor]) || product.image;

  const itemTitle = [
    product.name,
    selectedColor ? `(${selectedColor})` : "",
    product.designNo ? `[#${product.designNo}]` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2">
      <div className="flex w-full items-center justify-center">
        <img
          key={activeImage}
          src={activeImage}
          alt={product.name}
          className={`max-h-[620px] w-full rounded-3xl object-contain shadow-2xl transition-all duration-300 ${
            !inStock ? "grayscale opacity-60" : ""
          }`}
        />
      </div>

      <div className="flex flex-col justify-center">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--accent-primary)]">
            {product.gender} · {product.ageRange}
          </p>

          {product.designNo && (
            <span className="rounded-full border border-[var(--accent-primary)]/30 bg-[var(--accent-primary)]/15 px-3 py-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-[var(--accent-primary)]">
              Design No: #{product.designNo}
            </span>
          )}
        </div>

        <h1 className="mt-2 font-display text-4xl text-[var(--text-primary)] sm:text-5xl">
          {product.name}
        </h1>

        <p className="mt-3 text-3xl font-semibold text-[var(--accent-primary)]">
          {formatINR(product.price)}
        </p>

        <div className="mt-4 flex items-center gap-2">
          {inStock ? (
            quantity !== undefined && quantity > 0 ? (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold ${
                  quantity <= 3
                    ? "border border-amber-500/30 bg-amber-500/15 font-bold text-amber-300"
                    : "border border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    quantity <= 3
                      ? "animate-pulse bg-amber-400"
                      : "bg-emerald-400"
                  }`}
                />

                {quantity <= 3
                  ? `Only ${quantity} piece${
                      quantity > 1 ? "s" : ""
                    } left in stock!`
                  : `${quantity} in stock`}
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3.5 py-1 text-xs font-semibold text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                In Stock
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/15 px-3.5 py-1 text-xs font-semibold text-red-300">
              <span className="h-2 w-2 rounded-full bg-red-400" />
              Out of Stock
            </span>
          )}
        </div>

        <p className="mt-4 text-sm leading-relaxed text-[var(--muted)]">
          {product.description}
        </p>

        <div className="mt-6 space-y-2.5 rounded-2xl border border-[var(--line)] bg-[var(--surface)] p-4 text-xs">
          <div className="flex justify-between border-b border-[var(--line)] pb-2">
            <span className="text-[var(--muted)]">Design No:</span>
            <span className="font-mono font-semibold uppercase text-[var(--accent-primary)]">
              {product.designNo || "—"}
            </span>
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
            <span className="shrink-0 pr-4 text-[var(--muted)]">
              Occasion:
            </span>
            <span className="text-right font-medium text-[var(--muted)]">
              {product.occasion || "—"}
            </span>
          </div>
        </div>

        {availableColors.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
              Select Color{" "}
              {selectedColor && (
                <span className="font-bold text-[var(--accent-primary)]">
                  ({selectedColor})
                </span>
              )}
            </p>

            <div className="mt-2.5 flex flex-wrap gap-2">
              {availableColors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                    selectedColor === color
                      ? "bg-[var(--accent-primary)] font-bold text-white shadow-sm"
                      : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--accent-primary)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--muted)]">
            Available Sizes
          </p>

          <div className="mt-2.5 flex flex-wrap gap-2">
            {product.sizes.map((productSize) => (
              <button
                key={productSize}
                type="button"
                onClick={() => setSize(productSize)}
                className={`rounded-full px-5 py-2 text-xs font-semibold transition-colors ${
                  size === productSize
                    ? "bg-[var(--accent-primary)] font-bold text-white shadow-sm"
                    : "border border-[var(--line)] text-[var(--text-primary)] hover:border-[var(--accent-primary)]"
                }`}
              >
                {productSize}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {inStock ? (
            <a
              href={whatsappOrderUrl({
                productName: itemTitle,
                size,
                price: product.price,
                productId: product.id,
              })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[var(--accent-secondary)] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#526b66] active:scale-95"
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
              className="inline-flex rounded-full bg-[#f43397] px-6 py-3.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              Meesho Store
            </a>
          )}

          {product.flipkartUrl && (
            <a
              href={product.flipkartUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[#2874f0] px-6 py-3.5 text-xs font-bold text-white transition hover:opacity-90"
            >
              Flipkart Store
            </a>
          )}
        </div>
      </div>
    </section>
  );
}