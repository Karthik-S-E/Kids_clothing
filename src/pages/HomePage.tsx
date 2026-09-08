import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Truck, MessageCircle, ArrowRight, Award, Star } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { ScrollReveal, StaggerReveal } from "../components/ScrollReveal";
import { Marquee } from "../components/Marquee";
import { useProductStore } from "../store/productStore";
import { whatsappChatUrl } from "../lib/whatsapp";

const FALLBACK_HERO = "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=1600&q=85";

export function HomePage() {
  const allProducts = useProductStore((s) => s.products);
  const heroProduct = allProducts[0];
  const products = allProducts.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      <div className="bg-[var(--text-primary)] text-[var(--background)] py-2.5 px-4 text-center text-xs tracking-[0.25em] font-medium uppercase">
        <span>✨ Bespoke Festive Collection · Instant Order & Support via WhatsApp</span>
      </div>

      <div className="py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <Marquee speed={35} className="text-xs uppercase tracking-[0.3em] text-[var(--text-secondary)] font-medium">
          <span className="mx-8">Handcrafted Luxury</span>
          <span className="mx-8 text-[var(--accent-primary)]">✦</span>
          <span className="mx-8">Pure Cotton Linings</span>
          <span className="mx-8 text-[var(--accent-primary)]">✦</span>
          <span className="mx-8">Direct WhatsApp Ordering</span>
          <span className="mx-8 text-[var(--accent-primary)]">✦</span>
          <span className="mx-8">Pan-India Express Dispatch</span>
          <span className="mx-8 text-[var(--accent-primary)]">✦</span>
        </Marquee>
      </div>

      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-black">
        <div className="absolute inset-0 z-0">
          <img
            src={heroProduct?.image || FALLBACK_HERO}
            alt="Kandamma Luxury Children's Attire"
            className="w-full h-full object-cover opacity-65 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24 w-full">
          <ScrollReveal delay={0.1} duration={0.9} direction="up">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--accent-primary)]/40 bg-[var(--accent-primary)]/10 px-5 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)] backdrop-blur-md">
                <Sparkles className="h-4 w-4" />
                Atelier Collection 2026
              </div>

              <h1 className="font-display text-5xl sm:text-7xl lg:text-8xl text-white font-normal tracking-tight leading-[1.05]">
                Exquisite Ethnic Wear for <span className="text-[var(--accent-primary)] italic font-serif">Little Royals</span>.
              </h1>

              <p className="mt-6 max-w-xl text-lg sm:text-xl font-light leading-relaxed text-white/85">
                Handcrafted traditional kurtas, regal lehengas, and celebration sets tailored with ultra-soft cotton linings for absolute comfort and pristine elegance.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-3 rounded-full bg-[var(--accent-primary)] px-9 py-4 text-xs font-bold uppercase tracking-[0.2em] text-[var(--text-primary)] shadow-2xl transition-all hover:bg-[var(--color-gold-light)] hover:scale-105 active:scale-95"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href={whatsappChatUrl("Hi Kandamma! I would like to consult with an atelier stylist for a custom outfit recommendation.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/30 bg-white/10 px-9 py-4 text-xs font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md transition-all hover:bg-white/20 hover:border-white/60"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  WhatsApp Concierge
                </a>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/15 pt-8 text-white/80">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-[var(--accent-primary)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">Pure Comfort</p>
                    <p className="text-[11px] text-white/70">100% Breathable Cotton Lining</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-[var(--accent-primary)]">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">Express Dispatch</p>
                    <p className="text-[11px] text-white/70">Pan-India Secure Delivery</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 border border-white/20 text-[var(--accent-primary)]">
                    <MessageCircle className="h-5 w-5 text-[#25D366]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-white">Direct WhatsApp</p>
                    <p className="text-[11px] text-white/70">Instant Order & Customization</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-[var(--background)]">
        <ScrollReveal delay={0.2} duration={0.8}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-4">
              <Award className="h-4 w-4" />
              The Kandamma Standard
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-normal text-[var(--text-primary)] leading-tight">
              Where heritage craftsmanship meets modern refinement
            </h2>
            <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
              We believe children's festive wear should never compromise on comfort. Each garment is meticulously crafted by generational artisans using feather-light silks and handloom cottons designed for joyous celebrations.
            </p>
            <div className="mt-10 flex justify-center items-center gap-8 text-[var(--text-secondary)] text-sm uppercase tracking-widest flex-wrap">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
                <span>Zero Itch Fabrics</span>
              </div>
              <span className="text-[var(--accent-primary)]">•</span>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
                <span>Hand-finished Motifs</span>
              </div>
              <span className="text-[var(--accent-primary)]">•</span>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
                <span>Bespoke Sizing</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-2">Curated Masterpieces</p>
              <h2 className="font-display text-4xl sm:text-5xl font-normal text-[var(--text-primary)]">Featured Atelier Pieces</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--accent-primary)] hover:underline"
            >
              View Complete Collection <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <StaggerReveal staggerDelay={0.15} className={`grid gap-8 sm:grid-cols-2 ${products.length >= 3 ? "lg:grid-cols-4" : products.length === 2 ? "lg:grid-cols-2 max-w-3xl" : "lg:grid-cols-1 max-w-md"}`}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      <section className="py-20 px-6 lg:px-12 bg-gradient-to-br from-[var(--text-primary)] to-black text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#d4af37_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-[#25D366] mb-6">
            <MessageCircle className="h-4 w-4" />
            Direct WhatsApp Concierge
          </div>
          <h2 className="font-display text-4xl sm:text-6xl font-normal text-white">
            Prefer ordering directly via <span className="text-[#25D366] italic">WhatsApp</span>?
          </h2>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Send us screenshots of your favorite pieces or discuss custom sizing directly with our senior stylists. We respond within minutes!
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappChatUrl("Hi Kandamma! I am browsing your website and would like assistance with an order.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-10 py-4 text-xs font-bold uppercase tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-[#20ba59] hover:scale-105"
            >
              <MessageCircle className="h-5 w-5" />
              Chat With Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className="py-24 px-6 lg:px-12 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)] mb-3">Tailored By Age</p>
          <h2 className="font-display text-4xl sm:text-5xl font-normal text-[var(--text-primary)] mb-12">Shop by Age Group</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["1-4 Years", "2-5 Years", "4-8 Years", "5-8 Years"].map((age) => (
              <Link
                key={age}
                to={`/shop?age=${encodeURIComponent(age)}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] p-8 flex flex-col justify-end transition-all hover:border-[var(--accent-primary)] hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent group-hover:from-black/90 transition-colors" />
                <div className="relative z-10 text-left">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--accent-primary)] block mb-1">Collection</span>
                  <span className="font-display text-2xl sm:text-3xl text-white font-normal group-hover:text-[var(--accent-primary)] transition-colors block">
                    {age}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-white/80 group-hover:text-white">
                    Browse <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
