import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { useProductStore } from "../store/productStore";

export function HomePage() {
  const allProducts = useProductStore((s) => s.products);
  const products = allProducts.slice(0, 4);
  // The first live product doubles as the hero shot; falls back to the studio image.
  const heroImage = allProducts[0]?.image ?? "/hero-ethnic.jpg";

  return (
    <>
      <section className="relative mx-auto grid min-h-[82vh] max-w-6xl items-center gap-10 px-6 pb-12 pt-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            <Sparkles className="h-3.5 w-3.5" />
            Handcrafted Festive Wear
          </div>

          <h1 className="font-display text-5xl leading-[1.05] sm:text-7xl">
            Timeless ethnic wear for your <span className="gold-text italic">little ones</span>.
          </h1>

          <p className="mt-6 max-w-lg text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Breathable, skin-friendly traditional attire designed for toddlers and kids. Handcrafted kurtas, lehengas, and festive sets ready for quick dispatch.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="rounded-full bg-gold px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-ink shadow-lg shadow-gold/20 transition-all hover:bg-yellow-400 hover:scale-105 active:scale-95"
            >
              Shop Collection
            </Link>
            <Link
              to="/contact"
              className="rounded-full border border-[var(--line)] px-8 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors hover:border-gold"
            >
              Contact Atelier
            </Link>
          </div>

          {/* Quick storefront perks */}
          <div className="mt-10 grid grid-cols-3 gap-3 border-t border-[var(--line)] pt-6 text-[var(--muted)]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-gold shrink-0" />
              <span className="text-xs font-medium">100% Pure Cotton Lining</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="h-4 w-4 text-gold shrink-0" />
              <span className="text-xs font-medium">Pan-India Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-gold shrink-0" />
              <span className="text-xs font-medium">Instant WhatsApp Support</span>
            </div>
          </div>
        </motion.div>

        {/* Apparel Showcase Hero Banner */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative h-[480px] w-full overflow-hidden rounded-[2.5rem] border border-[var(--line)] shadow-2xl lg:h-[580px]"
        >
          <img
            src={heroImage}
            alt="Children wearing Kandamma Kids festive ethnic outfits"
            className="h-full w-full object-cover object-center"
            loading="eager"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between rounded-2xl bg-black/40 p-4 backdrop-blur-md border border-white/10">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-gold">Festive 2026 Edition</p>
              <h3 className="font-display text-2xl text-white">Pure Comfort Meets Festive Flair</h3>
            </div>
            <Link
              to="/shop"
              className="rounded-full bg-white px-4 py-2 text-xs font-bold uppercase tracking-wider text-black transition hover:bg-gold"
            >
              Explore
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Featured Drops Grid */}
      <motion.section
        className="mx-auto max-w-6xl px-6 py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold">Curated Favorites</p>
            <h2 className="font-display text-4xl">Featured Pieces</h2>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-gold hover:underline">
            View all pieces →
          </Link>
        </div>
        {products.length === 0 ? (
          <p className="glass rounded-3xl p-10 text-center text-[var(--muted)]">
            New pieces are being photographed. Check back shortly.
          </p>
        ) : (
          <div
            className={`grid gap-6 sm:grid-cols-2 ${
              products.length >= 4
                ? "lg:grid-cols-4"
                : products.length === 3
                  ? "lg:grid-cols-3"
                  : "lg:grid-cols-2 lg:max-w-3xl"
            }`}
          >
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </motion.section>
    </>
  );
}