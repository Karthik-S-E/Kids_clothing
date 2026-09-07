import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Truck, MessageCircle } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { ScrollReveal, StaggerReveal } from "../components/ScrollReveal";
import { Marquee } from "../components/Marquee";
import { useProductStore } from "../store/productStore";

const FALLBACK_HERO = "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?auto=format&fit=crop&w=1200&q=80";

export function HomePage() {
  const allProducts = useProductStore((s) => s.products);
  const heroProduct = allProducts[0];
  const products = allProducts.slice(0, 4);

  return (
    <>
      {/* Marquee Brand Motion */}
      <div className="py-4 border-b border-[var(--border)] bg-[var(--surface)]">
        <Marquee speed={30} className="text-sm uppercase tracking-[0.2em] text-[var(--text-secondary)]">
          <span className="mx-8">Handcrafted</span>
          <span className="mx-8 text-[var(--accent-primary)]">•</span>
          <span className="mx-8">Festive</span>
          <span className="mx-8 text-[var(--accent-primary)]">•</span>
          <span className="mx-8">Ethnic</span>
          <span className="mx-8 text-[var(--accent-primary)]">•</span>
          <span className="mx-8">Timeless</span>
          <span className="mx-8 text-[var(--accent-primary)]">•</span>
          <span className="mx-8">Made for Little Ones</span>
          <span className="mx-8 text-[var(--accent-primary)]">•</span>
        </Marquee>
      </div>

      {/* Cinematic Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            <img
              src={heroProduct?.image || FALLBACK_HERO}
              alt={heroProduct ? heroProduct.name : "Kandamma Kids ethnic festive clothing"}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-6 py-20 w-full">
          <ScrollReveal delay={0.1} duration={0.8} direction="up">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--accent-primary)]">
                <Sparkles className="h-3.5 w-3.5" />
                Handcrafted Festive Wear
              </div>

              <h1 className="font-display text-hero text-white leading-[1.05]">
                Timeless ethnic wear for your <span className="text-[var(--accent-primary)] italic">little ones</span>.
              </h1>

              <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/90">
                Breathable, skin-friendly traditional attire designed for toddlers and kids. Handcrafted kurtas, lehengas, and festive sets ready for quick dispatch.
              </p>

              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/shop"
                  className="rounded-full bg-[var(--accent-primary)] px-8 py-3.5 text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] shadow-lg shadow-[var(--accent-primary)]/20 transition-all hover:bg-[var(--color-gold-light)] hover:scale-105 active:scale-95"
                >
                  Shop Collection
                </Link>
                <Link
                  to="/contact"
                  className="rounded-full border border-white/30 bg-white/10 px-8 py-3.5 text-xs font-semibold uppercase tracking-widest text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:border-white/50"
                >
                  Contact Atelier
                </Link>
              </div>

              {/* Quick storefront perks */}
              <div className="mt-10 grid grid-cols-3 gap-4 border-t border-white/20 pt-6 text-white/80">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                  <span className="text-xs font-medium">100% Pure Cotton Lining</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                  <span className="text-xs font-medium">Pan-India Delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                  <span className="text-xs font-medium">Instant WhatsApp Support</span>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Statement Section */}
      <section className="section-editorial">
        <ScrollReveal delay={0.2} duration={0.8}>
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent-primary)] mb-4">Our Story</p>
            <h2 className="font-display text-section text-[var(--text-primary)]">
              Where tradition meets contemporary elegance
            </h2>
            <p className="mt-6 text-body text-[var(--text-secondary)] max-w-2xl mx-auto">
              Each piece is lovingly handcrafted with premium fabrics, ensuring your little ones shine at every celebration. From intimate family gatherings to grand festive occasions, Kandamma Kids brings the perfect blend of comfort and style.
            </p>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Collection Section */}
      <section className="section-editorial bg-[var(--surface)]">
        <ScrollReveal delay={0.3} duration={0.8}>
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.25em] text-[var(--accent-primary)]">Curated Favorites</p>
                <h2 className="font-display text-section">Featured Pieces</h2>
              </div>
              <Link to="/shop" className="text-sm font-semibold text-[var(--accent-primary)] hover:underline">
                View all pieces →
              </Link>
            </div>
          </div>
        </ScrollReveal>
        
        <div className="mx-auto max-w-6xl">
          <StaggerReveal staggerDelay={0.15} className={`grid gap-6 sm:grid-cols-2 ${products.length >= 3 ? "lg:grid-cols-4" : products.length === 2 ? "lg:grid-cols-2 max-w-2xl" : "lg:grid-cols-1 max-w-md"}`}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* Editorial Showcase Section */}
      <section className="section-editorial">
        <div className="mx-auto max-w-6xl">
          <ScrollReveal delay={0.4} duration={0.8}>
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent-primary)] mb-4">Craftsmanship</p>
                <h2 className="font-display text-section mb-6">Artisanal Excellence</h2>
                <p className="text-body text-[var(--text-secondary)] mb-6">
                  Our garments are crafted by skilled artisans who have inherited generations of textile wisdom. Every stitch tells a story of dedication, precision, and love for the craft.
                </p>
                <p className="text-body text-[var(--text-secondary)]">
                  We source only the finest fabrics - soft cottons, luxurious silks, and comfortable blends that feel gentle against delicate skin while maintaining the richness of traditional Indian textiles.
                </p>
              </div>
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
                <img
                  src={heroProduct?.image || FALLBACK_HERO}
                  alt="Artisanal craftsmanship"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Shop By Age Section */}
      <section className="section-editorial bg-[var(--surface)]">
        <ScrollReveal delay={0.5} duration={0.8}>
          <div className="mx-auto max-w-6xl text-center">
            <p className="text-[11px] uppercase tracking-[0.32em] text-[var(--accent-primary)] mb-4">Find Your Size</p>
            <h2 className="font-display text-section mb-8">Shop by Age</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {["1-4 Years", "2-5 Years", "4-8 Years", "5-8 Years"].map((age) => (
                <Link
                  key={age}
                  to="/shop"
                  className="group relative aspect-square rounded-xl overflow-hidden border border-[var(--border)] transition-all hover:border-[var(--accent-primary)] hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-[var(--accent-primary)]/5 group-hover:bg-[var(--accent-primary)]/10 transition-colors" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display text-2xl font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                      {age}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>
    </>
  );
}