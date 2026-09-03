import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useProductStore } from "../store/productStore";

export function ProductPage() {
  const { id } = useParams();
  const product = useProductStore((s) => s.products.find((p) => p.id === id));
  const [size, setSize] = useState(product?.sizes[0] ?? "");

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

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2">
      <div className="flex justify-center items-center w-full">
        <img
          src={product.image}
          alt={product.name}
          className={`w-full max-h-[620px] rounded-3xl object-contain shadow-2xl ${
            !inStock ? "grayscale opacity-60" : ""
          }`}
        />
      </div>

      <div className="flex flex-col justify-center">
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
          {product.gender} · {product.ageRange}
        </p>
        <h1 className="mt-2 font-display text-5xl">{product.name}</h1>
        <p className="mt-4 text-3xl font-semibold text-gold">{formatINR(product.price)}</p>
        <p className="mt-4 text-[var(--muted)] leading-relaxed">{product.description}</p>

        {/* Stock Status / Remaining Quantity Indicator */}
        <div className="mt-6 flex items-center gap-2">
          {inStock ? (
            quantity !== undefined && quantity > 0 ? (
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-xs font-semibold ${
                  quantity <= 3
                    ? "bg-amber-500/15 text-amber-300 border border-amber-500/30"
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

        <p className="mt-8 text-sm uppercase tracking-widest text-[var(--muted)]">Available Sizes</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition-colors ${
                size === s ? "bg-gold text-ink" : "border border-[var(--line)] hover:border-gold"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          {inStock ? (
            <a
              href={whatsappOrderUrl({ productName: product.name, size, price: product.price })}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[#25D366] px-8 py-3.5 font-semibold text-white transition hover:bg-[#20bd5a] hover:scale-105 active:scale-95"
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
              className="inline-flex rounded-full bg-[#F43397] px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Meesho Store
            </a>
          )}

          {product.flipkartUrl && (
            <a
              href={product.flipkartUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex rounded-full bg-[#2874F0] px-6 py-3.5 text-sm font-bold text-white transition hover:opacity-90"
            >
              Flipkart Store
            </a>
          )}
        </div>
      </div>
    </section>
  );
}