import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { HeroScene } from "../components/HeroScene";
import { ProductCard } from "../components/ProductCard";
import { useProductStore } from "../store/productStore";

export function HomePage() {
  const products = useProductStore((s) => s.products).slice(0, 4);

  return (
    <>
      <section className="relative mx-auto grid min-h-[88vh] max-w-6xl items-center gap-8 px-6 pb-8 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
          <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold">Premium kidswear · India</p>
          <h1 className="font-display text-5xl leading-[0.95] sm:text-7xl">
            Little Krishna.
            <br />
            <span className="gold-text italic">Vibe core</span> closet.
          </h1>
          <p className="mt-6 max-w-md text-lg text-[var(--muted)]">
            Festive ethnic wear for boys and girls — peacock silk, lotus georgette, and gold-dust jackets. Prices in ₹.
            Order in one tap on WhatsApp.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/shop" className="rounded-full bg-gold px-6 py-3 text-sm font-semibold uppercase tracking-widest text-ink">
              Explore collection
            </Link>
            <Link to="/contact" className="rounded-full border border-[var(--line)] px-6 py-3 text-sm uppercase tracking-widest">
              Visit us
            </Link>
          </div>
        </motion.div>
        <div className="relative h-[52vh] min-h-[360px] overflow-hidden rounded-[2.2rem] border border-[var(--line)] lg:h-[70vh]">
          <HeroScene />
          <p className="pointer-events-none absolute bottom-4 left-4 text-[11px] uppercase tracking-[0.28em] text-[var(--muted)]">
            Drag the light · 3D ambience follows theme
          </p>
        </div>
      </section>
      <motion.section 
        className="mx-auto max-w-6xl px-6 py-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
      >
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-display text-4xl">Drop of the season</h2>
          <Link to="/shop" className="text-sm text-gold">
            View all
          </Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </motion.section>
    </>
  );
}
