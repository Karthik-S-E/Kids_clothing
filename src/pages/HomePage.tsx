import { Link } from "react-router-dom";
import { Sparkles, ShieldCheck, Truck, MessageCircle, ArrowRight, Award, Star } from "lucide-react";
import { ProductCard } from "../components/ProductCard";
import { ScrollReveal, StaggerReveal } from "../components/ScrollReveal";
import { Marquee } from "../components/Marquee";
import { useProductStore } from "../store/productStore";
import { whatsappChatUrl } from "../lib/whatsapp";

const HERO_MOTION_IMAGE = "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=2144&auto=format&fit=crop";

export function HomePage() {
  const allProducts = useProductStore((s) => s.products);
  const products = allProducts.slice(0, 4);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Notification Bar */}
      <div className="bg-[#1f1a14] text-[var(--accent-primary)] py-2.5 px-4 text-center text-xs tracking-[0.25em] font-medium">
        <span>✨ Festive Collection · Easy Order & Help on WhatsApp</span>
      </div>

      {/* Marquee Bar */}
      <div className="relative z-10 py-3.5 border-b border-[var(--border)] bg-[var(--surface)]">
        <Marquee speed={35} className="text-xs tracking-[0.3em] font-medium text-[var(--text-primary)]">
          <span className="mx-8">Handmade Quality</span>
          <span className="text-[var(--accent-primary)] select-none" aria-hidden="true">•</span>
          <span className="mx-8">100% Pure Cotton Lining</span>
          <span className="text-[var(--accent-primary)] select-none" aria-hidden="true">•</span>
          <span className="mx-8">Direct WhatsApp Ordering</span>
          <span className="text-[var(--accent-primary)] select-none" aria-hidden="true">•</span>
          <span className="mx-8">All-India Fast Delivery</span>
          <span className="text-[var(--accent-primary)] select-none" aria-hidden="true">•</span>
        </Marquee>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-[#0a0f0d] isolate">
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <img
            src={HERO_MOTION_IMAGE}
            alt="Kids Ethnic Festive Collection"
            loading="eager"
            fetchPriority="high"
            className="w-full h-full object-cover object-center opacity-40 contrast-[1.05] animate-kenburns"
          />
          <div className="absolute inset-0 bg-[#0a0f0d]/75" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-12 py-24 w-full">
          <ScrollReveal delay={0.1} duration={0.9} direction="up">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-[#141414] px-5 py-2 text-xs font-semibold tracking-[0.3em] text-[var(--accent-primary)]">
                <Sparkles className="h-4 w-4 text-[var(--accent-primary)]" />
                Festive Collection 2026
              </div>

              <h1 className="font-display text-5xl sm:text-7xl lg:text-7xl text-white font-normal tracking-tight leading-[1.05]">
                Traditional Indian Wear for <span className="text-[var(--accent-primary)] italic font-serif">Little Kids</span>.
              </h1>

              <p className="mt-6 max-w-xl text-lg sm:text-xl font-light leading-relaxed text-white/90">
                Traditional kurtas, lehengas, and festive sets made for children. Lined with soft cotton so they stay comfortable all day.
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-5">
                <Link
                  to="/shop"
                  className="group inline-flex items-center gap-3 rounded-full bg-[var(--accent-primary)] px-8 py-4 text-sm font-semibold text-black shadow-2xl transition-all hover:brightness-110 hover:scale-105 active:scale-95"
                >
                  Explore Collection
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href={whatsappChatUrl("Hi Kandamma! I would like recommendations for my child's outfit.")}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/60 bg-[#141414] px-8 py-4 text-sm font-medium text-white transition-all hover:bg-black"
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  Order on WhatsApp
                </a>
              </div>

              <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 border-t border-white/15 pt-8">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] border border-white/20 text-[var(--accent-primary)]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider text-white">Pure Comfort</p>
                    <p className="text-xs text-white/80">100% Breathable Cotton Lining</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] border border-white/20 text-[var(--accent-primary)]">
                    <Truck className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider text-white">Fast Delivery</p>
                    <p className="text-xs text-white/80">Delivered Across All of India</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] border border-white/20 text-[var(--accent-primary)]">
                    <MessageCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold tracking-wider text-white">Easy WhatsApp Order</p>
                    <p className="text-xs text-white/80">Quick Replies & Custom Sizes</p>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Brand Promise Section */}
      <section className="py-24 px-6 lg:px-12 bg-[var(--background)]">
        <ScrollReveal delay={0.2} duration={0.8}>
          <div className="mx-auto max-w-4xl text-center">
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] text-[var(--accent-primary)] mb-4">
              <Award className="h-4 w-4" />
              The Kandamma Promise
            </div>
            <h2 className="font-display text-4xl sm:text-5xl font-normal text-[var(--text-primary)] leading-tight">
              Festive dresses made comfortable for children
            </h2>

            <p className="mt-6 text-lg sm:text-xl text-[var(--text-secondary)] font-light leading-relaxed">
              Kids’ festive clothes should feel gentle on soft skin. We make every piece with light cotton and silk so children can run, play, and celebrate happily without irritation.
            </p>

            <div className="mt-10 flex justify-center items-center gap-8 text-[var(--text-secondary)] text-sm tracking-widest flex-wrap">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
                <span>Zero-itch fabrics</span>
              </div>
              <span className="text-[var(--accent-primary)]" aria-hidden="true">•</span>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
                <span>Soft inner lining</span>
              </div>
              <span className="text-[var(--accent-primary)]" aria-hidden="true">•</span>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-[var(--accent-primary)] fill-[var(--accent-primary)]" />
                <span>Comfortable fitting</span>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* Featured Pieces */}
      <section className="py-24 px-6 lg:px-12 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-primary)] mb-2">Popular Outfits</p>
              <h2 className="font-display text-4xl sm:text-5xl font-normal text-[var(--text-primary)]">Featured Outfits</h2>
            </div>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.2em] text-[var(--accent-primary)] hover:underline"
            >
              View all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <StaggerReveal staggerDelay={0.15} className={`grid gap-8 sm:grid-cols-2 ${products.length >= 3 ? "lg:grid-cols-4" : products.length === 2 ? "lg:grid-cols-2 max-w-3xl" : "lg:grid-cols-1 max-w-md"}`}>
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* WhatsApp CTA Section */}
      <section className="py-20 px-6 lg:px-12 bg-[#0d1210] relative isolate">
        <div className="relative z-10 mx-auto max-w-5xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#052e16] border border-[#22c55e]/40 px-4 py-1.5 text-xs font-bold tracking-[0.2em] text-[#22c55e] mb-6">
            <MessageCircle className="h-4 w-4 text-[#22c55e]" />
            Fast Ordering via WhatsApp
          </div>
          <h2 className="font-display text-4xl sm:text-5xl font-normal text-white">
            Want to order directly on <span className="text-[var(--accent-primary)] italic">WhatsApp</span>?
          </h2>

          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto font-light leading-relaxed">
            Send us a screenshot of the dress or share your child’s age. We will help you select the right size and confirm your order immediately!
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a
              href={whatsappChatUrl("Hi Kandamma! I am looking at your website and want to order an outfit.")}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-3 rounded-full bg-[#25D366] px-10 py-4 text-xs font-bold tracking-[0.2em] text-white shadow-2xl transition-all hover:bg-[#20ba59] hover:scale-105"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              Chat with Us on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* Shop by Age */}
      <section className="py-24 px-6 lg:px-12 bg-[var(--background)]">
        <div className="mx-auto max-w-7xl text-center">
          <p className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-primary)] mb-3">Find the right fit</p>
          <h2 className="font-display text-4xl sm:text-5xl font-normal text-[var(--text-primary)] mb-12">Shop by Age</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["1-4 Years", "2-5 Years", "4-8 Years", "5-8 Years"].map((age) => (
              <Link
                key={age}
                to={`/shop?age=${encodeURIComponent(age)}`}
                className="group relative aspect-[4/5] rounded-2xl overflow-hidden border border-[var(--border)] bg-[#121212] p-6 flex flex-col justify-end transition-all hover:border-[var(--accent-primary)] hover:shadow-2xl"
              >
                <div className="absolute inset-0 bg-[#000000]/60 pointer-events-none" />
                <div className="relative z-10 text-left bg-[#121212]/90 p-4 rounded-xl border border-white/10">
                  <span className="text-xs font-semibold tracking-[0.3em] text-[var(--accent-primary)] block mb-1">Age Group</span>
                  <span className="font-display text-2xl text-white font-normal group-hover:text-[var(--accent-primary)] transition-colors block">
                    {age}
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs tracking-widest text-white group-hover:underline">
                    View Dresses <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
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