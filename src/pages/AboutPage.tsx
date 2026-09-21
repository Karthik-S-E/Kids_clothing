import { useState } from "react";
import { Link } from "react-router-dom";
import { Play, X, ArrowRight, ShieldCheck, Heart, Users } from "lucide-react";

export function AboutPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white font-sans text-stone-900 pt-16 sm:pt-20">
      {/* 1. Hero Corporate Video Banner with YouTube Background */}
      <section className="relative h-[65vh] sm:h-[75vh] w-full overflow-hidden bg-black flex items-end">
        {/* Responsive YouTube Looping Background Video */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] min-w-full min-h-full h-[56.25vw]"
            src="https://www.youtube.com/embed/wTB7OmUP0V4?autoplay=1&mute=1&loop=1&playlist=wTB7OmUP0V4&controls=0&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&playsinline=1"
            title="Kandamma Kids Video"
            allow="autoplay; encrypted-media"
          />

          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

          {/* Dotted Grid Pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(#ffffff 1.2px, transparent 1.2px)",
              backgroundSize: "18px 18px",
            }}
          />
        </div>

        {/* Hero Bottom Content & Watch Video Button */}
        <div className="relative z-10 w-full px-6 sm:px-12 lg:px-20 pb-10">
          <div className="mx-auto max-w-7xl flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <p className="font-serif italic text-2xl sm:text-4xl lg:text-5xl text-white font-normal leading-tight drop-shadow-md">
                "...Kandamma Kids would be the most heartfelt platform to bring authentic handcrafted children’s festive wear pan-India."
              </p>
            </div>

            <div className="shrink-0">
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="group inline-flex items-center gap-3 text-white uppercase tracking-wider text-xs sm:text-sm font-bold hover:opacity-80 transition cursor-pointer"
              >
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-[#ff3e6c] shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-pink-200">
              Video · The Story of Kandamma Kids
            </span>
          </div>
        </div>
      </section>

      {/* 2. Brand Section - Soft Pastel Pink */}
      <section className="bg-gradient-to-br from-[#fff1f3] via-[#ffe4e8] to-[#ffd8df] py-16 sm:py-24 text-stone-900 border-y border-pink-200/60">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Direct Floating GIF Image */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative rounded-3xl p-3 bg-white/70 backdrop-blur-xs shadow-xl ring-1 ring-pink-200/80">
                <img
                  src="/Kids_frock_floating_in_air_20260920205440.gif"
                  alt="Handcrafted Kids Festive Wear"
                  className="w-full max-w-sm rounded-2xl object-contain"
                />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-5">
              <span className="inline-block rounded-full bg-[#ff3e6c]/10 border border-[#ff3e6c]/20 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#ff3e6c]">
                Our Heritage & Roots
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal tracking-tight text-stone-900">
                The Kandamma Story
              </h2>

              <p className="text-sm sm:text-base leading-relaxed text-stone-700 font-normal">
                Born with the motto <em className="text-[#ff3e6c] font-semibold not-italic">"ನಿಮ್ಮ ಮುದ್ದು ಕಂದಮ್ಮಗಳಿಗಾಗಿ"</em>, Kandamma Kids is an artisanal children’s fashion initiative committed to preserving regional textile traditions while designing everyday ease for little ones.
              </p>

              <p className="text-sm sm:text-base leading-relaxed text-stone-700 font-normal">
                Every festive frock, lehenga, and kurta set is crafted in Karnataka with zero-itch stitching, breathable inner mul-cotton linings, and pure celebration in mind. We connect master artisans directly to families looking for handcrafted perfection.
              </p>

              <div className="pt-2">
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 bg-[#ff3e6c] text-white font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded-xl hover:bg-[#e7335e] transition shadow-md shadow-pink-500/20"
                >
                  Explore The Collection <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars / Values */}
      <section className="py-16 sm:py-20 bg-[#FAF7F2]">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#ff3e6c]">
              Our Foundations
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1 font-bold">
              What We Stand For
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
              <ShieldCheck className="h-8 w-8 text-[#ff3e6c] mb-4" />
              <h4 className="font-bold text-base text-stone-900 mb-2">Artisan Authenticity</h4>
              <p className="text-xs leading-relaxed text-stone-600">
                Direct partnerships with weavers and craft clusters across South India to honor genuine hand-embroidery and pure festive materials.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
              <Heart className="h-8 w-8 text-[#ff3e6c] mb-4" />
              <h4 className="font-bold text-base text-stone-900 mb-2">Pure Cotton Comfort</h4>
              <p className="text-xs leading-relaxed text-stone-600">
                Soft inner linings and protected seams so children can play, run, and celebrate without irritable chafing or discomfort.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-xs">
              <Users className="h-8 w-8 text-[#ff3e6c] mb-4" />
              <h4 className="font-bold text-base text-stone-900 mb-2">Pan-India Reach</h4>
              <p className="text-xs leading-relaxed text-stone-600">
                Doorstep dispatch across all pin codes in India with real-time package tracking and personal support on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. YouTube Lightbox Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/70 text-white hover:bg-white hover:text-black transition cursor-pointer"
              aria-label="Close Video"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/wTB7OmUP0V4?autoplay=1&rel=0"
                title="Kandamma Kids Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default AboutPage;