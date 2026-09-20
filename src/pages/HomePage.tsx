import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowRight, 
  Heart 
} from "lucide-react";
import { useProductStore } from "../store/productStore";
import { formatINR } from "../lib/formatINR";
import { useWishlistStore } from "../store/wishlistStore";
import { getAnimationProps } from "../lib/motion";

// Vector Indian Flag component to render consistently across all desktop and mobile platforms
function IndiaFlag({ className = "h-3.5 w-5" }: { className?: string }) {
  return (
    <svg 
      className={`inline-block shrink-0 rounded-[2px] shadow-2xs ${className}`} 
      viewBox="0 0 640 480"
      aria-label="Indian Flag"
      role="img"
    >
      <path fill="#f93" d="M0 0h640v160H0z" />
      <path fill="#fff" d="M0 160h640v160H0z" />
      <path fill="#128807" d="M0 320h640v160H0z" />
      <g transform="matrix(3.2 0 0 3.2 320 240)">
        <circle r="20" fill="#008" />
        <circle r="17.5" fill="#fff" />
        <circle r="3.5" fill="#008" />
        <g id="spokes">
          <g id="two-spokes">
            <line y2="17.5" stroke="#008" strokeWidth=".8" />
            <line y2="-17.5" stroke="#008" strokeWidth=".8" />
          </g>
          <use href="#two-spokes" transform="rotate(15)" />
          <use href="#two-spokes" transform="rotate(30)" />
          <use href="#two-spokes" transform="rotate(45)" />
          <use href="#two-spokes" transform="rotate(60)" />
          <use href="#two-spokes" transform="rotate(75)" />
        </g>
        <use href="#spokes" transform="rotate(90)" />
      </g>
    </svg>
  );
}

// Editorial slides matching Their Nibs aesthetic
const HERO_SLIDES = [
  {
    image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=2000&auto=format&fit=crop",
    title: "New shapes, fresh prints, instant favourites.",
    subTitle: "HANDCRAFTED KIDS FESTIVE & LOUNGEWEAR",
    buttonText: "SHOP NEW IN",
    link: "/shop"
  },
  {
    image: "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=2000&auto=format&fit=crop",
    title: "Children's Festive Sets",
    subTitle: "PRINTS, HERITAGE BORDERS & PURE COTTON COMFORT",
    buttonText: "EXPLORE COLLECTION",
    link: "/shop"
  },
  {
    image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=2000&auto=format&fit=crop",
    title: "Soft Pastel Party Frocks",
    subTitle: "FEATHER-LIGHT TULLE & GENTLE SILK",
    buttonText: "VIEW GIRLS WEAR",
    link: "/shop?gender=Girl"
  },
  {
    image: "https://images.unsplash.com/photo-1617331140180-e8262094733a?q=80&w=2000&auto=format&fit=crop",
    title: "Heirloom Floral Lehengas",
    subTitle: "TIMELESS TRADITIONS FOR LITTLE ONES",
    buttonText: "DISCOVER LEHENGAS",
    link: "/shop"
  },
  {
    image: "https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=2000&auto=format&fit=crop",
    title: "Pure Cotton Festive Kurtas",
    subTitle: "BREATHABLE INNER LININGS · ZERO ITCH",
    buttonText: "SHOP FESTIVE",
    link: "/shop"
  }
];

export function HomePage() {
  const allProducts = useProductStore((s) => s.products);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeTab, setActiveTab] = useState<"new" | "bestsellers" | "purecotton">("new");

  const { toggleWishlist, isInWishlist } = useWishlistStore();

  // Carousel auto-rotate
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[currentSlide];

  return (
    <div className="flex min-h-screen flex-col bg-[#faf6f2] font-['Poppins',sans-serif] text-[#1d1d1b] antialiased">
      
      {/* 2. Full Bleed Editorial Hero with Vintage Gradient Overlay */}
      <section className="relative h-[65vh] sm:h-[78vh] lg:h-[84vh] w-full overflow-hidden bg-stone-900">
        <div className="relative h-full w-full">
          <img
            key={slide.image}
            src={slide.image}
            alt={slide.title}
            className="h-full w-full object-cover object-center transition-all duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/20 to-black/10 mix-blend-multiply" />
          <div className="absolute inset-0 bg-[#f6b49e]/10 mix-blend-color" />
        </div>

        <motion.div 
          className="absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center text-white"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3,
              },
            },
          }}
        >
          <motion.p 
            className="mb-2 text-xs font-semibold tracking-[0.25em] text-white/90 uppercase drop-shadow-xs"
            {...getAnimationProps({
              variants: {
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.4, 0.0, 0.2, 1] } },
              },
            })}
          >
            {slide.subTitle}
          </motion.p>
          
          <motion.h1 
            className="max-w-3xl font-serif text-3xl sm:text-5xl lg:text-6xl font-normal leading-tight tracking-tight drop-shadow-md"
            {...getAnimationProps({
              variants: {
                hidden: { opacity: 0, scale: 0.8 },
                visible: { 
                  opacity: 1, 
                  scale: 1,
                  transition: { 
                    type: "spring",
                    damping: 15,
                    stiffness: 300,
                    duration: 0.6 
                  } 
                },
              },
            })}
          >
            {slide.title}
          </motion.h1>

          <motion.div 
            {...getAnimationProps({
              variants: {
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] } },
              },
            })}
          >
            <Link
              to={slide.link}
              className="mt-8 inline-block rounded-none bg-white px-8 py-3.5 text-xs font-bold tracking-[0.2em] text-[#1d1d1b] shadow-xl transition-all duration-200 hover:bg-[#1d1d1b] hover:text-white"
            >
              {slide.buttonText}
            </Link>
          </motion.div>
        </motion.div>

        <div className="absolute bottom-5 left-0 right-0 z-20 flex items-center justify-center gap-4 text-white">
          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
            className="p-1 hover:opacity-75 transition cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentSlide(i)}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all ${
                  currentSlide === i ? "w-6 bg-white" : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length)}
            className="p-1 hover:opacity-75 transition cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* 3. Category Tab Bar */}
      <section className="mx-auto max-w-7xl px-6 pt-12 pb-4 w-full">
        <div className="flex items-center justify-between border-b border-[#1d1d1b]/15 pb-4">
          <div className="flex items-center gap-6 sm:gap-10 text-sm sm:text-base font-serif tracking-wide">
            <button
              type="button"
              onClick={() => setActiveTab("new")}
              className={`pb-1 transition-all ${
                activeTab === "new"
                  ? "border-b-2 border-[#1d1d1b] font-semibold text-[#1d1d1b]"
                  : "text-[#1d1d1b]/60 hover:text-[#1d1d1b]"
              }`}
            >
              New In
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("bestsellers")}
              className={`pb-1 transition-all ${
                activeTab === "bestsellers"
                  ? "border-b-2 border-[#1d1d1b] font-semibold text-[#1d1d1b]"
                  : "text-[#1d1d1b]/60 hover:text-[#1d1d1b]"
              }`}
            >
              Best Sellers
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("purecotton")}
              className={`pb-1 transition-all ${
                activeTab === "purecotton"
                  ? "border-b-2 border-[#1d1d1b] font-semibold text-[#1d1d1b]"
                  : "text-[#1d1d1b]/60 hover:text-[#1d1d1b]"
              }`}
            >
              Cotton Lined & Festive
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-[#1d1d1b]">
            <span className="text-xs tracking-wider uppercase text-[#1d1d1b]/60">Explore All</span>
            <Link to="/shop" className="p-1 hover:translate-x-1 transition-transform">
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Editorial Product Grid (Clean Myntra-style Wishlist Cards) */}
      <section className="mx-auto max-w-7xl px-6 py-8 w-full">
        <motion.div 
          className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {allProducts.slice(0, 8).map((product, index) => {
            const isWishlisted = isInWishlist(product.id);

            // Dynamic discount math using admin's discountPercent
            const discountPercent = Number(product.discountPercent) || 0;
            const hasDiscount = discountPercent > 0 && discountPercent < 100;
            const mrp = hasDiscount
              ? Math.round(product.price / (1 - discountPercent / 100))
              : product.price;

            const handleWishlist = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist(product);
            };

            return (
              <motion.div 
                key={product.id} 
                className="group flex flex-col text-left"
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] }
                  },
                }}
              >
                {/* Product Image Frame */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-[#eee6de]">
                  <Link to={`/shop/${product.id}`} className="block h-full w-full">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="h-full w-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
                    />
                  </Link>

                  {/* Corner age tag */}
                  <span className="absolute top-2 left-2 bg-white/90 px-2 py-0.5 text-[10px] font-medium tracking-wider uppercase text-[#1d1d1b]">
                    {product.ageRange}
                  </span>

                  {/* Myntra-Style Floating Wishlist Heart */}
                  <motion.button
                    type="button"
                    onClick={handleWishlist}
                    className="absolute right-2.5 top-2.5 flex h-12 w-12 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs shadow-md cursor-pointer"
                    aria-label="Wishlist toggle"
                    whileTap={{ scale: 0.9 }}
                  >
                    <Heart
                      className={`h-5 w-5 transition-colors ${
                        isWishlisted ? "fill-[#ff3e6c] text-[#ff3e6c]" : "text-stone-600 hover:text-stone-900"
                      }`}
                    />
                  </motion.button>
                </div>

                {/* Product Typography & Pricing */}
                <div className="pt-3">
                  <p className="text-[11px] font-medium uppercase tracking-widest text-[#1d1d1b]/60">
                    {product.gender}
                  </p>
                  <Link
                    to={`/shop/${product.id}`}
                    className="mt-0.5 block line-clamp-1 font-serif text-[15px] sm:text-[16px] text-[#1d1d1b] hover:underline"
                  >
                    {product.name}
                  </Link>

                  {/* Price, Dynamic Strikethrough MRP & % OFF */}
                  <div className="mt-1 flex flex-wrap items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-bold text-[#1d1d1b]">
                      {formatINR(product.price)}
                    </span>
                    {hasDiscount && (
                      <>
                        <span className="text-[11px] sm:text-xs text-stone-500 line-through font-medium">
                          MRP {formatINR(mrp)}
                        </span>
                        <span className="text-[11px] sm:text-xs font-bold text-amber-700">
                          ({discountPercent}% OFF)
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 5. Minimalist Heritage Story Banner */}
      <section className="my-12 bg-[#f3e7df] px-6 py-16 text-center">
        <div className="mx-auto max-w-2xl">
          <span className="inline-flex items-center justify-center gap-2 text-xs font-bold tracking-[0.25em] text-[#1d1d1b]/70 uppercase">
            <span>Pure Heritage · Made In India</span>
            <IndiaFlag className="h-3 w-4" />
          </span>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-[#1d1d1b] font-normal">
            Soft Prints Designed for Little Celebrations
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#1d1d1b]/80">
            Every garment is tailored with itch-free seams and 100% breathable mul-cotton inner linings. Designed so children can move freely, celebrate happily, and rest peacefully.
          </p>
          <Link
            to="/shop"
            className="mt-8 inline-block border-b-2 border-[#1d1d1b] pb-1 text-xs font-bold tracking-[0.2em] uppercase hover:opacity-70 transition"
          >
            Read Our Story &gt;
          </Link>
        </div>
      </section>
    </div>
  );
}

export default HomePage;