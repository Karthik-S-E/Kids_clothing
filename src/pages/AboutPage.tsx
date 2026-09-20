import { useState } from "react";
import { Play, X, ArrowRight, ShieldCheck, Heart, Users } from "lucide-react";

export function AboutPage() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white font-sans text-stone-900 pt-16 sm:pt-20">
      {/* 1. Hero Corporate Video Banner (Flipkart Style) */}
      <section className="relative h-[65vh] sm:h-[75vh] w-full overflow-hidden bg-black flex items-end">
        {/* Background Looping Video */}
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          >
            {/* Change this URL or point to /hero-video.mp4 inside your public/ folder */}
            <source
              src="https://assets.mixkit.co/videos/preview/mixkit-sewing-machine-working-on-a-garment-41584-large.mp4"
              type="video/mp4"
            />
          </video>

          {/* Bottom Gradient so text stands out crisply */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-black/10" />

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
                <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-full bg-white text-stone-900 shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="h-5 w-5 fill-current ml-0.5" />
                </div>
                <span>Watch Video</span>
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/20">
            <span className="text-[11px] font-mono uppercase tracking-[0.3em] text-stone-400">
              Video · The Story of Kandamma Kids
            </span>
          </div>
        </div>
      </section>

      {/* 2. Corporate Brand Section */}
      <section className="bg-[#007bd4] py-16 sm:py-24 text-white">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Direct Borderless Image */}
            <div className="lg:col-span-5 flex justify-center">
              <img
                src="/Kids_frock_floating_in_air_20260920205440.gif"
                alt="Handcrafted Kids Festive Wear"
                className="w-full max-w-sm rounded-2xl shadow-2xl object-contain"
              />
            </div>

            <div className="lg:col-span-7 space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#ffe11b]">
                The Kandamma Story
              </h2>
              <p className="text-sm sm:text-base leading-relaxed text-blue-50 font-normal">
                Born with the motto <em>"ನಿಮ್ಮ ಮುದ್ದು ಕಂದಮ್ಮಗಳಿಗಾಗಿ"</em>, Kandamma Kids is an artisanal children’s fashion initiative committed to preserving regional textile traditions while designing everyday ease for little ones.
              </p>
              <p className="text-sm sm:text-base leading-relaxed text-blue-50 font-normal">
                Every festive frock, lehenga, and kurta set is crafted in Karnataka with zero-itch stitching, breathable inner mul-cotton linings, and pure celebration in mind. We connect master artisans directly to families looking for handcrafted perfection.
              </p>
              <div className="pt-2">
                <a
                  href="/shop"
                  className="inline-flex items-center gap-2 bg-white text-[#007bd4] font-bold text-xs sm:text-sm uppercase tracking-wider px-6 py-3 rounded hover:bg-stone-100 transition shadow"
                >
                  Explore The Collection <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Pillars / Corporate Values */}
      <section className="py-16 sm:py-20 bg-stone-50">
        <div className="mx-auto max-w-7xl px-6 sm:px-12 lg:px-20">
          <div className="mb-12">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#007bd4]">
              Our Foundations
            </span>
            <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 mt-1 font-bold">
              What We Stand For
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-xs">
              <ShieldCheck className="h-8 w-8 text-[#007bd4] mb-4" />
              <h4 className="font-bold text-base text-stone-900 mb-2">Artisan Authenticity</h4>
              <p className="text-xs leading-relaxed text-stone-600">
                Direct partnerships with weavers and craft clusters across South India to honor genuine hand-embroidery and pure festive materials.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-xs">
              <Heart className="h-8 w-8 text-[#ff3e6c] mb-4" />
              <h4 className="font-bold text-base text-stone-900 mb-2">Pure Cotton Comfort</h4>
              <p className="text-xs leading-relaxed text-stone-600">
                Soft inner linings and protected seams so children can play, run, and celebrate without irritable chafing or discomfort.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-xs">
              <Users className="h-8 w-8 text-emerald-600 mb-4" />
              <h4 className="font-bold text-base text-stone-900 mb-2">Pan-India Reach</h4>
              <p className="text-xs leading-relaxed text-stone-600">
                Doorstep dispatch across all pin codes in India with real-time package tracking and personal support on WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Video Lightbox Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-4xl bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/20">
            <button
              type="button"
              onClick={() => setIsVideoOpen(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-white hover:text-black transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video w-full">
              <iframe
                className="h-full w-full"
                src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?autoplay=1"
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