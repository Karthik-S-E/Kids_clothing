import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatINR } from "../lib/formatINR";
import { whatsappOrderUrl } from "../lib/whatsapp";
import { useProductStore } from "../store/productStore";
import { HeroScene } from "../components/HeroScene";

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

  return (
    <section className="mx-auto grid max-w-6xl gap-10 px-6 py-10 lg:grid-cols-2">
      <div className="overflow-hidden rounded-[2rem] border border-[var(--line)]">
        <img src={product.image} alt={product.name} className="aspect-[4/5] w-full object-cover" />
      </div>
      <div>
        <p className="text-[11px] uppercase tracking-[0.3em] text-gold">
          {product.gender} · {product.ageRange}
        </p>
        <h1 className="mt-2 font-display text-5xl">{product.name}</h1>
        <p className="mt-4 text-3xl font-semibold text-gold">{formatINR(product.price)}</p>
        <p className="mt-4 text-[var(--muted)]">{product.description}</p>
        <p className="mt-8 text-sm uppercase tracking-widest text-[var(--muted)]">Select size</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSize(s)}
              className={`rounded-full px-4 py-2 text-sm ${size === s ? "bg-gold text-ink" : "border border-[var(--line)]"}`}
            >
              {s}
            </button>
          ))}
        </div>
        <a
          href={whatsappOrderUrl({ productName: product.name, size, price: product.price })}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex rounded-full bg-[#25D366] px-8 py-3 font-semibold text-white"
        >
          Buy via WhatsApp
        </a>
        <div className="mt-10 h-56 overflow-hidden rounded-3xl border border-[var(--line)]">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
